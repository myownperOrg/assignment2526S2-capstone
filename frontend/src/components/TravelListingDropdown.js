import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const TravelListingDropdown = ({
  listings,
  filteredListings,
  selectedId,
  onChange,
  loading,
  formatCurrency
}) => {
  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Select Travel Package</InputLabel>

      <Select
        value={selectedId}
        label="Select Travel Package"
        onChange={(e) => onChange(e.target.value)}
        disabled={filteredListings.length === 0 || loading}
      >
        <MenuItem value="" disabled>
          {filteredListings.length === 0
            ? 'No packages available'
            : 'Choose a package...'}
        </MenuItem>

        {filteredListings.map((listing) => (
          <MenuItem key={listing.travelID} value={listing.travelID}>
            {listing.title || 'Untitled'} - {listing.country || 'Unknown'} (
            {formatCurrency(listing.price)})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TravelListingDropdown;
