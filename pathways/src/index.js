import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import routing components
import DriverDashboard from './components/DriverDashboard';
import PhoneFrame from './components/PhoneFrame'; // Assuming you'll create this component

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Route for the root path, rendering DriverDashboard */}
        <Route path="/" element={<DriverDashboard />} />
        {/* Route for /driver, rendering DriverApp */}
        <Route path="/driver" element={<PhoneFrame/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);