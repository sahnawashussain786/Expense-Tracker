import { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatCurrency, formatDate, MONTHS, DAYS_OF_WEEK, getCategoryColor, getCategoryIcon, CATEGORIES } from '../utils/helpers'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import {
  BarChart3, PieChart as PieIcon, TrendingUp, CreditCard, Calendar, DollarSign, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#F97316', '#14B8A6']

export default function Insights() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')
  const [message, setMessage] = useState({ type: '', text: '' })

  const loadSummary = async () => {
    setLoading(true)
    try {
      const start = getDateRangeStart(dateRange)
      const end = new Date()
      const res = await api.get('/transactions/summary', {
        params: { startDate: start.toISOString(), endDate: end.toISOString() }
      })
      setSummary(res.data)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load insights' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSummary() }, [dateRange])

  const getDateRangeStart = (range) => {
    const now = new Date()
    switch (range) {
      case 'week': {
        const d = new Date(now)
        d.setDate(d.getDate() - d.getDay())
        d.setHours(0, 0, 0, 0)
        return d
      }
      case 'quarter': return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      case 'year': return new Date(now.getFullYear(), 0, 1)
      case 'all': return new Date(0)
      default: return new Date(now.getFullYear(), now.getMonth(), 1)
    }
  }

  const totalSpent = summary?.totalSpent || 0
  const totalIncome = summary?.totalIncome || 0
  const net = totalIncome - totalSpent
  const avgTransaction = summary?.averageTransaction || 0
  const txCount = summary?.transactionCount || 0

  const monthChange = (() => {
    const trend = summary?.monthlyTrend || []
    if (trend.length < 2) return null
    const curr = trend[0]?.total || 0
    const prev = trend[1]?.total || 0
    return prev > 0 ? ((curr - prev) / prev) * 100 : null
  })()

  // Category data for pie chart
  const categoryData = (summary?.categoryBreakdown || []).map((c, i) => ({
    name: c._id,
    value: c.total,
    color: getCategoryColor(c._id),
    icon: getCategoryIcon(c._id),
    percent: totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0,
  }))

  // Payment method data
  const paymentData = (summary?.paymentBreakdown || []).map((p, i) => ({
    name: p._id,
    value: p.total,
    count: p.count,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6366F1'][i % 7],
  }))

  // Daily spending (from day of week)
  const dailyData = (summary?.spendingByDay || []).map((d, i) => ({
    day: DAYS_OF_WEEK[d._id - 1] || '',
    value: d.total,
    fullDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d._id - 1] || '',
  }))

  // Monthly trend
  const monthlyData = (summary?.monthlyTrend || []).map((m, i) => ({
    month: MONTHS[m._id.month - 1] + ' ' + (m._id.year % 100),
    year: m._id.year,
    value: m.total,
    count: m.count,
  })).reverse()

  // Category bar chart sorted
  const catBarData = [...categoryData].sort((a, b) => b.value - a.value).slice(0, 10)

  // Expense vs income trend
  const incExpData = (summary?.monthlyTrend || []).map((m, i) => {
    const result = summary?.monthlyTrend?.find?.(t => t._id.year === m._id.year && t._id.month === m._id.month)
    return {
      month: MONTHS[m._id.month - 1] + ' ' + (m._id.year % 100),
      expenses: m.total,
    }
  }).reverse()

  const CustomTooltip = ({ active, payload, label, type = 'bar' }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg border p-3 shadow-lg bg-white ${type === 'pie' ? 'min-w-[160px]' : ''}`}>
          <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-xs text-gray-500" style={{ color: entry.color }}>
              {type === 'pie' ? `${entry.name}: ` : `${entry.name}: `}
              <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <p className="text-sm text-gray-500">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary-600" /> Insights
          </h1>
          <p className="text-sm text-gray-500 mt-1">Visual breakdown of your spending patterns</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all capitalize ${dateRange === range ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {message.text && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${message.type === 'error' ? 'bg-danger-50 border-danger-200 text-danger-800' : 'bg-success-50 border-success-200 text-success-800'}`}>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="h-4 w-4 text-success-600" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Income</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{txCount}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-warning-600" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg/Txn</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(avgTransaction)}</p>
        </div>
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown - pie */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary-600" /> Spending by Category
            </h2>
            {monthChange !== null && (
              <span className={`text-xs font-medium flex items-center gap-1 ${monthChange < 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {monthChange < 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                {Math.abs(monthChange).toFixed(1)}% vs last period
              </span>
            )}
          </div>
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <PieIcon className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-1/2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip type="pie" />} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: categoryData.find(c => c.name === value)?.color }} />
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                {categoryData.slice(0, 8).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-sm text-gray-700 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400 w-10 text-right">{cat.percent}%</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(cat.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category bar chart */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-600" /> Top Spending Categories
          </h2>
          {catBarData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <BarChart3 className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catBarData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => '$' + (v / 1000).toFixed(1) + 'k'} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {catBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly trend - area */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-600" /> Spending Trend
          </h2>
          {monthlyData.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <TrendingUp className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Not enough data yet</p>
              <p className="text-xs text-gray-300 mt-1">Add more transactions to see trends</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => '$' + (v / 1000).toFixed(1) + 'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Payment method distribution */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary-600" /> Spending by Payment Method
          </h2>
          {paymentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CreditCard className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {paymentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip type="pie" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {paymentData.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-gray-700 truncate">{p.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily spending pattern */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" /> Spending by Day of Week
          </h2>
          {dailyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => '$' + (v / 1000).toFixed(1) + 'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Spent">
                    {dailyData.map((entry, i) => (
                      <Cell key={i} fill={i === Math.max(...dailyData.map(d => d.value)) ? '#EF4444' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Average
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Highest
            </div>
          </div>
        </div>

        {/* Net worth over time */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary-600" /> Monthly Summary
          </h2>
          {monthlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <DollarSign className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-16">{m.month}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${Math.min(100, (m.value / (Math.max(...monthlyData.map(d => d.value)) || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(m.value)}</span>
                    <span className="text-xs text-gray-400">({m.count} txns)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Budget usage overview */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary-600" /> Budget Health Overview
        </h2>
        {!summary ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Loading budget data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 p-5 border border-primary-100">
              <p className="text-xs font-medium text-primary-700 uppercase tracking-wider mb-1">Overall Budget Usage</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-800">
                  {totalSpent > 0 ? Math.round((totalSpent / (summary?.totalSpent || totalSpent + 1)) * 100) : 0}%
                </span>
                <span className="text-sm text-primary-600">of estimated budget</span>
              </div>
              <p className="text-xs text-primary-600 mt-2">
                You&apos;ve spent {formatCurrency(totalSpent)} in this period
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-success-50 to-green-50 p-5 border border-success-100">
              <p className="text-xs font-medium text-success-700 uppercase tracking-wider mb-1">Income Ratio</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-success-800">
                  {totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 0}%
                </span>
                <span className="text-sm text-success-600">spent of income</span>
              </div>
              <p className="text-xs text-success-600 mt-2">
                Savings rate: {formatCurrency(Math.max(0, totalIncome - totalSpent))}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-warning-50 to-yellow-50 p-5 border border-warning-100">
              <p className="text-xs font-medium text-warning-700 uppercase tracking-wider mb-1">Average Transaction</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-warning-800">{formatCurrency(avgTransaction)}</span>
                <span className="text-sm text-warning-600">per transaction</span>
              </div>
              <p className="text-xs text-warning-600 mt-2">
                {txCount} transactions total this period
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
