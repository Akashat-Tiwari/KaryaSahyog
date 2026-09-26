import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './pages/shared/Splash';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoleSelection from './pages/auth/RoleSelection';
import CustomerDashboard from './components/customer/pages/CustomerDashboard';
import Services from './components/customer/pages/Services';
import EmergencySelection from './components/customer/pages/EmergencySelection';
import ApplianceSelection from './components/customer/pages/ApplianceSelection';
import ServiceTypeSelection from './components/customer/pages/ServiceTypeSelection';
import LocationSelection from './components/customer/pages/LocationSelection';
import NearbyWorkers from './components/customer/pages/NearbyWorkers';
import WorkerProfileView from './components/customer/pages/WorkerProfileView';
import Booking from './components/customer/pages/Booking';
import BookingConfirmation from './components/customer/pages/BookingConfirmation';
import Tracking from './components/customer/pages/Tracking';
import Payment from './components/customer/pages/Payment';
import Review from './components/customer/pages/Review';
import BookingHistory from './components/customer/pages/BookingHistory';
import Notifications from './components/customer/pages/Notifications';
import CustomerProfile from './components/customer/pages/CustomerProfile';
import CustomerSettings from './components/customer/pages/CustomerSettings';
import WorkerDashboard from './components/worker/WorkerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Entry & Auth Routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Module Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/services" element={<Services />} />
        <Route path="/customer/emergency" element={<EmergencySelection />} />
        <Route path="/customer/appliance" element={<ApplianceSelection />} />
        <Route path="/customer/service-type" element={<ServiceTypeSelection />} />
        <Route path="/customer/location" element={<LocationSelection />} />
        <Route path="/customer/workers" element={<NearbyWorkers />} />
        <Route path="/customer/worker/:id" element={<WorkerProfileView />} />
        <Route path="/customer/booking" element={<Booking />} />
        <Route path="/customer/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/customer/tracking/:id" element={<Tracking />} />
        <Route path="/customer/payment/:id" element={<Payment />} />
        <Route path="/customer/review/:id" element={<Review />} />
        <Route path="/customer/history" element={<BookingHistory />} />
        <Route path="/customer/notifications" element={<Notifications />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/settings" element={<CustomerSettings />} />

        {/* Worker Module Routes */}
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />

        {/* Admin Module Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
