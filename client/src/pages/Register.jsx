import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, Mail, Lock, User, Phone, LogIn, ArrowRight, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

export default function Register() {
  const { register, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const passwordStrength = () => {
    if (password.length === 0) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strengthLabel = () => {
    const s = passwordStrength()
    if (s === 0) return { label: '', color: '' }
    if (s <= 1) return { label: 'Weak', color: 'text-danger-600' }
    if (s <= 2) return { label: 'Fair', color: 'text-warning-600' }
    if (s <= 3) return { label: 'Good', color: 'text-primary-600' }
    return { label: 'Strong', color: 'text-success-600' }
  }

  const strengthBarColor = () => {
    const s = passwordStrength()
    if (s <= 1) return 'bg-danger-500'
    if (s <= 2) return 'bg-warning-500'
    if (s <= 3) return 'bg-primary-500'
    return 'bg-success-500'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    setFormError('')
    if (!name.trim()) { setFormError('Please enter your name'); return }
    if (!email.trim()) { setFormError('Please enter your email'); return }
    if (!password) { setFormError('Please enter a password'); return }
    if (password.length < 6) { setFormError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setFormError('Passwords do not match'); return }
    setLoading(true)
    const result = await register(name.trim(), email.trim().toLowerCase(), password, phone.trim() || undefined)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setFormError(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-200">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
              <p className="text-xs text-gray-500">College Edition</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create an account</h2>
            <p className="text-sm text-gray-500 mt-1">Start tracking your expenses today</p>
          </div>

          {/* Error */}
          {(formError || error) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input pl-10"
                  required
                  autoComplete="name"
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="input pl-10"
                  required
                  autoComplete="email"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Use your university email for student features</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input pl-10 pr-10"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${strengthLabel().color}`}>{strengthLabel().label}</span>
                      <span className="text-xs text-gray-400">{password.length} chars</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strengthBarColor()}`} style={{ width: `${(passwordStrength() / 4) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`input pl-10 ${confirmPassword && password !== confirmPassword ? 'input-error' : ''}`}
                    required
                    autoComplete="new-password"
                  />
                </div>
                {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                  <p className="mt-1 text-xs text-success-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-danger-600">Passwords do not match</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10"
                  placeholder="e.g., +1 555-0123"
                  maxLength={20}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
                Sign in <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
