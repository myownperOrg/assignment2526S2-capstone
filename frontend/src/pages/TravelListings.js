import React, { useState, useEffect } from 'react';
import {
Container,
Typography,
Button,
TextField,
Box,
CircularProgress,
Alert,
Select,
MenuItem,
FormControl,
InputLabel,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
} from '@mui/material';
import { travelService } from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

const defaultListingForm = {
  title: '',
  description: '',
  country: '',
  travelPeriod: '',
  price: '',
  imageURL: '',
};

const TravelListings = () => {
const [listings, setListings] = useState([]);
const [filteredListings, setFilteredListings] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [searchTerm, setSearchTerm] = useState('');
const [selectedId, setSelectedId] = useState('');
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [addListingForm, setAddListingForm] = useState(defaultListingForm);
const [isSubmitting, setIsSubmitting] = useState(false);
const navigate = useNavigate();
const admin = isAdmin();

useEffect(() => {
fetchListings();
}, []);

useEffect(() => {
if (searchTerm.trim()) {
const searchLower = searchTerm.toLowerCase().trim();
const filtered = (listings || []).filter(listing =>
(listing.title && listing.title.toLowerCase().includes(searchLower)) ||
(listing.description && listing.description.toLowerCase().includes(searchLower)) ||
(listing.country && listing.country.toLowerCase().includes(searchLower))
);
setFilteredListings(filtered);
} else {
setFilteredListings(listings || []);
}
}, [searchTerm, listings]);

const fetchListings = async () => {
try {
setLoading(true);
const response = await travelService.getAllListings();
const data = Array.isArray(response.data) ? response.data : [];
setListings(data);
setFilteredListings(data);
} catch (err) {
console.error('Failed to fetch listings:', err);
setError('Failed to load travel listings.');
setListings([]);
setFilteredListings([]);
} finally {
setLoading(false);
}
};

const formatCurrency = (amount) => {
if (!amount) return 'N/A';
const num = parseFloat(amount);
return isNaN(num) ? 'Invalid' :
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

const handleAddListing = async () => {
  if (
    !addListingForm.title.trim() ||
    !addListingForm.description.trim() ||
    !addListingForm.country.trim() ||
    !addListingForm.travelPeriod ||
    !addListingForm.price
  ) {
    setError('Please complete all required fields before creating a listing.');
    return;
  }

  try {
    setIsSubmitting(true);
    setError('');

    await travelService.createListing({
      ...addListingForm,
      travelPeriod: Number(addListingForm.travelPeriod),
      price: Number(addListingForm.price),
      imageURL: addListingForm.imageURL.trim(),
    });

    setIsAddDialogOpen(false);
    setAddListingForm(defaultListingForm);
    await fetchListings();
  } catch (err) {
    console.error('Failed to create listing:', err);
    setError('Failed to create listing. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

if (loading && listings.length === 0) {
return (
<Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
<CircularProgress />
<Typography sx={{ ml: 2 }}>Loading travel listings...</Typography>
</Container>
);
}

return (
<Container maxWidth="md">
<Box sx={{ my: 4 }}>
<Typography variant="h4" component="h1" gutterBottom>
Select Travel Package
</Typography>

<Typography variant="subtitle1" color="text.secondary" paragraph>
Choose a travel package to view itineraries
</Typography>

{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

{admin && (
  <Box sx={{ mb: 3 }}>
    <Button variant="contained" onClick={() => setIsAddDialogOpen(true)}>
      Add Listing
    </Button>
  </Box>
)}

<Box sx={{ mb: 4 }}>
<TextField
fullWidth
variant="outlined"
placeholder="Search packages by title, country, or description..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
/>
</Box>

<FormControl fullWidth sx={{ mb: 3 }}>
<InputLabel>Select Travel Package</InputLabel>
<Select
value={selectedId}
label="Select Travel Package"
onChange={(e) => setSelectedId(e.target.value)}
disabled={filteredListings.length === 0 || loading}
>
<MenuItem value="" disabled>
{filteredListings.length === 0 ? 'No packages available' : 'Choose a package...'}
</MenuItem>
{filteredListings.map((listing) => (
<MenuItem key={listing.travelID} value={listing.travelID}>
{listing.title || 'Untitled'} - {listing.country || 'Unknown'} ({formatCurrency(listing.price)})
</MenuItem>
))}
</Select>
</FormControl>

{selectedId && (
<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
<Button
variant="contained"
size="large"
onClick={() => {
    const selectedListing = filteredListings.find(
      (listing) => listing.travelID === selectedId
    );
    navigate(`/travel-listings/${selectedId}/itineraries`, {state: {listing: selectedListing}});
}}
sx={{ flex: 1 }}
>
View Itineraries
</Button>
<Button
variant="outlined"
size="large"
onClick={() => setSelectedId('')}
>
Clear Selection
</Button>
</Box>
)}

<Box sx={{ mt: 4, textAlign: 'center' }}>
<Typography variant="body2" color="text.secondary">
Showing {filteredListings.length} package{filteredListings.length !== 1 ? 's' : ''}
</Typography>
<Button
variant="outlined"
onClick={fetchListings}
sx={{ mt: 1 }}
>
Refresh List
</Button>
</Box>

<Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle>Add Travel Listing</DialogTitle>
  <DialogContent>
    <TextField margin="dense" label="Title" fullWidth value={addListingForm.title} onChange={(e) => setAddListingForm((prev) => ({ ...prev, title: e.target.value }))} required />
    <TextField margin="dense" label="Description" fullWidth multiline minRows={3} value={addListingForm.description} onChange={(e) => setAddListingForm((prev) => ({ ...prev, description: e.target.value }))} required />
    <TextField margin="dense" label="Country" fullWidth value={addListingForm.country} onChange={(e) => setAddListingForm((prev) => ({ ...prev, country: e.target.value }))} required />
    <TextField margin="dense" label="Travel Period (days)" type="number" fullWidth value={addListingForm.travelPeriod} onChange={(e) => setAddListingForm((prev) => ({ ...prev, travelPeriod: e.target.value }))} required />
    <TextField margin="dense" label="Price" type="number" fullWidth value={addListingForm.price} onChange={(e) => setAddListingForm((prev) => ({ ...prev, price: e.target.value }))} required />
    <TextField margin="dense" label="Image URL" fullWidth value={addListingForm.imageURL} onChange={(e) => setAddListingForm((prev) => ({ ...prev, imageURL: e.target.value }))} />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
    <Button variant="contained" onClick={handleAddListing} disabled={isSubmitting}>Create Listing</Button>
  </DialogActions>
</Dialog>
</Box>
</Container>
);
};

export default TravelListings;
