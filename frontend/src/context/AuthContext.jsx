import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  const api = axios.create({
    baseURL: '/api',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data)
          setLoading(false)
        })
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data)
    return res.data
  }

  const signup = async (name, email, password, role) => {
    const res = await api.post('/auth/signup', { name, email, password, role })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, api }}>
      {children}
    </AuthContext.Provider>
  )
}
