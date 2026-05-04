import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import App from './App'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <RequireAuth><App /></RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  )
}
