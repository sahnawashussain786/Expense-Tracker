import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { CATEGORY_LIST, CATEGORIES } from '../utils/helpers'
import {
  Settings as SettingsIcon, User, DollarSign, Bell, Lock, Trash2, Palette,
  Check, X, AlertTriangle, Save, CreditCard, Globe, Star, Shield, ChevronRight
} from 'lucide-react'

export default function Settings() {
  const { user, updateProfile, updatePassword, deleteAccount, updateFavorites, clearError } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [globalLoading, setGlobalLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const setGlobalLoadingTrue = () => setGlobalLoading(true)
  const setGlobalLoadingFalse = () => setGlobalLoading(false)

  // Profile
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  // Budgets
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || '')
  const [weeklyBudget, setWeeklyBudget] = useState(user?.weeklyBudget || '')
  const [semesterBudget, setSemesterBudget] = useState(user?.semesterBudget || '')

  // Toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true)
  const [autoCategorize, setAutoCategorize] = useState(user?.autoCategorize ?? true)

  // Favorites
  const [favoriteCategories, setFavoriteCategories] = useState(user?.favoriteCategories || [])

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Delete account
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const setMsg = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  const handleProfileSave = async () => {
    setGlobalLoading(true)
    try {
      const res = await updateProfile({ name, phone })
      if (res.success) {
        setMsg('success', 'Profile updated!')
        clearError()
      } else {
        setMsg('error', res.error || 'Failed to update profile')
      }
    } catch {
      setMsg('error', 'Failed to update profile')
    } finally {
      setGlobalLoading(false)
    }
  }

  const handleBudgetSave = async () => {
    setGlobalLoading(true)
    try {
      const res = await updateProfile({ monthlyBudget: Number(monthlyBudget) || 0, weeklyBudget: Number(weeklyBudget) || 0, semesterBudget: Number(semesterBudget) || 0 })
      if (res.success) {
        setMsg('success', 'Budget settings saved!')
        clearError()
      } else {
        setMsg('error', res.error || 'Failed to save budgets')
      }
    } catch {
      setMsg('error', 'Failed to save budgets')
    } finally {
      setGlobalLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setGlobalLoading(true)
    if (newPassword !== confirmPassword) {
      setMsg('error', 'Passwords do not match')
      setGlobalLoading(false)
      return
    }
    if (newPassword.length < 6) {
      setMsg('error', 'New password must be at least 6 characters')
      setGlobalLoading(false)
      return
    }
    try {
      const res = await updatePassword(currentPassword, newPassword)
      if (res.success) {
        setMsg('success', 'Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        clearError()
      } else {
        setMsg('error', res.error || 'Failed to change password')
      }
    } catch {
      setMsg('error', 'Failed to change password')
    } finally {
      setGlobalLoading(false)
    }
  }

  const handleFavoritesSave = async () => {
    setGlobalLoading(true)
    try {
      const res = await updateFavorites(favoriteCategories)
      if (res.success) {
        setMsg('success', 'Favorite categories updated!')
        clearError()
      } else {
        setMsg('error', res.error || 'Failed to update favorites')
      }
    } catch {
      setMsg('error', 'Failed to update favorites')
    } finally {
      setGlobalLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.email) {
      setMsg('error', 'Please type your email to confirm')
      return
    }
    setDeleteLoading(true)
    try {
      const res = await deleteAccount()
      if (res.success) {
        window.location.href = '/login'
      } else {
        setMsg('error', res.error || 'Failed to delete account')
      }
    } catch {
      setMsg('error', 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleFavorite = (cat) => {
    setFavoriteCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'budgets', label: 'Budget Settings', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'password', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ]

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-link whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Message */}
      {message.text && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${message.type === 'error' ? 'bg-danger-50 border-danger-200 text-danger-800' : 'bg-success-50 border-success-200 text-success-800'}`}>
          {message.type === 'error' ? <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : <div className="h-5 w-5 rounded-full bg-success-500 flex items-center justify-center text-white text-xs font-bold">✓</div>}
          <p className="text-sm font-medium flex-1">{message.text}</p>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-current opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-lg font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Profile Information</h2>
              <p className="text-xs text-gray-500">Update your personal details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" maxLength={100} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={user?.email} disabled className="input bg-gray-50 text-gray-500" />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Phone (optional)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="e.g., +1 555-0123" maxLength={20} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleProfileSave} disabled={globalLoading || name === user?.name && !phone} className="btn btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </button>
            {name !== user?.name || phone !== user?.phone ? (
              <button onClick={() => { setName(user?.name || ''); setPhone(user?.phone || '') }} className="btn btn-secondary flex items-center gap-2">
                <X className="h-4 w-4" /> Reset
              </button>
            ) : <div />}
          </div>
        </div>
      )}

      {/* Budget Settings */}
      {activeTab === 'budgets' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Budget Defaults</h2>
              <p className="text-xs text-gray-500">Set default budgets that apply to your dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500" /> Monthly Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className="input pl-7" step="0.01" placeholder="0.00" min="0" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Your monthly spending limit</p>
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success-500" /> Weekly Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" value={weeklyBudget} onChange={(e) => setWeeklyBudget(e.target.value)} className="input pl-7" step="0.01" placeholder="0.00" min="0" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Your weekly spending limit</p>
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning-500" /> Semester Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" value={semesterBudget} onChange={(e) => setSemesterBudget(e.target.value)} className="input pl-7" step="0.01" placeholder="0.00" min="0" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Your semester spending limit</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleBudgetSave} disabled={globalLoading} className="btn btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" /> Save Budgets
            </button>
            <button onClick={() => { setMonthlyBudget(''); setWeeklyBudget(''); setSemesterBudget('') }} className="btn btn-secondary flex items-center gap-2">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-xs text-gray-500">Control how you receive alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-100 text-danger-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Budget Warnings</p>
                  <p className="text-xs text-gray-500">Get alerted when you approach your budget limits</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notificationsEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto-categorization</p>
                  <p className="text-xs text-gray-500">Automatically categorize transactions based on merchant names</p>
                </div>
              </div>
              <button
                onClick={() => setAutoCategorize(!autoCategorize)}
                className={`relative h-6 w-11 rounded-full transition-colors ${autoCategorize ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoCategorize ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-100 text-success-600">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive weekly spending summaries via email</p>
                </div>
              </div>
              <button className="rounded-full bg-gray-300 px-3 py-1 text-xs font-medium text-gray-500 cursor-not-allowed">
                Coming soon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Favorites */}
      {activeTab === 'favorites' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Favorite Categories</h2>
              <p className="text-xs text-gray-500">Pin your most-used categories for quick access</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORY_LIST.map(cat => {
              const isFav = favoriteCategories.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => toggleFavorite(cat)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${isFav ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  style={isFav ? { borderColor: CATEGORIES[cat].color, color: CATEGORIES[cat].color } : {}}
                >
                  <span className="text-base">{CATEGORIES[cat].icon}</span>
                  {cat}
                  {isFav && <Star className="h-3 w-3 ml-1 fill-current" style={{ color: CATEGORIES[cat].color }} />}
                </button>
              )
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleFavoritesSave} disabled={globalLoading} className="btn btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" /> Save Favorites
            </button>
          </div>

          {favoriteCategories.length > 0 && (
            <div className="p-3 rounded-lg bg-primary-50 border border-primary-100">
              <p className="text-xs text-primary-700 font-medium">
                {favoriteCategories.length} favorite{favoriteCategories.length > 1 ? 'ies' : 'y'} selected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="Enter new password"
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-400">Must be at least 6 characters</p>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handlePasswordUpdate} disabled={globalLoading || !currentPassword || !newPassword || !confirmPassword} className="btn btn-primary flex items-center gap-2">
                <Lock className="h-4 w-4" /> Update Password
              </button>
              {(currentPassword || newPassword || confirmPassword) && (
                <button onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }} className="btn btn-secondary flex items-center gap-2">
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === 'danger' && (
        <div className="space-y-5">
          <div className="card p-6 border-danger-200 bg-danger-50/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-100 text-danger-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-danger-800">Danger Zone</h2>
                <p className="text-xs text-danger-600">Irreversible actions</p>
              </div>
            </div>

            {/* Delete account */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-danger-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('danger')}
                className="btn btn-danger btn-sm"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Delete confirmation */}
          <div className="card p-6 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-danger-600" /> Delete Your Account
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This action is <strong className="text-danger-600">permanent and cannot be undone</strong>. All your transactions, budgets, goals, and settings will be deleted.
            </p>

            <div className="mb-4">
              <label className="label">Type your email to confirm</label>
              <input
                type="email"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className={`input ${deleteInput && deleteInput !== user?.email ? 'input-error' : ''}`}
                placeholder={user?.email}
              />
              {deleteInput && deleteInput !== user?.email && (
                <p className="mt-1 text-xs text-danger-600">Email does not match. Please type it exactly.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleDeleteAccount} disabled={deleteLoading || deleteInput !== user?.email} className="btn btn-danger flex items-center gap-2">
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Deleting...
                  </span>
                ) : (
                  <><Trash2 className="h-4 w-4" /> Delete My Account</>
                )}
              </button>
              <button onClick={() => setDeleteInput('')} className="btn btn-secondary flex items-center gap-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
