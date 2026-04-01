import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Mail, Lock, User, ArrowRight, Eye, EyeOff, Stethoscope, UserCircle } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    try {
      const user = await register(form.name, form.email, form.password, form.role)
      navigate(user.role === 'doctor' ? '/doctor' : '/patient')
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const displayError = localError || error

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-container animate-fade-in">
        <Link to="/" className="auth-logo">
          <HeartPulse size={28} />
          <span>MedChain<span className="logo-ai">AI</span></span>
        </Link>

        <div className="auth-card glass-card">
          <h1>Create Account</h1>
          <p className="auth-desc">Join the decentralised healthcare revolution</p>

          {displayError && (
            <div className="auth-error">{displayError}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role selector */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${form.role === 'patient' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'patient' })}
              >
                <UserCircle size={20} />
                Patient
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'doctor' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'doctor' })}
              >
                <Stethoscope size={20} />
                Doctor
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  className="input-field"
                  placeholder="Dr. Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <p className="auth-notice">
          🔗 A blockchain wallet will be created for you automatically — zero complexity.
        </p>
      </div>
    </div>
  )
}
