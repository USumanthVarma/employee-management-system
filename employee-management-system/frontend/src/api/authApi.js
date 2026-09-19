import axiosInstance from './axiosInstance';

export const login = (credentials) =>
  axiosInstance.post('/auth/login', credentials).then((res) => res.data);

export const register = (payload) =>
  axiosInstance.post('/auth/register', payload).then((res) => res.data);
