import api from './axiosInstance'

export const getAllCourses    = ()                    => api.get('/courses')
export const getCourseById   = (id)                  => api.get(`/courses/${id}`)
export const getCoursesByTeacher = (tid)             => api.get(`/courses/teacher/${tid}`)
export const createCourse    = (data, teacherId)     => api.post(`/courses?teacherId=${teacherId}`, data)
export const updateCourse    = (id, data)            => api.put(`/courses/${id}`, data)
export const deleteCourse    = (id)                  => api.delete(`/courses/${id}`)
export const enrollStudent   = (cid, sid)            => api.post(`/courses/${cid}/students/${sid}`)
export const unenrollStudent = (cid, sid)            => api.delete(`/courses/${cid}/students/${sid}`)
export const enrollBulk      = (cid, ids)            => api.post(`/courses/${cid}/students/bulk`, ids)
