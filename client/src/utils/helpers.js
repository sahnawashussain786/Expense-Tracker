export const CATEGORIES = {
  'Food & Dining': { icon: '🍔', color: '#10B981' },
  'Transportation': { icon: '🚗', color: '#3B82F6' },
  'Housing': { icon: '🏠', color: '#8B5CF6' },
  'Utilities': { icon: '💡', color: '#F59E0B' },
  'Entertainment': { icon: '🎮', color: '#EC4899' },
  'Shopping': { icon: '🛍️', color: '#14B8A6' },
  'Education': { icon: '📚', color: '#6366F1' },
  'Healthcare': { icon: '🏥', color: '#F97316' },
  'Subscriptions': { icon: '📱', color: '#06B6D4' },
  'Travel': { icon: '✈️', color: '#8B5CF6' },
  'Personal Care': { icon: '💄', color: '#F43F5E' },
  'Gifts': { icon: '🎁', color: '#F59E0B' },
  'Insurance': { icon: '🛡️', color: '#64748B' },
  'Bank Fees': { icon: '🏦', color: '#475569' },
  'Other': { icon: '📦', color: '#6B7280' },
}

export const CATEGORY_LIST = Object.keys(CATEGORIES)

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Mobile Wallet',
  'Bank Transfer',
  'Online Payment',
  'Other',
]

export const BUDGET_PERIODS = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' },
  { value: 'semester', label: 'Semester', icon: '🎓' },
  { value: 'yearly', label: 'Yearly', icon: '📅' },
]

export function formatCurrency(amount, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `Rs.${amount.toFixed(0)}`
  }
}

export function formatDate(dateStr, fmt = 'short') {
  const d = new Date(dateStr)
  if (fmt === 'short') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (fmt === 'long') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  if (fmt === 'datetime') return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getCategoryColor(cat) {
  return CATEGORIES[cat]?.color || '#6B7280'
}

export function getCategoryIcon(cat) {
  return CATEGORIES[cat]?.icon || '📦'
}

export function getStatusColor(percent) {
  if (percent >= 90) return 'danger'
  if (percent >= 70) return 'warning'
  return 'success'
}

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
