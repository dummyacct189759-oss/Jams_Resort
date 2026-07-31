import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  villaService,
  guestService,
  posService,
  dashboardService,
  maintenanceService,
  serviceService,
  userService,
  settingsService,
  activityService,
  expenseService
} from '@/services/api';

const ResortContext = createContext();

export const ResortProvider = ({ children }) => {
  const [villas, setVillas] = useState([]);
  const [guests, setGuests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({
    resort_name: 'JAMS Luxury Resort & Spa',
    contact_number: '+63 912 345 6789',
    address: 'Brgy. Monbon Irosin',
    currency: '₱'
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('jams_user')) || null);

  const logActivity = async (action, details) => {
    if (!user) return;
    try {
      await activityService.create({
        user_id: user.id,
        user_name: user.name,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details
      });
    } catch (error) {
      console.error("Log error:", error);
    }
  };

  const fetchData = async () => {
    if (!user) return; // Don't fetch if not logged in
    try {
      setLoading(true);
      const [vRes, gRes, tRes, sRes, mRes, dRes, uRes, setRes, logRes, expRes] = await Promise.all([
        villaService.getAll(),
        guestService.getAll(),
        posService.getTransactions(),
        serviceService.getAll(),
        maintenanceService.getAll(),
        dashboardService.getStats(),
        userService.getAll(),
        settingsService.get(),
        activityService.getAll(),
        expenseService.getAll()
      ]);

      setVillas(vRes.data || []);
      setGuests(gRes.data || []);
      setTransactions(tRes.data || []);
      setServices(sRes.data || []);
      setMaintenanceRequests(mRes.data || []);
      setStats(dRes.data);
      setUsers(uRes.data || []);
      setSettings(setRes.data || settings);
      setLogs(logRes.data || []);
      setExpenses(expRes.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const canAccess = (requiredRole) => {
    if (!user) return false;
    if (user.role === 'Administrator') return true;
    return user.role === requiredRole;
  };

  const checkAvailability = async (villaId, checkIn, checkOut) => {
    try {
      const res = await posService.checkAvailability(villaId, checkIn, checkOut);
      return res.data.available;
    } catch (error) {
      toast.error("Error checking availability");
      return false;
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await settingsService.update(newSettings);
      setSettings(newSettings);
      logActivity('Update Settings', newSettings);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const login = (userData) => {
    localStorage.setItem('jams_user', JSON.stringify(userData));
    setUser(userData);
    logActivity('Login', `User ${userData.username} logged in`);
  };

  const logout = () => {
    logActivity('Logout', `User ${user?.username} logged out`);
    localStorage.removeItem('jams_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateVillaStatus = async (villaId, status) => {
    try {
      await villaService.updateStatus(villaId, status);
      setVillas(prev => prev.map(v => v.id === villaId ? { ...v, status } : v));
      logActivity('Update Villa Status', { villaId, status });
      toast.success(`Villa status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const addVilla = async (villaData) => {
    try {
      await villaService.create(villaData);
      logActivity('Add Villa', villaData.name);
      toast.success('Villa added successfully');
      fetchData();
    } catch (error) {
      toast.error("Failed to add villa");
    }
  };

  const updateVilla = async (villaData) => {
    try {
      await villaService.update(villaData);
      logActivity('Update Villa', villaData.name);
      toast.success('Villa updated successfully');
      fetchData();
    } catch (error) {
      toast.error("Failed to update villa");
    }
  };

  const deleteVilla = async (villaId) => {
    if (!canAccess('Administrator')) {
      toast.error("Permission denied");
      return;
    }
    const villa = villas.find(v => v.id === villaId);
    if (!window.confirm("Are you sure you want to delete this villa?")) return;
    try {
      await villaService.delete(villaId);
      logActivity('Delete Villa', villa?.name || villaId);
      setVillas(prev => prev.filter(v => v.id !== villaId));
      toast.success("Villa deleted");
    } catch (error) {
      toast.error("Failed to delete villa");
    }
  };

  const addTransaction = async (transaction) => {
    try {
      // Overbooking protection check
      const isAvailable = await checkAvailability(transaction.villa_id, transaction.check_in, transaction.check_out);
      if (!isAvailable) {
        toast.error("Villa is already booked for these dates!");
        return;
      }

      await posService.saveTransaction(transaction);
      logActivity('New Transaction', {
        guest: transaction.guest_name,
        villa: transaction.villa_name,
        total: transaction.total
      });
      toast.success('Transaction saved successfully!');
      fetchData();
    } catch (error) {
      toast.error("Failed to save transaction");
    }
  };

  const updateTransactionStatus = async (id, status) => {
    try {
      await posService.updateStatus(id, status);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      logActivity('Update Transaction Status', { id, status });
      toast.success(`Reservation status: ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getGuestHistory = (guestId) => {
    return transactions.filter(t => t.guest_id === guestId);
  };

  const addGuest = async (guest) => {
    try {
      await guestService.create(guest);
      logActivity('Add Guest', guest.name);
      toast.success('Guest added to database');
      fetchData();
    } catch (error) {
      toast.error("Failed to add guest");
    }
  };

  const updateGuest = async (guestData) => {
    try {
      await guestService.update(guestData);
      logActivity('Update Guest', guestData.name);
      toast.success('Guest updated successfully');
      fetchData();
    } catch (error) {
      toast.error("Failed to update guest");
    }
  };

  const deleteGuest = async (guestId) => {
    if (!canAccess('Administrator')) {
      toast.error("Permission denied");
      return;
    }
    const guest = guests.find(g => g.id === guestId);
    if (!window.confirm("Are you sure you want to delete this guest?")) return;
    try {
      await guestService.delete(guestId);
      logActivity('Delete Guest', guest?.name || guestId);
      setGuests(prev => prev.filter(g => g.id !== guestId));
      toast.success("Guest deleted");
    } catch (error) {
      toast.error("Failed to delete guest");
    }
  };

  const addUser = async (userData) => {
    if (!canAccess('Administrator')) {
      toast.error("Permission denied");
      return;
    }
    try {
      await userService.create(userData);
      logActivity('Add User', userData.username);
      toast.success('User created successfully');
      fetchData();
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  const addMaintenanceRequest = async (req) => {
    try {
      await maintenanceService.create(req);
      logActivity('Maintenance Request', req.issue);
      toast.success('Maintenance request submitted');
      fetchData();
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  const updateUserStatus = async (id, status) => {
    if (!canAccess('Administrator')) {
      toast.error("Permission denied");
      return;
    }
    try {
      await userService.updateStatus(id, status);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
      logActivity('Update User Status', { id, status });
      toast.success(`User status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const resetUserPassword = async (id, newPassword) => {
    if (!canAccess('Administrator')) {
      toast.error("Permission denied");
      return;
    }
    try {
      await userService.resetPassword(id, newPassword);
      logActivity('Reset Password', id);
      toast.success("Password reset successfully");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const deleteUser = async (id) => {
    if (!canAccess('Administrator')) {
      toast.error("Permission denied");
      return;
    }
    try {
      await userService.delete(id);
      logActivity('Delete User', id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const addService = async (serviceData) => {
    try {
      await serviceService.create(serviceData);
      logActivity('Add Service', serviceData.name);
      toast.success('Service added successfully');
      fetchData();
    } catch (error) {
      toast.error("Failed to add service");
    }
  };

  const updateService = async (serviceData) => {
    try {
      await serviceService.update(serviceData);
      logActivity('Update Service', serviceData.name);
      toast.success('Service updated successfully');
      fetchData();
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  const deleteService = async (id) => {
    if (!canAccess('Administrator')) {
      toast.error("Permission denied");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await serviceService.delete(id);
      logActivity('Delete Service', id);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success("Service deleted");
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const updateServiceStatus = async (id, status) => {
    try {
      await serviceService.updateStatus(id, status);
      setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      logActivity('Update Service Status', { id, status });
      toast.success(`Service status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const addExpense = async (data) => {
    try {
      await expenseService.create(data);
      logActivity('Add Expense', { category: data.category, amount: data.amount });
      toast.success('Expense recorded');
      fetchData();
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  const updateExpense = async (data) => {
    try {
      await expenseService.update(data);
      logActivity('Update Expense', { category: data.category, amount: data.amount });
      toast.success('Expense updated');
      fetchData();
    } catch (error) {
      toast.error("Failed to update expense");
    }
  };

  const deleteExpense = async (id) => {
    if (!canAccess('Administrator')) return;
    if (!window.confirm("Delete this expense record?")) return;
    try {
      await expenseService.delete(id);
      logActivity('Delete Expense', id);
      toast.success('Expense deleted');
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <ResortContext.Provider value={{
      villas,
      setVillas,
      updateVillaStatus,
      addVilla,
      updateVilla,
      deleteVilla,
      guests,
      setGuests,
      addGuest,
      updateGuest,
      deleteGuest,
      transactions,
      addTransaction,
      updateTransactionStatus,
      checkAvailability,
      getGuestHistory,
      addUser,
      maintenanceRequests,
      addMaintenanceRequest,
      users,
      updateUserStatus,
      resetUserPassword,
      deleteUser,
      settings,
      updateSettings,
      services,
      addService,
      updateService,
      deleteService,
      updateServiceStatus,
      logs,
      logActivity,
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      canAccess,
      stats,
      loading,
      user,
      login,
      logout,
      refreshData: fetchData
    }}>
      {children}
    </ResortContext.Provider>
  );
};

export const useResort = () => {
  const context = useContext(ResortContext);
  if (!context) throw new Error('useResort must be used within a ResortProvider');
  return context;
};
