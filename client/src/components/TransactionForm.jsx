import { useState } from 'react'
import { CATEGORIES, PAYMENT_METHODS } from '../utils/helpers'
import { Plus, X } from 'lucide-react'

export default function TransactionForm({ transaction, onSubmit, onCancel, loading, categories = CATEGORIES }) {
  const [description, setDescription] = useState(transaction?.description || '')
  const [amount, setAmount] = useState(transaction?.amount || '')
  const [category, setCategory] = useState(transaction?.category || '')
  const [type, setType] = useState(transaction?.type || 'expense')
  const [date, setDate] = useState(transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || 'Cash')
  const [merchant, setMerchant] = useState(transaction?.merchant || '')
  const [note, setNote] = useState(transaction?.note || '')
  const [tags, setTags] = useState(transaction?.tags?.join(', ') || '')
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!description.trim()) newErrors.description = 'Description is required'
    if (!amount || isNaN(amount) || Number(amount) <= 0) newErrors.amount = 'Enter a valid amount'
    if (!category) newErrors.category = 'Select a category'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      description: description.trim(),
      amount: Number(amount),
      category,
      type,
      date: new Date(date),
      paymentMethod,
      merchant: merchant.trim() || undefined,
      note: note.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isRecurring,
    })
  }

  const inputClass = (field) => `input ${errors[field] ? 'input-error' : ''}`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${type === 'expense' ? 'bg-danger-100 text-danger-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          💸 Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${type === 'income' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          💰 Income
        </button>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description *</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Lunch at campus cafe"
          className={inputClass('description')}
          autoFocus
          maxLength={200}
        />
        {errors.description && <p className="mt-1 text-xs text-danger-600">{errors.description}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="label">Amount *</label>
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

      {/* Merchant (optional) */}
      <div>
        <label className="label">Merchant (optional)</label>
        <input
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="e.g., Starbucks, Uber"
          className="input"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-400">Helps with auto-categorization</p>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`
                rounded-lg py-2 px-3 text-xs font-medium transition-all border
                ${category === cat
                  ? 'border-transparent shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              style={{
                backgroundColor: category === cat ? CATEGORIES[cat].color + '15' : undefined,
                color: category === cat ? CATEGORIES[cat].color : undefined,
                borderColor: category === cat ? CATEGORIES[cat].color : undefined,
              }}
            >
              <span className="mr-1">{CATEGORIES[cat].icon}</span>
              {cat}
            </button>
          ))}
        </div>
        {errors.category && <p className="mt-1 text-xs text-danger-600">{errors.category}</p>}
      </div>

      {/* Payment Method */}
      <div>
        <label className="label">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="input"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="label">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
      </div>

      {/* Note */}
      <div>
        <label className="label">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          className="input min-h-[80px] resize-y"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Recurring toggle */}
      <div className="flex items-center gap-2">
        <input
          id="recurring"
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="recurring" className="text-sm text-gray-700">Recurring transaction (e.g., monthly subscription)</label>
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags (comma separated, optional)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., groceries, weekend, urgent"
          className="input"
          maxLength={200}
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
              {transaction ? 'Update' : 'Add'} Transaction
            </>
          )}
        </button>
      </div>
    </form>
  )
}
