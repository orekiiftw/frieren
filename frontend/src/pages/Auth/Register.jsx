import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Mail, Lock, User, ArrowRight, Eye, EyeOff, Stethoscope, UserCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import useAuthStore from '../../store/useAuthStore'

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
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.015] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-zinc-500/[0.02] rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-[420px] space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white font-bold text-xl tracking-tight mb-6">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center">
              <HeartPulse size={20} strokeWidth={2.5} />
            </div>
            <span>MedChain<span className="text-zinc-500 font-medium">AI</span></span>
          </Link>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create Account</h1>
              <p className="text-sm text-zinc-400">Join the decentralised healthcare revolution</p>
            </div>

            {displayError && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'patient' })}
                  className={`flex items-center justify-center gap-2.5 h-11 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    form.role === 'patient'
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900/50 text-zinc-400 border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-200'
                  }`}
                >
                  <UserCircle size={18} />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'doctor' })}
                  className={`flex items-center justify-center gap-2.5 h-11 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    form.role === 'doctor'
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900/50 text-zinc-400 border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-200'
                  }`}
                >
                  <Stethoscope size={18} />
                  Doctor
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    minLength={8}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="premium" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-medium hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-zinc-600 max-w-[300px] mx-auto leading-relaxed">
          A blockchain wallet will be created for you automatically — zero complexity.
        </p>
      </div>
    </div>
  )
}
