import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import VillaManagement from '@/pages/VillaManagement';
import GuestManagement from '@/pages/GuestManagement';
import Housekeeping from '@/pages/Housekeeping';
import Services from '@/pages/Services';
import Reports from '@/pages/Reports';
import UserManagement from '@/pages/UserManagement';
import ActivityLogs from '@/pages/ActivityLogs';
import Reservations from '@/pages/Reservations';
import Expenses from '@/pages/Expenses';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import { ResortProvider, useResort } from '@/context/ResortContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useResort();
  if (!user) return <Navigate to="/" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useResort();

  if (!user) {
    return <Login />;
  }

  const isAdmin = user.role === 'Administrator';

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="villas" element={<VillaManagement />} />
          <Route path="guests" element={<GuestManagement />} />
          <Route path="housekeeping" element={<Housekeeping />} />

          {/* Admin Only Routes */}
          <Route path="expenses" element={
            <ProtectedRoute allowedRoles={['Administrator']}><Expenses /></ProtectedRoute>
          } />
          <Route path="logs" element={
            <ProtectedRoute allowedRoles={['Administrator']}><ActivityLogs /></ProtectedRoute>
          } />
          <Route path="services" element={
            <ProtectedRoute allowedRoles={['Administrator']}><Services /></ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['Administrator']}><Reports /></ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['Administrator']}><UserManagement /></ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['Administrator']}><Settings /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ResortProvider>
      <AppRoutes />
    </ResortProvider>
  );
}

export default App;
