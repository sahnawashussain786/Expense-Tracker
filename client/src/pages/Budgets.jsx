import { useState, useEffect } from 'react'
import api from '../utils/api'
import BudgetForm from '../components/BudgetForm'
import { formatCurrency, getCategoryColor, getCategoryIcon, BUDGET_PERIODS, CATEGORIES } from '../utils/helpers'
import {
  Plus, PiggyBank, Trash2, Edit3, X, AlertTriangle, TrendingDown, Calendar, Target,
  ChevronRight, BarChart3, DollarSign, Clock
} from 'lucide-react'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const loadBudgets = async () => {
    setLoading(true)
    try {
      const res = await api.get('/budgets')
      setBudgets(res.data.budgets)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load budgets' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBudgets() }, [])

  const handleCreate = async (data) => {
    setFormLoading(true)
    try {
      await api.post('/budgets', data)
      setShowForm(false)
      setMessage({ type: 'success', text: 'Budget created!' })
      loadBudgets()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to create budget' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async (data) => {
    setFormLoading(true)
    try {
      await api.put(`/budgets/${editingBudget._id}`, data)
      setEditingBudget(null)
      setShowForm(false)
      setMessage({ type: 'success', text: 'Budget updated!' })
      loadBudgets()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    try {
      await api.delete(`/budgets/${deleteConfirm._id}`)
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'Budget deleted' })
      loadBudgets()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to delete' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const loadHistory = async (budget) => {
    setHistoryLoading(true)
    try {
      const res = await api.get(`/budgets/${budget._id}/history`)
      setHistory({ ...res.data, budgetId: budget._id, budgetName: budget.name, color: budget.color })
    } catch (err) {
      console.error('History load error', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const getPeriodLabel = (period) => {
    const p = BUDGET_PERIODS.find(b => b.value === period)
    return p ? `${p.icon} ${p.label}` : period
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PiggyBank className="h-7 w-7 text-primary-600" /> Budgets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Set spending limits and get warned before you overspend</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-lg flex items-center gap-2">
          <Plus className="h-5 w-5" /> Create Budget
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${message.type === 'error' ? 'bg-danger-50 border-danger-200 text-danger-800' : 'bg-success-50 border-success-200 text-success-800'}`}>
          {message.type === 'error' ? <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : <div className="h-5 w-5 rounded-full bg-success-500 flex items-center justify-center text-white text-xs font-bold">✓</div>}
          <p className="text-sm font-medium flex-1">{message.text}</p>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-current opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><DollarSign className="h-4 w-4" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Budgeted</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudgeted)}</p>
          <p className="text-xs text-gray-400 mt-1">{budgets.length} active budgets</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-100 text-danger-600"><TrendingDown className="h-4 w-4" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-400 mt-1">{Math.round((totalSpent / (totalBudgeted || 1)) * 100)}% of budget</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-100 text-success-600"><Target className="h-4 w-4" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</span>
          </div>
          <p className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-danger-600' : 'text-success-600'}`}>
            {formatCurrency(Math.abs(totalRemaining))}
            {totalRemaining < 0 ? ' over' : ' left'}
          </p>
          <p className="text-xs text-gray-400 mt-1">{budgets.filter(b => b.status === 'exceeded').length} budgets exceeded</p>
        </div>
      </div>

      {/* Budgets grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <p className="text-sm text-gray-500">Loading budgets...</p>
          </div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
            <PiggyBank className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No budgets yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create a budget to start tracking your spending limits</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-1.5" /> Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const color = budget.color || getCategoryColor(budget.category)
            const isDanger = budget.status === 'exceeded'
            const isWarning = budget.status === 'warning'
            return (
              <div
                key={budget._id}
                className={`card p-5 transition-all hover:shadow-md ${isDanger ? 'border-danger-200 bg-danger-50/30' : isWarning ? 'border-warning-200 bg-warning-50/30' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0"
                      style={{ backgroundColor: color + '15' }}
                    >
                      {budget.category ? getCategoryIcon(budget.category) : <DollarSign className="h-5 w-5" style={{ color }} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{budget.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{getPeriodLabel(budget.period)}</span>
                        {budget.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{budget.category}</span>
                        )}
                        {budget.isActive === false && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Paused</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingBudget(budget); setShowForm(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-colors" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(budget)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-danger-600 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500">{formatCurrency(budget.spent)} of {formatCurrency(budget.amount)} used</span>
                    <span className={`font-semibold ${isDanger ? 'text-danger-600' : isWarning ? 'text-warning-600' : 'text-gray-700'}`}>
                      {budget.percentUsed}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-danger-500' : isWarning ? 'bg-warning-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(budget.percentUsed, 100)}%`, backgroundColor: color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatCurrency(budget.remaining)} remaining</span>
                  <button
                    onClick={() => loadHistory(budget)}
                    className={`flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium ${historyLoading && history?.budgetId === budget._id ? 'animate-spin' : ''}`}
                  >
                    {history?.budgetId === budget._id ? (
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : (
                      <BarChart3 className="h-3 w-3" />
                    )}
                    {history?.budgetId === budget._id ? 'History' : 'View History'}
                  </button>
                </div>

                {/* Alert badge */}
                {isDanger && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-danger-700 bg-danger-50 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    {budget.isOver ? `⚠️ Budget exceeded by ${formatCurrency(Math.abs(budget.remaining))}!` : 'Budget limit reached!'}
                  </div>
                )}
                {isWarning && !isDanger && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-warning-700 bg-warning-50 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    Approaching budget limit
                  </div>
                )}

                {/* Quick stats */}
                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{budget.count || 0}</p>
                    <p className="text-xs text-gray-400">Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(budget.avg || 0)}</p>
                    <p className="text-xs text-gray-400">Avg/Txn</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{getPeriodLabel(budget.period)}</p>
                    <p className="text-xs text-gray-400">Period</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* History modal */}
      {history && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setHistory(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                {history.budgetName} History
              </h2>
              <button onClick={() => setHistory(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Budget</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(history.budgetAmount)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Spent</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(history.totalSpent)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Used</p>
                <p className={`text-lg font-bold ${history.percentUsed >= 90 ? 'text-danger-600' : history.percentUsed >= 70 ? 'text-warning-600' : 'text-success-600'}`}>
                  {history.percentUsed}%
                </p>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="h-6 w-6 animate-spin text-primary-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <p className="text-sm text-gray-500 ml-2">Loading history...</p>
              </div>
            ) : history.history?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No history data available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.history.map((point, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: history.color }} />
                      <span className="text-sm text-gray-700">{point.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (point.spent / (history.budgetAmount || 1)) * 100)}%`, backgroundColor: history.color }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-24 text-right">{formatCurrency(point.spent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-600" />
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <BudgetForm
              budget={editingBudget}
              onSubmit={editingBudget ? handleUpdate : handleCreate}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-100 text-danger-600"><Trash2 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Delete Budget?</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 mb-4">
              <p className="text-sm font-medium text-gray-900">{deleteConfirm.name}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(deleteConfirm.amount)} · {getPeriodLabel(deleteConfirm.period)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="btn btn-danger flex-1">{deleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
