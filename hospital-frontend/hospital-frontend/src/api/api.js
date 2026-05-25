import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const getPatients     = () => api.get('/patients');
export const addPatient      = (data) => api.post('/patients', data);
export const getDoctors      = () => api.get('/doctors');
export const addDoctor       = (data) => api.post('/doctors', data);
export const getHospitalData = () => api.get('/hospital');

export default api;