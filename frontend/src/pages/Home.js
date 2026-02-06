import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { isAuthenticated } from '../utils/auth';

const Home = () => {
  const authenticated = isAuthenticated();

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <TravelExploreIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          Travel Agency Portal
        </Typography>
        
        <Typography variant="h6" component="h2" gutterBottom color="text.secondary" sx={{ mb: 4 }}>
          Manage travel packages and itineraries
        </Typography>

        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mb: 4 }}>
          {authenticated ? (
            <>
              <Typography variant="h6" gutterBottom>
                Welcome back!
              </Typography>
              <Typography variant="body1" paragraph>
                You're now ready to manage travel listings and itineraries.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Button 
                  component={RouterLink}
                  to="/travel-listings"
                  variant="contained"
                  size="large"
                  startIcon={<TravelExploreIcon />}
                >
                  Browse Travel Listings
                </Button>
                <Button 
                  component={RouterLink}
                  to="/travel/select"
                  variant="outlined"
                  size="large"
                >
                  Select Travel Package
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Please login to continue
              </Typography>
              <Typography variant="body1" paragraph>
                Access the travel management system by logging in with your admin credentials.
              </Typography>
              <Button 
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;