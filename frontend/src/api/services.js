import api from './client';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const workshopsApi = {
  getAll: (params = {}) => api.get('/workshops', { params }),
  getById: (id) => api.get(`/workshops/${id}`),
  create: (data) => api.post('/workshops', data),
  update: (id, data) => api.put(`/workshops/${id}`, data),
};

export const registrationsApi = {
  getAll: (params = {}) => api.get('/registrations', { params }),
  getHistory: (id) => api.get(`/registrations/${id}/history`),
  register: (data) => api.post('/registrations', data),
  cancel: (id) => api.post(`/registrations/${id}/cancel`),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
};
