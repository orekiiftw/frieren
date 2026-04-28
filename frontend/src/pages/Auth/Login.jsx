import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import useAuthStore from '../../store/useAuthStore'

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
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.015] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-zinc-500/[0.02] rounded-full blur-[80px]" />
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
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
              <p className="text-sm text-zinc-400">Sign in to your decentralised health account</p>
            </div>

            {displayError && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-white font-medium hover:underline underline-offset-4">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-zinc-600 max-w-[300px] mx-auto leading-relaxed">
          Your wallet is managed securely under the hood — no seed phrases required.
        </p>
      </div>
    </div>
  )
}
