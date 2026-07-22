import { createContext, useContext, useState, useEffect } from 'react'
import { loginApi } from '../api/authApi'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Page refresh zala tari login state tikvayla localStorage vaprto
    const token     = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res  = await loginApi({ email, password })
    const data = res.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify({
      id:    data.teacherId,
      name:  data.name,
      email: data.email,
      role:  data.role,
    }))
    setUser({ id: data.teacherId, name: data.name, email: data.email, role: data.role })
    toast.success(`Welcome, ${data.name}!`)
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
