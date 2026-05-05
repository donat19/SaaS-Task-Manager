import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then((u) => { setUser(u); connectSocket(token) })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
    return () => disconnectSocket()
  }, [])

  const login = async (email, password) => {
    const { token, user } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', token)
    setUser(user)
    connectSocket(token)
    return user
  }

  const register = async (name, email, password) => {
    const { token, user } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', token)
    setUser(user)
    connectSocket(token)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    disconnectSocket()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
