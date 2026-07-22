import api from './axiosInstance'

export const getAllStudents       = ()           => api.get('/students')
export const getStudentById       = (id)         => api.get(`/students/${id}`)
export const getStudentByRoll     = (roll)       => api.get(`/students/roll/${roll}`)
export const getStudentsByCourse  = (courseId)   => api.get(`/students/course/${courseId}`)
export const createStudent        = (data)       => api.post('/students', data)
export const updateStudent        = (id, data)   => api.put(`/students/${id}`, data)
export const deleteStudent        = (id)         => api.delete(`/students/${id}`)
export const registerFace         = (id, base64) => api.post(`/face/register/${id}`, { faceImageBase64: base64 })
export const getFaceStatus        = (id)         => api.get(`/face/status/${id}`)
export const getAttendancePct      = (id, cid)    => api.get(`/students/${id}/attendance/${cid}/percentage`)
export const getStudentAttendancePct = getAttendancePct
export const getStudentAttendanceHistory = (id, cid) => api.get(`/students/${id}/attendance/${cid}`)
