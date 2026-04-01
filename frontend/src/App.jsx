import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import PatientDashboard from './pages/Patient/PatientDashboard'
import DoctorPortal from './pages/Doctor/DoctorPortal'
import './App.css'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If roles are specified, check if user has the right role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect doctors to doctor portal and patients to patient dashboard
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />
  }

  return children
}

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore()

  // On mount, try to fetch user profile if token exists
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser()
    }
  }, [])

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/patient/*"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPortal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
