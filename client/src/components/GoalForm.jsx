import { useState } from 'react'
import { CATEGORIES, CATEGORY_LIST, formatCurrency } from '../utils/helpers'
import { Plus, X, Target } from 'lucide-react'

const PRESET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#F97316']

export default function GoalForm({ goal, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(goal?.name || '')
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || '')
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount || 0)
  const [deadline, setDeadline] = useState(goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '')
  const [category, setCategory] = useState(goal?.category || '')
  const [color, setColor] = useState(goal?.color || '#3B82F6')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Goal name is required'
    if (!targetAmount || isNaN(targetAmount) || Number(targetAmount) <= 0) newErrors.targetAmount = 'Enter a valid target amount'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline: deadline ? new Date(deadline) : null,
      category: category || null,
      color,
    })
  }

  const progress = targetAmount > 0 ? Math.round((Number(currentAmount) / Number(targetAmount)) * 100) : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 border border-primary-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary-800">Savings Goal</h3>
          <p className="text-xs text-primary-600">Set a savings target to track your progress</p>
        </div>
        {progress > 0 && (
          <div className="ml-auto">
            <span className="text-sm font-bold text-primary-700">{progress}%</span>
            <span className="text-xs text-primary-600 ml-1">complete</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="label">Goal Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., New Laptop, Spring Break Trip"
          className={`input ${errors.name ? 'input-error' : ''}`}
          maxLength={100}
          autoFocus
        />
        {errors.name && <p className="mt-1 text-xs text-danger-600">{errors.name}</p>}
      </div>

      {/* Target Amount */}
      <div>
        <label className="label">Target Amount *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            className={`input pl-7 ${errors.targetAmount ? 'input-error' : ''}`}
            step="0.01"
            min="0.01"
          />
        </div>
        {errors.targetAmount && <p className="mt-1 text-xs text-danger-600">{errors.targetAmount}</p>}
      </div>

      {/* Current Amount */}
      <div>
        <label className="label">Current Savings</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
          <input
            type="number"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0.00"
            className="input pl-7"
            step="0.01"
            min="0"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {currentAmount > 0 && formatCurrency(currentAmount)} saved so far
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="label">Related Category (optional)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          <option value="">No specific category</option>
          {CATEGORY_LIST.map((cat) => (
            <option key={cat} value={cat}>{CATEGORIES[cat].icon} {cat}</option>
          ))}
        </select>
      </div>

      {/* Deadline */}
      <div>
        <label className="label">Deadline (optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input"
        />
      </div>

      {/* Color */}
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
        </div>
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
              {goal ? 'Update' : 'Create'} Goal
            </>
          )}
        </button>
      </div>
    </form>
  )
}
