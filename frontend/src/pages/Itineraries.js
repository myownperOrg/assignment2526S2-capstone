import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const defaultAddForm = { day: '', time: '', activity: '', location: '' };

function ShowItineraries() {
const [itineraries, setItineraries] = useState([]);
const [editingItemKey, setEditingItemKey] = useState(null);
const [editForm, setEditForm] = useState({ time: "", activity: "", location: "" });
const [isAddFormOpen, setIsAddFormOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [addForm, setAddForm] = useState(defaultAddForm);
const { travelId } = useParams()
const location = useLocation();
const { listing } = location.state || {};
const canAddItinerary = isAuthenticated();


const normalizeActivities = (activity) => {
if (Array.isArray(activity)) {
return activity;
}

if (typeof activity === "string") {
try {
const parsedActivity = JSON.parse(activity);
return Array.isArray(parsedActivity) ? parsedActivity : [];
} catch (error) {
console.log("Unable to parse itinerary activity", error);
return [];
}
}

return [];
};

const dedupeItinerariesByDay = (items) => {
const latestByDay = new Map();

(items || []).forEach((item) => {
const dayKey = Number(item.day);
const existing = latestByDay.get(dayKey);

if (!existing || Number(item.itineraryID) > Number(existing.itineraryID)) {
latestByDay.set(dayKey, item);
}
});

return Array.from(latestByDay.values())
.sort((a, b) => Number(a.day) - Number(b.day));
};

const fetchItineraries = useCallback(async () => {
try {
const response = await fetch(`http://localhost:3000/travel-listings/${travelId}/itineraries`, {
method: 'GET',
headers: { 'Content-Type': 'application/json' }
});

const data = await response.json();
const normalized = Array.isArray(data) ? dedupeItinerariesByDay(data) : [];
setItineraries(normalized);
} catch (error) {
console.log(error);
}
}, [travelId]);

useEffect(() => {
fetchItineraries();
}, [fetchItineraries]);


const updateItinerary = async (itineraryID, nextActivities, day) => {
const payload = {
travelID: Number(travelId),
day,
activity: nextActivities,
};

const response = await fetch(`http://localhost:3000/itineraries/${itineraryID}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});

if (!response.ok) {
throw new Error("Failed to update itinerary");
}
};

const deleteItinerary = async (itineraryID) => {
const response = await fetch(`http://localhost:3000/itineraries/${itineraryID}`, {
method: "DELETE",
headers: { "Content-Type": "application/json" },
});

if (!response.ok && response.status !== 204) {
throw new Error("Failed to delete itinerary");
}
};


const createItinerary = async () => {
const token = localStorage.getItem('token');
const payload = {
day: Number(addForm.day),
activity: [{
time: addForm.time,
activity: addForm.activity,
location: addForm.location,
}],
};

const response = await fetch(`http://localhost:3000/travel-listings/${travelId}/itinerary`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
...(token ? { Authorization: `Bearer ${token}` } : {}),
},
body: JSON.stringify(payload),
});

if (!response.ok) {
throw new Error('Failed to create itinerary');
}
};

const handleAddItinerary = async () => {
if (!addForm.day || !addForm.time.trim() || !addForm.activity.trim() || !addForm.location.trim()) {
alert('Please fill in day, time, activity and location.');
return;
}

try {
setIsSubmitting(true);
await createItinerary();
setIsAddFormOpen(false);
setAddForm(defaultAddForm);
await fetchItineraries();
} catch (error) {
console.log(error);
alert('Unable to add itinerary item. Please try again.');
} finally {
setIsSubmitting(false);
}
};

const handleEditStart = (itineraryID, planIndex, plan) => {
setEditingItemKey(`${itineraryID}-${planIndex}`);
setEditForm({
time: plan.time || "",
activity: plan.activity || "",
location: plan.location || "",
});
};

const handleEditSave = async (itineraryID, day, planIndex) => {
try {
const targetItinerary = itineraries.find((item) => item.itineraryID === itineraryID);
if (!targetItinerary) {
return;
}

const existingActivities = normalizeActivities(targetItinerary.activity);
const nextActivities = existingActivities.map((plan, index) => (
index === planIndex ? { ...plan, ...editForm } : plan
));

await updateItinerary(itineraryID, nextActivities, day);

setItineraries((prev) => prev.map((item) => (
item.itineraryID === itineraryID ? { ...item, activity: nextActivities } : item
)));
setEditingItemKey(null);
} catch (error) {
console.log(error);
alert("Unable to save itinerary item. Please try again.");
}
};

