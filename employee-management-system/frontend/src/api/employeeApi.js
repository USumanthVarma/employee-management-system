import axiosInstance from './axiosInstance';

export const getEmployees = () =>
  axiosInstance.get('/employees').then((res) => res.data);

export const getEmployee = (id) =>
  axiosInstance.get(`/employees/${id}`).then((res) => res.data);

export const searchEmployees = (keyword) =>
  axiosInstance.get('/employees/search', { params: { keyword } }).then((res) => res.data);

export const createEmployee = (payload) =>
  axiosInstance.post('/employees', payload).then((res) => res.data);

export const updateEmployee = (id, payload) =>
  axiosInstance.put(`/employees/${id}`, payload).then((res) => res.data);

export const deleteEmployee = (id) => axiosInstance.delete(`/employees/${id}`);
