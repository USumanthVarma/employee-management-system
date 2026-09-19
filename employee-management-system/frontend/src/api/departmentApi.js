import axiosInstance from './axiosInstance';

export const getDepartments = () =>
  axiosInstance.get('/departments').then((res) => res.data);

export const getDepartment = (id) =>
  axiosInstance.get(`/departments/${id}`).then((res) => res.data);

export const createDepartment = (payload) =>
  axiosInstance.post('/departments', payload).then((res) => res.data);

export const updateDepartment = (id, payload) =>
  axiosInstance.put(`/departments/${id}`, payload).then((res) => res.data);

export const deleteDepartment = (id) => axiosInstance.delete(`/departments/${id}`);
