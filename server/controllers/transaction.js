const Transaction = require('../models/Transaction')
const Budget = require('../models/Budget')
const { isMemoryMode, memory } = require('../db')

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const { description, amount, category, type, date, paymentMethod, note, tags, isRecurring, merchant, userId } = req.body

  try {
    let finalCategory = category

    // Auto-categorize if enabled and category not provided
    if (!category && req.user.autoCategorize) {
      const autoCategory = Transaction.categorizeTransaction(merchant, description)
      if (autoCategory) {
        finalCategory = autoCategory
      }
    }

    if (!finalCategory) {
      return res.status(400).json({ msg: 'Category is required' })
    }

    const uid = userId || req.user.id
    let transaction
    if (isMemoryMode) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      const now = new Date()
      transaction = {
        _id: id,
        user: uid,
        description,
        amount,
        category: finalCategory,
        type: type || 'expense',
        date: date || now,
        paymentMethod: paymentMethod || 'Cash',
        note,
        tags: tags || [],
        isRecurring: isRecurring || false,
        merchant: merchant || '',
        createdAt: now,
        updatedAt: now,
        toObject: function() { return { ...this } },
      }
      memory.transactions.set(id, transaction)
      memory.counters.transactions++
    } else {
      transaction = await Transaction.create({
        user: uid,
        description,
        amount,
        category: finalCategory,
        type: type || 'expense',
        date,
        paymentMethod,
        note,
        tags,
        isRecurring,
        merchant
      })
    }

    // Check budget warning
    const budgetAlerts = await checkBudgetAlerts(req.user.id, finalCategory)

    res.status(201).json({
      transaction,
      alerts: budgetAlerts
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Get all transactions with filtering
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  const {
    page = 1,
    limit = 50,
    type,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query

  const query = { user: req.user.id }

  if (type) query.type = type
  if (category) query.category = category
  if (startDate) query.date = { ...query.date, $gte: new Date(startDate) }
  if (endDate) query.date = { ...query.date, $lte: new Date(endDate) }
  if (minAmount) query.amount = { ...query.amount, $gte: Number(minAmount) }
  if (maxAmount) query.amount = { ...query.amount, $lte: Number(maxAmount) }
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { merchant: { $regex: search, $options: 'i' } },
      { note: { $regex: search, $options: 'i' } }
    ]
  }

  try {
    // Get total count
    const total = await Transaction.countDocuments(query)

    let transactions
    if (isMemoryMode) {
      const docs = []
      for (const [id, t] of memory.transactions) {
        if (t.user !== req.user.id) continue
        if (type && t.type !== type) continue
        if (category && t.category !== category) continue
        if (startDate && new Date(t.date) < new Date(startDate)) continue
        if (endDate && new Date(t.date) > new Date(endDate)) continue
        if (minAmount && t.amount < Number(minAmount)) continue
        if (maxAmount && t.amount > Number(maxAmount)) continue
        if (search) {
          const s = search.toLowerCase()
          if (!t.description.toLowerCase().includes(s) && !(t.merchant || '').toLowerCase().includes(s)) continue
        }
        docs.push(t)
      }
      docs.sort((a, b) => {
        const av = a[sortBy] || a.date
        const bv = b[sortBy] || b.date
        return sortOrder === 'desc' ? new Date(bv) - new Date(av) : new Date(av) - new Date(bv)
      })
      transactions = docs.slice((page - 1) * limit, page * limit)
    } else {
      transactions = await Transaction.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    }

    const formatted = transactions.map(t => ({
      _id: t._id,
      user: t.user,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: new Date(t.date).toISOString(),
      paymentMethod: t.paymentMethod,
      note: t.note,
      tags: t.tags || [],
      isRecurring: t.isRecurring || false,
      merchant: t.merchant,
      createdAt: new Date(t.createdAt).toISOString(),
      updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : null
    }))

    res.json({
      transactions: formatted,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    let transaction
    if (isMemoryMode) {
      for (const [id, t] of memory.transactions) {
        if (t._id === req.params.id && t.user === req.user.id) {
          transaction = t
          break
        }
      }
    } else {
      transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id
      })
    }

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' })
    }

    res.json({
      transaction: {
        _id: transaction._id,
        user: transaction.user,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        date: new Date(transaction.date).toISOString(),
        paymentMethod: transaction.paymentMethod,
        note: transaction.note,
        tags: transaction.tags || [],
        isRecurring: transaction.isRecurring || false,
        merchant: transaction.merchant,
        createdAt: new Date(transaction.createdAt).toISOString(),
        updatedAt: transaction.updatedAt ? new Date(transaction.updatedAt).toISOString() : null
      }
    })
  } catch (error) {
    console.error('Get transaction error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  const { description, amount, category, type, date, paymentMethod, note, tags, isRecurring, merchant } = req.body

  try {
    let transaction
    if (isMemoryMode) {
      for (const [id, t] of memory.transactions) {
        if (t._id === req.params.id && t.user === req.user.id) {
          transaction = t
          break
        }
      }
    } else {
      transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id
      })
    }

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' })
    }

    if (description) transaction.description = description
    if (amount !== undefined) transaction.amount = amount
    if (category) transaction.category = category
    if (type) transaction.type = type
    if (date) transaction.date = new Date(date)
    if (paymentMethod) transaction.paymentMethod = paymentMethod
    if (note !== undefined) transaction.note = note
    if (tags !== undefined) transaction.tags = tags
    if (isRecurring !== undefined) transaction.isRecurring = isRecurring
    if (merchant !== undefined) transaction.merchant = merchant
    transaction.updatedAt = new Date()

    if (isMemoryMode) {
      memory.transactions.set(transaction._id, transaction)
    } else {
      await transaction.save()
    }

    res.json({
      transaction: {
        _id: transaction._id,
        user: transaction.user,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        date: new Date(transaction.date).toISOString(),
        paymentMethod: transaction.paymentMethod,
        note: transaction.note,
        tags: transaction.tags || [],
        isRecurring: transaction.isRecurring || false,
        merchant: transaction.merchant,
        createdAt: new Date(transaction.createdAt).toISOString(),
        updatedAt: new Date(transaction.updatedAt).toISOString()
      }
    })
  } catch (error) {
    console.error('Update transaction error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    let transaction
    if (isMemoryMode) {
      for (const [id, t] of memory.transactions) {
        if (t._id === req.params.id && t.user === req.user.id) {
          transaction = t
          break
        }
      }
    } else {
      transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id
      })
    }

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' })
    }

    if (isMemoryMode) {
      memory.transactions.delete(transaction._id)
    } else {
      await transaction.deleteOne()
    }

    res.json({ msg: 'Transaction removed' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Bulk import transactions
// @route   POST /api/transactions/bulk
// @access  Private
const bulkImport = async (req, res) => {
  const { transactions } = req.body

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ msg: 'Valid transactions array is required' })
  }

  try {
    const created = []
    const errors = []

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i]
      try {
        let category = t.category
        if (!category && req.user.autoCategorize) {
          const autoCategory = Transaction.categorizeTransaction(t.merchant, t.description)
          if (autoCategory) category = autoCategory
        }

        if (!category) {
          errors.push({ index: i, error: 'Category is required' })
          continue
        }

        let transaction
        if (isMemoryMode) {
          const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '_' + i
          const now = new Date(t.date || Date.now())
          transaction = {
            _id: id,
            user: req.user.id,
            description: t.description,
            amount: t.amount,
            category,
            type: t.type || 'expense',
            date: now,
            paymentMethod: t.paymentMethod || 'Cash',
            note: t.note,
            tags: t.tags || [],
            isRecurring: t.isRecurring || false,
            merchant: t.merchant || '',
            createdAt: now,
            updatedAt: now,
            toObject: function() { return { ...this } },
          }
          memory.transactions.set(id, transaction)
          memory.counters.transactions++
        } else {
          transaction = await Transaction.create({
            user: req.user.id,
            description: t.description,
            amount: t.amount,
            category,
            type: t.type || 'expense',
            date: t.date ? new Date(t.date) : Date.now(),
            paymentMethod: t.paymentMethod || 'Cash',
            note: t.note,
            tags: t.tags,
            isRecurring: t.isRecurring || false,
            merchant: t.merchant
          })
        }
        created.push(transaction)
      } catch (err) {
        errors.push({ index: i, error: err.message })
      }
    }

    res.status(201).json({
      imported: created.length,
      failed: errors.length,
      errors
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Get spending summary (aggregations)
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res) => {
  const { startDate, endDate } = req.query
  const now = new Date()
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1)
  const end = endDate ? new Date(endDate) : now

  try {
    const match = {
      user: req.user.id,
      date: { $gte: start, $lte: end },
      type: 'expense'
    }

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
          max: { $max: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ])

    // Payment method breakdown
    const paymentBreakdown = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ])

    // Spending by day of week
    const dayOfWeek = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Monthly trend
    const monthlyTrend = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ])

    // Top merchants
    const topMerchants = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$merchant', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      { $project: { merchant: '$_id', total: 1, count: 1, _id: 0 } }
    ])

    // Total stats
    const totals = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          average: { $avg: '$amount' },
          count: { $sum: 1 },
          maxTransaction: { $max: '$amount' },
          minTransaction: { $min: '$amount' }
        }
      }
    ])

    // Income vs expenses
    const incomeExpense = await Transaction.aggregate([
      { $match: { user: req.user.id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])

    res.json({
      totalSpent: totals.length > 0 ? totals[0].totalSpent : 0,
      totalIncome: incomeExpense.find(i => i._id === 'income')?.total || 0,
      averageTransaction: totals.length > 0 ? totals[0].average : 0,
      transactionCount: totals.length > 0 ? totals[0].count : 0,
      maxTransaction: totals.length > 0 ? totals[0].maxTransaction : 0,
      categoryBreakdown,
      paymentBreakdown,
      spendingByDay: dayOfWeek,
      monthlyTrend,
      topMerchants,
      period: { start: start.toISOString(), end: end.toISOString() }
    })
  } catch (error) {
    console.error('Get summary error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Get budget alerts
// @route   GET /api/transactions/alerts
// @access  Private
const getBudgetAlerts = async (req, res) => {
  try {
    const alerts = await checkBudgetAlerts(req.user.id)
    res.json({ alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// Helper: Check budget alerts
async function checkBudgetAlerts(userId, category = null) {
  const now = new Date()
  const alerts = []
  const uid = typeof userId === 'object' && userId._id ? userId._id : userId

  // Monthly budget check
  if (userId.monthlyBudget && userId.monthlyBudget > 0) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    let spent
    if (isMemoryMode) {
      let total = 0
      for (const [id, t] of memory.transactions) {
        if (t.user !== uid) continue
        if (t.type !== 'expense') continue
        if (new Date(t.date) < monthStart) continue
        total += t.amount
      }
      spent = [{ total }]
    } else {
      spent = await Transaction.aggregate([
        { $match: { user: uid, type: 'expense', date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    }
    const totalSpent = spent.length > 0 ? spent[0].total : 0
    const remaining = userId.monthlyBudget - totalSpent
    const percentUsed = Math.round((totalSpent / userId.monthlyBudget) * 100)

    alerts.push({
      type: 'monthly',
      budget: userId.monthlyBudget,
      spent: totalSpent,
      remaining,
      percentUsed,
      message: percentUsed >= 80
        ? `⚠️ You've used ${percentUsed}% of your monthly budget! Only ${formatCurrency(remaining)} left.`
        : `💰 ${percentUsed}% of monthly budget used. ${formatCurrency(remaining)} remaining.`,
      severity: percentUsed >= 90 ? 'danger' : percentUsed >= 80 ? 'warning' : 'info'
    })
  }

  // Weekly budget check
  if (userId.weeklyBudget && userId.weeklyBudget > 0) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    let spent
    if (isMemoryMode) {
      let total = 0
      for (const [id, t] of memory.transactions) {
        if (t.user !== uid) continue
        if (t.type !== 'expense') continue
        if (new Date(t.date) < weekStart) continue
        total += t.amount
      }
      spent = [{ total }]
    } else {
      spent = await Transaction.aggregate([
        { $match: { user: uid, type: 'expense', date: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    }
    const totalSpent = spent.length > 0 ? spent[0].total : 0
    const remaining = userId.weeklyBudget - totalSpent
    const percentUsed = Math.round((totalSpent / userId.weeklyBudget) * 100)

    alerts.push({
      type: 'weekly',
      budget: userId.weeklyBudget,
      spent: totalSpent,
      remaining,
      percentUsed,
      message: percentUsed >= 80
        ? `⚠️ You've used ${percentUsed}% of your weekly budget! Only ${formatCurrency(remaining)} left.`
        : `📅 ${percentUsed}% of weekly budget used. ${formatCurrency(remaining)} remaining.`,
      severity: percentUsed >= 90 ? 'danger' : percentUsed >= 80 ? 'warning' : 'info'
    })
  }

  // Category-specific budgets
  let categoryBudgets
  if (isMemoryMode) {
    categoryBudgets = []
    for (const [id, b] of memory.budgets) {
      if (b.user !== uid) continue
      if (b.isActive === false) continue
      if (category && b.category !== category) continue
      categoryBudgets.push(b)
    }
  } else {
    categoryBudgets = await Budget.find({
      user: uid,
      isActive: true,
      ...(category && { category })
    })
  }

  for (const budget of categoryBudgets) {
    const periodStart = getPeriodStart(budget.period, budget.startDate || now)
    let spent
    if (isMemoryMode) {
      let total = 0
      for (const [id, t] of memory.transactions) {
        if (t.user !== uid) continue
        if (t.type !== 'expense') continue
        if (budget.category && t.category !== budget.category) continue
        if (new Date(t.date) < periodStart) continue
        total += t.amount
      }
      spent = [{ total }]
    } else {
      spent = await Transaction.aggregate([
        { $match: { user: uid, type: 'expense', category: budget.category || { $exists: true }, date: { $gte: periodStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    }
    const totalSpent = spent.length > 0 ? spent[0].total : 0
    const remaining = budget.amount - totalSpent
    const percentUsed = Math.round((totalSpent / budget.amount) * 100)

    if (percentUsed >= budget.alertThreshold) {
      alerts.push({
        type: 'category',
        name: budget.name,
        category: budget.category,
        budget: budget.amount,
        spent: totalSpent,
        remaining,
        percentUsed,
        message: `⚠️ ${budget.name} budget: ${percentUsed}% used! ${formatCurrency(remaining)} remaining.`,
        severity: percentUsed >= 90 ? 'danger' : 'warning'
      })
    }
  }

  return alerts
}

function getPeriodStart(period, startDate) {
  const d = new Date(startDate)
  switch (period) {
    case 'daily': return d
    case 'weekly': {
      const date = new Date(d)
      date.setDate(d.getDate() - d.getDay())
      date.setHours(0, 0, 0, 0)
      return date
    }
    case 'monthly': return new Date(d.getFullYear(), d.getMonth(), 1)
    case 'semester': return new Date(d.getFullYear(), 7, 1) // Fall semester example
    case 'yearly': return new Date(d.getFullYear(), 0, 1)
    default: return d
  }
}

function formatCurrency(amount) {
  const currency = process.env.CURRENCY || 'INR'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImport,
  getSummary,
  getBudgetAlerts
}