const handleDeletePlan = async (itineraryID, day, planIndex) => {
const isConfirmed = window.confirm("Delete this itinerary item?");
if (!isConfirmed) {
return;
}

try {
const targetItinerary = itineraries.find((item) => item.itineraryID === itineraryID);
if (!targetItinerary) {
return;
}

const existingActivities = normalizeActivities(targetItinerary.activity);
const nextActivities = existingActivities.filter((_, index) => index !== planIndex);

if (nextActivities.length === 0) {
await deleteItinerary(itineraryID);
setItineraries((prev) => prev.filter((item) => item.itineraryID !== itineraryID));
} else {
await updateItinerary(itineraryID, nextActivities, day);
setItineraries((prev) => prev.map((item) => (
item.itineraryID === itineraryID ? { ...item, activity: nextActivities } : item
)));
}

if (editingItemKey && editingItemKey.startsWith(`${itineraryID}-`)) {
setEditingItemKey(null);
}
} catch (error) {
console.log(error);
alert("Unable to delete itinerary item. Please try again.");
}
};

return (
<div>
<h1>{listing?.title || 'Travel Itinerary'}-{listing?.country || ''}</h1>

<div style={{ marginBottom: '16px' }}>
<button onClick={() => setIsAddFormOpen((prev) => !prev)} disabled={!canAddItinerary}>
{isAddFormOpen ? 'Cancel Add Itinerary' : 'Add Itinerary'}
</button>
{!canAddItinerary && (
<p style={{ marginTop: '8px' }}>Please sign in to add itineraries.</p>
)}
</div>

{isAddFormOpen && canAddItinerary && (
<div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '12px', borderRadius: '4px' }}>
<h3>Add New Itinerary Item</h3>
<div style={{ display: 'grid', gap: '8px', maxWidth: '450px' }}>
<input
type="number"
placeholder="Day"
value={addForm.day}
onChange={(event) => setAddForm((prev) => ({ ...prev, day: event.target.value }))}
/>
<input
placeholder="Time"
value={addForm.time}
onChange={(event) => setAddForm((prev) => ({ ...prev, time: event.target.value }))}
/>
<input
placeholder="Activity"
value={addForm.activity}
onChange={(event) => setAddForm((prev) => ({ ...prev, activity: event.target.value }))}
/>
<input
placeholder="Location"
value={addForm.location}
onChange={(event) => setAddForm((prev) => ({ ...prev, location: event.target.value }))}
/>
<button onClick={handleAddItinerary} disabled={isSubmitting}>
{isSubmitting ? 'Adding...' : 'Create Itinerary'}
</button>
</div>
</div>
)}



{itineraries.length > 0 ? (
itineraries.map((item) => (
<div key={item.itineraryID}>
<h2>Day {item.day}</h2>
<table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", textAlign: "center" }}>
<thead>
<tr>
<th style={{ width: "10%" }}>Time</th>
<th style={{ width: "45%" }}>Activity</th>
<th style={{ width: "20%" }}>Location</th>
<th style={{ width: "25%" }}>Actions</th>
</tr>
</thead>
<tbody>
{normalizeActivities(item.activity).map((plan, index) => {
const rowKey = `${item.itineraryID}-${index}`;
const isEditing = editingItemKey === rowKey;

return (
<tr key={index}>
<td>
{isEditing ? (
<input
value={editForm.time}
onChange={(event) => setEditForm((prev) => ({ ...prev, time: event.target.value }))}
/>
) : plan.time}
</td>
<td>
{isEditing ? (
<input
value={editForm.activity}
onChange={(event) => setEditForm((prev) => ({ ...prev, activity: event.target.value }))}
/>
) : plan.activity}
</td>
<td>
{isEditing ? (
<input
value={editForm.location}
onChange={(event) => setEditForm((prev) => ({ ...prev, location: event.target.value }))}
/>
) : plan.location}
</td>
<td>
{isEditing ? (
<>
<button onClick={() => handleEditSave(item.itineraryID, item.day, index)}>Save</button>
<button onClick={() => setEditingItemKey(null)}>Cancel</button>
</>
) : (
<>
<button onClick={() => handleEditStart(item.itineraryID, index, plan)}>Edit</button>
<button onClick={() => handleDeletePlan(item.itineraryID, item.day, index)}>Delete</button>
</>
)}
</td>
</tr>
);
})}
</tbody>
</table>
</div>
))
) : (
<h2>Stay Tuned for Updated Itineraries</h2>
)}
</div>
)

}

export default ShowItineraries;
