// \frontend/src/components/TravelSelection.js

import React from 'react';
import { Box, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const TravelSelection = ({ searchTerm, onSearchChange }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search packages by title, country, or description..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          ),
        }}
      />
    </Box>
  );
};

export default TravelSelection;
