  import api from './axiosInstance'

  // Sessions
  export const startSession  = (courseId, topic, classRoom, mode = 'QR_CODE') =>
    api.post(`/attendance/sessions/start?courseId=${courseId}&topic=${encodeURIComponent(topic)}&classRoom=${encodeURIComponent(classRoom)}&mode=${mode}`)

  export const closeSession        = (sessionId) => api.put(`/attendance/sessions/${sessionId}/close`)
  export const getSessionsByCourse = (cid)  => api.get(`/attendance/sessions/course/${cid}`)
  export const getSessionRecords   = (sid)  => api.get(`/attendance/sessions/${sid}/records`)
  export const getSessionsByDate   = (date) => api.get(`/attendance/sessions/date/${date}`)
  export const getActiveSession = () => api.get("/attendance/session/active");
  export const getMySessionsByDate = (date) => api.get(`/attendance/sessions/my/date/${date}`);

  // QR — backend madhe @PostMapping ahe @PutMapping nahi
  export const generateQR    = (sessionId) => api.post(`/qr/generate/${sessionId}`)
  export const refreshQR     = (sessionId) => api.post(`/qr/refresh/${sessionId}`)
  export const getQRStatus   = (sessionId) => api.get(`/qr/status/${sessionId}`)

  // QR scan — public endpoint (no token needed — handled via separate axios call)
  export const scanQR = (token, rollNumber) =>
    api.post(`/attendance/qr/scan?token=${encodeURIComponent(token)}&rollNumber=${rollNumber}`)

  // Manual mark
  export const manualMark = (sessionId, studentId, status, remarks = '') =>
    api.post(`/attendance/sessions/${sessionId}/manual?studentId=${studentId}&status=${status}&remarks=${encodeURIComponent(remarks)}`)
