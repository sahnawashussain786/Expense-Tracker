import { useState, useEffect, useMemo } from 'react'
import api from '../utils/api'
import TransactionForm from '../components/TransactionForm'
import { formatCurrency, formatDate, getCategoryColor, getCategoryIcon, CATEGORIES, CATEGORY_LIST, PAYMENT_METHODS } from '../utils/helpers'
import {
  Plus, Search, Filter, Download, Upload, Trash2, Edit3, X, ChevronLeft, ChevronRight, RefreshCw,
  Table, List, FileText, AlertTriangle, ChevronDown, SortAsc, SortDesc
} from 'lucide-react'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  // Filters
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // UI states
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('table')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  const totalPages = Math.ceil((transactions.total || 0) / limit)

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page,
        limit,
        sortBy,
        sortOrder,
      })
      if (type) params.set('type', type)
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (minAmount) params.set('minAmount', minAmount)
      if (maxAmount) params.set('maxAmount', maxAmount)

      const res = await api.get(`/transactions?${params.toString()}`)
      setTransactions(res.data)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load transactions' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTransactions() }, [page, limit, sortBy, sortOrder, type, category, search, startDate, endDate, minAmount, maxAmount])

  const applyFilters = () => {
    setPage(1)
    loadTransactions()
  }

  const clearFilters = () => {
    setType('')
    setCategory('')
    setSearch('')
    setStartDate('')
    setEndDate('')
    setMinAmount('')
    setMaxAmount('')
    setPage(1)
  }

  const hasActiveFilters = type || category || search || startDate || endDate || minAmount || maxAmount

  const handleAdd = async (data) => {
    setFormLoading(true)
    try {
      await api.post('/transactions', data)
      setShowForm(false)
      setMessage({ type: 'success', text: 'Transaction added!' })
      loadTransactions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to add transaction' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (data) => {
    setFormLoading(true)
    try {
      await api.put(`/transactions/${editingTx._id}`, data)
      setEditingTx(null)
      setShowForm(false)
      setMessage({ type: 'success', text: 'Transaction updated!' })
      loadTransactions()
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
      await api.delete(`/transactions/${deleteConfirm._id}`)
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'Transaction deleted' })
      loadTransactions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to delete' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const requestExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ page: 1, limit: 500 })
      if (type) params.set('type', type)
      if (category) params.set('category', category)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      const res = await api.get(`/transactions?${params.toString()}`)
      const rows = res.data.transactions.map(t => ({
        Date: formatDate(t.date, 'long'),
        Description: t.description,
        Category: t.category,
        Type: t.type,
        Amount: t.amount,
        PaymentMethod: t.paymentMethod,
        Merchant: t.merchant || '',
        Note: t.note || '',
        Tags: (t.tags || []).join(', '),
      }))
      const header = Object.keys(rows[0] || {}).join(',')
      const dataRows = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      const csv = [header, ...dataRows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: `Exported ${rows.length} transactions` })
    } catch (err) {
      setMessage({ type: 'error', text: 'Export failed' })
    } finally {
      setExporting(false)
    }
  }

  const requestImport = async () => {
    if (!importPreview) return
    setImporting(true)
    try {
      const res = await api.post('/transactions/bulk', {
        transactions: importPreview.map(row => ({
          description: row.Description || row.description,
          amount: parseFloat(row.Amount || row.amount),
          category: row.Category || row.category,
          type: (row.Type || row.type || 'expense').toLowerCase(),
          date: row.Date || row.date,
          paymentMethod: row.PaymentMethod || row.paymentMethod || 'Cash',
          merchant: row.Merchant || row.merchant,
          note: row.Note || row.note,
          tags: (row.Tags || row.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        })),
      })
      setImportFile(null)
      setImportPreview(null)
      setMessage({ type: 'success', text: `Imported ${res.data.imported}, ${res.data.failed} failed` })
      loadTransactions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Import failed' })
    } finally {
      setImporting(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) return
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
      const preview = lines.slice(1, 11).map(line => {
        const vals = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',')
        const obj = {}
        headers.forEach((h, i) => { obj[h] = (vals[i] || '').replace(/^"|"$/g, '') })
        return obj
      })
      setImportPreview(preview)
    }
    reader.readAsText(file)
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortIcon = (field) => sortBy === field ? (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />) : null

  const summary = useMemo(() => {
    let expenses = 0, income = 0, count = 0
    transactions.transactions?.forEach(t => {
      count++
      if (t.type === 'expense') expenses += t.amount
      else income += t.amount
    })
    return { expenses, income, count }
  }, [transactions.transactions])

  const catCounts = useMemo(() => {
    const map = {}
    transactions.transactions?.forEach(t => {
      if (t.type === 'expense') {
        map[t.category] = (map[t.category] || 0) + t.amount
      }
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [transactions.transactions])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">{summary.count} transactions · {formatCurrency(summary.expenses)} spent · {formatCurrency(summary.income)} income</p>
        </div>
        <div className="flex gap-2">
          <button onClick={requestExport} disabled={exporting || !transactions.transactions?.length} className="btn btn-secondary flex items-center gap-1.5">
            <Download className={`h-4 w-4 ${exporting ? 'animate-spin' : ''}`} /> Export CSV
          </button>
          <label className="btn btn-secondary flex items-center gap-1.5 cursor-pointer">
            <Upload className="h-4 w-4" /> Import
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
          <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${message.type === 'error' ? 'bg-danger-50 border-danger-200 text-danger-800' : 'bg-success-50 border-success-200 text-success-800'}`}>
          {message.type === 'error' ? <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : <div className="h-5 w-5 rounded-full bg-success-500 flex items-center justify-center text-white text-xs font-bold">✓</div>}
          <p className="text-sm font-medium">{message.text}</p>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-current opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filter bar */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input pl-9"
              onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn btn-sm flex items-center gap-1.5 ${showFilters ? 'btn-primary' : 'btn-secondary'}`}>
            <Filter className="h-4 w-4" /> Filters
            {hasActiveFilters && <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">{catCounts.length}</span>}
          </button>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`} title="Table view">
              <Table className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`} title="List view">
              <List className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => { setPage(1); loadTransactions() }} className="btn btn-sm btn-secondary flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="px-3 pb-3 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Type</label>
              <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="input">
                <option value="">All Types</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="input">
                <option value="">All Categories</option>
                {CATEGORY_LIST.map(c => <option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">From Date</label>
              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1) }} className="input" />
            </div>
            <div>
              <label className="label">To Date</label>
              <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1) }} className="input" />
            </div>
            <div>
              <label className="label">Min Amount</label>
              <input type="number" placeholder="0" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(1) }} className="input" />
            </div>
            <div>
              <label className="label">Max Amount</label>
              <input type="number" placeholder="99999" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(1) }} className="input" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={clearFilters} className="btn btn-sm btn-secondary flex-1">Clear</button>
              <button onClick={applyFilters} className="btn btn-sm btn-primary flex-1">Apply</button>
            </div>
            <div></div>
          </div>
        )}
      </div>

      {/* Category summary bar */}
      {catCounts.length > 0 && viewMode === 'table' && (
        <div className="flex flex-wrap gap-2">
          {catCounts.slice(0, 8).map(([cat, total]) => (
            <button
              key={cat}
              onClick={() => { setCategory(category === cat ? '' : cat); setPage(1) }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all flex items-center gap-1.5 ${category === cat ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              style={category === cat ? { borderColor: getCategoryColor(cat), color: getCategoryColor(cat) } : {}}
            >
              {getCategoryIcon(cat)} {cat} <span className="text-gray-400 ml-1">{formatCurrency(total)}</span>
            </button>
          ))}
          {catCounts.length > 8 && (
            <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-500">
              +{catCounts.length - 8} more
            </button>
          )}
        </div>
      )}

      {/* Transaction list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <p className="text-sm text-gray-500">Loading transactions...</p>
          </div>
        </div>
      ) : transactions.transactions?.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No transactions found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first expense to get started'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
          )}
          {!hasActiveFilters && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="h-4 w-4 mr-1.5" /> Add First Transaction
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Transaction</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-gray-700">
                      Date {sortIcon('date')}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    <button onClick={() => toggleSort('paymentMethod')} className="flex items-center gap-1 hover:text-gray-700">
                      Payment {sortIcon('paymentMethod')}
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 justify-end hover:text-gray-700">
                      Amount {sortIcon('amount')}
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.transactions?.map((tx) => (
                  <tr key={tx._id} className="table-row">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm flex-shrink-0`} style={{ backgroundColor: getCategoryColor(tx.category) + '15' }}>
                          {getCategoryIcon(tx.category)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                          {tx.merchant && <p className="text-xs text-gray-400 mt-0.5">{tx.merchant}</p>}
                          {tx.isRecurring && <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">recurring</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tx.type === 'income' ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-700'}`}>
                        {getCategoryIcon(tx.category)} {tx.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatDate(tx.date, 'datetime')}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-600">{tx.paymentMethod}</span>
                      {tx.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {tx.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">#{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`px-4 py-3.5 text-sm font-semibold text-right whitespace-nowrap ${tx.type === 'income' ? 'text-success-600' : 'text-gray-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingTx(tx); setShowForm(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-colors" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(tx)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-danger-600 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, transactions.total)} of {transactions.total} results
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-sm btn-secondary p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700 px-2 py-1">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-sm btn-secondary p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // List view
        <div className="space-y-2">
          {transactions.transactions?.map((tx) => (
            <div key={tx._id} className="card p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0`} style={{ backgroundColor: getCategoryColor(tx.category) + '15' }}>
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(tx.date, 'short')} · {tx.paymentMethod}
                    {tx.merchant ? ` · ${tx.merchant}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success-600' : 'text-gray-900'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingTx(tx); setShowForm(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary-600">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(tx)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-danger-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm btn-secondary">Prev</button>
              <span className="text-sm text-gray-700">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-sm btn-secondary">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Bulk import modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setImportFile(null); setImportPreview(null) }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Import Transactions</h2>
              <button onClick={() => { setImportFile(null); setImportPreview(null) }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Preview of first {importPreview.length} rows from <span className="font-medium">{importFile?.name}</span>.
              Make sure columns match: Description, Amount, Category, Type, Date, PaymentMethod, Merchant, Note, Tags
            </p>
            <div className="overflow-x-auto scrollbar-thin rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">#</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Description</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Amount</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Category</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.Description || row.description || '—'}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">${row.Amount || row.amount || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{row.Category || row.category || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{row.Date || row.date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {importPreview.length} rows previewed. {importFile?.name && `File: ${importFile.name}`}
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setImportFile(null); setImportPreview(null) }} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={requestImport} disabled={importing} className="btn btn-primary flex-1">
                {importing ? (
                  <span className="flex items-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Importing...</span>
                ) : (
                  <><Upload className="h-4 w-4 mr-1.5" /> Import {importPreview.length} Transactions</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-600" />
                {editingTx ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <TransactionForm
              transaction={editingTx}
              onSubmit={editingTx ? handleEdit : handleAdd}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-100 text-danger-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Delete Transaction?</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 mb-4">
              <p className="text-sm font-medium text-gray-900">{deleteConfirm.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(deleteConfirm.amount)} · {deleteConfirm.category}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="btn btn-danger flex-1">
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
