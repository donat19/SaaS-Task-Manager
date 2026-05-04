import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import Router from './Router'
import './index.css'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Router />
  </AuthProvider>
)
