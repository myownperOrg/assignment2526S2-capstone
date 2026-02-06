import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Users from './pages/Users';
import Register from './pages/Register';
import TravelListings from './pages/TravelListings';
import TravelSelection from './pages/TravelSelection';
import Itineraries from './pages/Itineraries';
import { isAuthenticated, isAdmin } from './utils/auth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const authenticated = isAuthenticated();
  const admin = isAdmin();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
<Routes>
  {/* Routes WITHOUT Layout */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Routes WITH Layout */}
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="travel-listings" element={<TravelListings />} />
    <Route path="travel/select" element={<TravelSelection />} />
    <Route path="user" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
    <Route path="travel-listings/:travelId/itineraries" element={<Itineraries />} />
  </Route>
  
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>      </Router>
    </ThemeProvider>
  );
}

export default App;