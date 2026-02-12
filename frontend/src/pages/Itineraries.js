import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';

function ShowItineraries() {
    const [itineraries, setItineraries] = useState([]);
    const [editingItemKey, setEditingItemKey] = useState(null);
    const [editForm, setEditForm] = useState({ time: "", activity: "", location: "" });
    const { travelId } = useParams()
    const location = useLocation();
    const { listing } = location.state || {};

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        fetch(`http://localhost:3000/travel-listings/${travelId}/itineraries`, requestOptions)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                setItineraries(data)
            })
            .catch(function (error) {
                console.log(error)
            })
    }, [travelId])

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
            {itineraries.length > 0 ? (
                <>
                    <h1>{listing?.title}-{listing?.country}</h1>
                    {itineraries.map((item) => (
                        <div key={item.itineraryID}>
                            <h2>Day {item.day}</h2>
                            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", textAlign: "center"}}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "10%"  }}>Time</th>
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

                    ))}
                </>
            ) : (
                <h1>Stay Tuned for Updated Itineraries</h1>
            )}
        </div>
    )

}

export default ShowItineraries;
