import api from './axiosInstance'

export const getAllTeachers    = ()         => api.get('/teachers')
export const getTeacherById   = (id)       => api.get(`/teachers/${id}`)
export const addTeacher       = (data)     => api.post('/auth/register', data)
export const updateTeacher    = (id, data) => api.put(`/teachers/${id}`, data)
export const deleteTeacher    = (id)       => api.delete(`/teachers/${id}`)
export const deactivateTeacher = (id)      => api.delete(`/teachers/${id}`)
export const getDashboard     = (id)       => api.get(`/teachers/${id}/dashboard`)
export const getTodayActivity = (id)       => api.get(`/teachers/${id}/today`)