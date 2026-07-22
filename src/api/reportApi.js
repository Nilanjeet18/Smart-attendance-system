import api from './axiosInstance'

export const getCourseReport = (courseId, startDate, endDate) =>
  api.get(`/reports/course/${courseId}?startDate=${startDate}&endDate=${endDate}`)

export const getAtRiskStudents = (courseId, startDate, endDate) =>
  api.get(`/reports/course/${courseId}/at-risk?startDate=${startDate}&endDate=${endDate}`)

// Excel download — blob response
export const downloadExcel = async (courseId, startDate, endDate) => {
  const res = await api.get(
    `/reports/course/${courseId}/excel?startDate=${startDate}&endDate=${endDate}`,
    { responseType: 'blob' }
  )
  const url  = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href  = url
  link.setAttribute('download', `attendance-${courseId}-${startDate}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// PDF download — blob response
export const downloadPDF = async (courseId, startDate, endDate) => {
  const res = await api.get(
    `/reports/course/${courseId}/pdf?startDate=${startDate}&endDate=${endDate}`,
    { responseType: 'blob' }
  )
  const url  = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href  = url
  link.setAttribute('download', `attendance-${courseId}-${startDate}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
