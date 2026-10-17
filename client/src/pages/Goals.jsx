import { useState, useEffect } from 'react'
import api from '../utils/api'
import GoalForm from '../components/GoalForm'
import { formatCurrency, getCategoryColor, getCategoryIcon } from '../utils/helpers'
import {
  Target, Plus, Trash2, Edit3, X, AlertTriangle, CheckCircle2, Clock, Coins
} from 'lucide-react'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filterCategory, setFilterCategory] = useState('')

  const loadGoals = async () => {
    setLoading(true)
    try {
      const res = await api.get('/goals')
      setGoals(res.data.goals)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load goals' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGoals() }, [])

  const filteredGoals = filterCategory
    ? goals.filter(g => g.category === filterCategory)
    : goals

  const completedGoals = goals.filter(g => g.progress >= 100)
  const inProgressGoals = goals.filter(g => g.progress > 0 && g.progress < 100)
  const pendingGoals = goals.filter(g => g.progress === 0)

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)

  const handleCreate = async (data) => {
    setFormLoading(true)
    try {
      await api.post('/goals', data)
      setShowForm(false)
      setMessage({ type: 'success', text: 'Goal created!' })
      loadGoals()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to create goal' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async (data) => {
    setFormLoading(true)
    try {
      await api.put(`/goals/${editingGoal._id}`, data)
      setEditingGoal(null)
      setShowForm(false)
      setMessage({ type: 'success', text: 'Goal updated!' })
      loadGoals()
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
      await api.delete(`/goals/${deleteConfirm._id}`)
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'Goal deleted' })
      loadGoals()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to delete' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const isOverdue = (goal) => {
    if (!goal.deadline) return false
    return new Date(goal.deadline) < new Date() && goal.progress < 100
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-7 w-7 text-primary-600" /> Savings Goals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Set targets and track your savings progress</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-lg flex items-center gap-2">
          <Plus className="h-5 w-5" /> New Goal
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${message.type === 'error' ? 'bg-danger-50 border-danger-200 text-danger-800' : 'bg-success-50 border-success-200 text-success-800'}`}>
          {message.type === 'error' ? <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : <div className="h-5 w-5 rounded-full bg-success-500 flex items-center justify-center text-white text-xs font-bold">✓</div>}
          <p className="text-sm font-medium flex-1">{message.text}</p>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-current opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><Target className="h-4 w-4" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Goals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {completedGoals.length} completed · {inProgressGoals.length} in progress · {pendingGoals.length} pending
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-100 text-warning-600"><Coins className="h-4 w-4" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Target Amount</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTarget)}</p>
          <p className="text-xs text-gray-400 mt-1">Combined goal targets</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-100 text-success-600"><CheckCircle2 className="h-4 w-4" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Saved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSaved)}</p>
          <p className="text-xs text-gray-400 mt-1">{Math.round((totalSaved / (totalTarget || 1)) * 100)}% of targets</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-100 text-danger-600"><Clock className="h-4 w-4" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0}%</p>
          <p className="text-xs text-gray-400 mt-1">Average completion</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 font-medium mr-1">Filter by category:</span>
        <button onClick={() => setFilterCategory('')} className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${!filterCategory ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          All
        </button>
        {goals.filter(g => g.category).map(g => g.category).filter((v, i, a) => a.indexOf(v) === i).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all flex items-center gap-1 ${filterCategory === cat ? 'bg-white border-gray-300 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            style={filterCategory === cat ? { borderColor: getCategoryColor(cat), color: getCategoryColor(cat) } : {}}
          >
            {getCategoryIcon(cat)} {cat}
          </button>
        ))}
      </div>

      {/* Goals grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <p className="text-sm text-gray-500">Loading goals...</p>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No goals yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create a savings goal to start tracking your progress</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-1.5" /> Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const color = goal.color || getCategoryColor(goal.category)
            const isComplete = goal.progress >= 100
            const isOver = isOverdue(goal)
            return (
              <div
                key={goal._id}
                className={`card p-5 transition-all hover:shadow-md ${isComplete ? 'border-success-200 bg-success-50/30' : isOver ? 'border-danger-200 bg-danger-50/30' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0"
                      style={{ backgroundColor: color + '15' }}
                    >
                      {isComplete ? <CheckCircle2 className="h-5 w-5 text-success-600" /> : <Target className="h-5 w-5" style={{ color }} />}
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${isComplete ? 'text-success-800' : 'text-gray-900'}`}>{goal.name}</h3>
                      {goal.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{getCategoryIcon(goal.category)} {goal.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingGoal(goal); setShowForm(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-colors" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(goal)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-danger-600 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500">
                      {formatCurrency(goal.currentAmount || 0)} saved
                    </span>
                    <span className={`font-semibold ${isComplete ? 'text-success-600' : 'text-gray-700'}`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-success-500' : isOver ? 'bg-danger-500' : ''}`}
                      style={{ width: `${Math.min(goal.progress, 100)}%`, backgroundColor: color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>Target: {formatCurrency(goal.targetAmount)}</span>
                  <span className="font-medium text-gray-600">
                    {formatCurrency((goal.targetAmount || 0) - (goal.currentAmount || 0))} to go
                  </span>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Coins className="h-3.5 w-3.5" />
                    {isComplete ? 'Completed!' : goal.deadline ? `${formatCurrency(goal.savedAmount || 0)} saved` : 'No deadline'}
                  </div>
                  {goal.deadline && (
                    <div className={`flex items-center gap-1 ${isOver ? 'text-danger-600' : 'text-gray-500'}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {isOver ? 'Overdue' : formatDateLocal(goal.deadline)}
                    </div>
                  )}
                </div>

                {/* Status badge */}
                {isComplete && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-success-700 bg-success-50 p-2 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" /> Goal achieved! 🎉
                  </div>
                )}
                {isOver && !isComplete && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-danger-700 bg-danger-50 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4" /> Deadline passed, {Math.round(((goal.targetAmount || 0) - (goal.currentAmount || 0)) / (goal.targetAmount || 1) * 100)}% remaining
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-600" />
                {editingGoal ? 'Edit Goal' : 'Create Savings Goal'}
              </h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <GoalForm
              goal={editingGoal}
              onSubmit={editingGoal ? handleUpdate : handleCreate}
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
                <h2 className="text-base font-bold text-gray-900">Delete Goal?</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 mb-4">
              <p className="text-sm font-medium text-gray-900">{deleteConfirm.name}</p>
              <p className="text-xs text-gray-500 mt-1">Target: {formatCurrency(deleteConfirm.targetAmount)}</p>
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

function formatDateLocal(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
