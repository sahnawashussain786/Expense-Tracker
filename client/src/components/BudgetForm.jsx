import { useState } from 'react'
import { BUDGET_PERIODS, CATEGORIES, CATEGORY_LIST, formatCurrency } from '../utils/helpers'
import { Plus, X } from 'lucide-react'

export default function BudgetForm({ budget, onSubmit, onCancel, loading, categories = CATEGORY_LIST }) {
  const [name, setName] = useState(budget?.name || '')
  const [amount, setAmount] = useState(budget?.amount || '')
  const [period, setPeriod] = useState(budget?.period || 'monthly')
  const [category, setCategory] = useState(budget?.category || '')
  const [alertThreshold, setAlertThreshold] = useState(budget?.alertThreshold || 80)
  const [color, setColor] = useState(budget?.color || '#3B82F6')
  const [notes, setNotes] = useState(budget?.notes || '')
  const [startDate, setStartDate] = useState(budget?.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!amount || isNaN(amount) || Number(amount) <= 0) newErrors.amount = 'Enter a valid amount'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      amount: Number(amount),
      period,
      category: category || null,
      alertThreshold: Number(alertThreshold),
      color,
      notes: notes.trim() || undefined,
      startDate: new Date(startDate),
    })
  }

  const presetColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1']

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="label">Budget Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Food Budget, Spring Semester"
          className={`input ${errors.name ? 'input-error' : ''}`}
          maxLength={100}
          autoFocus
        />
        {errors.name && <p className="mt-1 text-xs text-danger-600">{errors.name}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="label">Budget Amount *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`input pl-7 ${errors.amount ? 'input-error' : ''}`}
            step="0.01"
            min="0.01"
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-danger-600">{errors.amount}</p>}
      </div>

      {/* Period selector */}
      <div>
        <label className="label">Period *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUDGET_PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`
                rounded-lg py-2.5 px-3 text-sm transition-all border
                ${period === p.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
              `}
            >
              <span className="block mb-0.5">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <label className="label">Category Filter (optional)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          <option value="">All Categories (no filter)</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{CATEGORIES[cat].icon} {cat}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">Only track expenses in this category against this budget</p>
      </div>

      {/* Alert threshold */}
      <div>
        <label className="label">Alert Threshold: {alertThreshold}%</label>
        <input
          type="range"
          min="50"
          max="100"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {presetColors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 rounded cursor-pointer border-0 p-0"
          />
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label className="label">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why this budget? Any notes..."
          className="input min-h-[72px] resize-y"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" />
              {budget ? 'Update' : 'Create'} Budget
            </>
          )}
        </button>
      </div>
    </form>
  )
}
