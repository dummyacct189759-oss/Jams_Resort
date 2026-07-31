import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/jams/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const villaService = {
  getAll: () => api.get('/villas.php'),
  getById: (id) => api.get(`/villas.php?id=${id}`),
  create: (data) => api.post('/villas.php', data),
  update: (data) => api.put('/villas.php', data),
  updateStatus: (id, status) => api.put(`/villas.php?status_only=1`, { id, status }),
  delete: (id) => api.delete(`/villas.php?id=${id}`),
};

export const guestService = {
  getAll: () => api.get('/guests.php'),
  create: (data) => api.post('/guests.php', data),
  update: (data) => api.put('/guests.php', data),
  delete: (id) => api.delete(`/guests.php?id=${id}`),
};

export const posService = {
  saveTransaction: (data) => api.post('/transactions.php', data),
  getTransactions: () => api.get('/transactions.php'),
  updateStatus: (id, status) => api.put('/transactions.php?action=status', { id, status }),
  checkAvailability: (villaId, checkIn, checkOut) =>
    api.get(`/transactions.php?action=availability&villa_id=${villaId}&check_in=${checkIn}&check_out=${checkOut}`),
};

export const activityService = {
  getAll: () => api.get('/logs.php'),
  create: (data) => api.post('/logs.php', data),
};

export const expenseService = {
  getAll: () => api.get('/expenses.php'),
  create: (data) => api.post('/expenses.php', data),
  update: (data) => api.put('/expenses.php', data),
  delete: (id) => api.delete(`/expenses.php?id=${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard.php'),
};

export const maintenanceService = {
  getAll: () => api.get('/maintenance.php'),
  create: (data) => api.post('/maintenance.php', data),
};

export const serviceService = {
  getAll: () => api.get('/services.php'),
  create: (data) => api.post('/services.php', data),
  update: (data) => api.put('/services.php', data),
  updateStatus: (id, status) => api.put('/services.php?action=status', { id, status }),
  delete: (id) => api.delete(`/services.php?id=${id}`),
};

export const settingsService = {
  get: () => api.get('/settings.php'),
  update: (data) => api.post('/settings.php', data),
  getBackupUrl: () => `${API_BASE_URL}/backup.php`,
};

export const userService = {
  getAll: () => api.get('/users.php'),
  create: (data) => api.post('/users.php', data),
  updateStatus: (id, status) => api.put('/users.php?action=status', { id, status }),
  resetPassword: (id, password) => api.put('/users.php?action=password', { id, password }),
  delete: (id) => api.delete(`/users.php?id=${id}`),
};

export const authService = {
  login: (credentials) => api.post('/login.php', credentials),
};

export default api;
