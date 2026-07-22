import api from './axiosInstance'

export const detectFace  = (imageBase64)             => api.post('/face/detect', { imageBase64 })
export const faceScan    = (sessionId, imageBase64)  => api.post('/face/scan',   { sessionId, faceImageBase64: imageBase64 })
export const compareFaces= (image1, image2)          => api.post('/face/compare',{ image1, image2 })
