import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    try {
      const user = await login(form.email, form.password)
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
          <h1>Welcome back</h1>
          <p className="auth-desc">Sign in to your decentralised health account</p>

          {displayError && (
            <div className="auth-error">{displayError}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>

        <p className="auth-notice">
          🔒 Your wallet is managed securely under the hood — no seed phrases required.
        </p>
      </div>
    </div>
  )
}
