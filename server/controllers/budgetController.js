const Budget = require('../models/Budget')
const Transaction = require('../models/Transaction')

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  const { name, amount, period, category, startDate, endDate, alertThreshold, color, notes } = req.body

  try {
    // Check for duplicate
    const existing = await Budget.findOne({
      user: req.user.id,
      name,
      period
    })

    if (existing) {
      return res.status(400).json({ msg: 'A budget with this name and period already exists' })
    }

    const budget = await Budget.create({
      user: req.user.id,
      name,
      amount,
      period,
      category,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      alertThreshold: alertThreshold || 80,
      color,
      notes
    })

    res.status(201).json({ budget })
  } catch (error) {
    console.error('Create budget error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id, isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    // Enrich with current usage
    const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
      const spent = await getBudgetSpent(req.user.id, budget)
      const percentUsed = Math.round((spent / budget.amount) * 100)
      const remaining = budget.amount - spent
      const isOver = remaining < 0

      return {
        ...budget,
        spent,
        percentUsed,
        remaining,
        isOver,
        status: isOver ? 'exceeded' : percentUsed >= budget.alertThreshold ? 'warning' : 'ok'
      }
    }))

    res.json({ budgets: enrichedBudgets })
  } catch (error) {
    console.error('Get budgets error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    })

    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' })
    }

    const spent = await getBudgetSpent(req.user.id, budget)
    const percentUsed = Math.round((spent / budget.amount) * 100)
    const remaining = budget.amount - spent
    const isOver = remaining < 0

    res.json({
      budget: {
        ...budget.toObject(),
        spent,
        percentUsed,
        remaining,
        isOver,
        status: isOver ? 'exceeded' : percentUsed >= budget.alertThreshold ? 'warning' : 'ok'
      }
    })
  } catch (error) {
    console.error('Get budget error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  const { name, amount, period, category, startDate, endDate, alertThreshold, color, notes, isActive } = req.body

  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    })

    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' })
    }

    if (name) budget.name = name
    if (amount !== undefined) budget.amount = amount
    if (period) budget.period = period
    if (category !== undefined) budget.category = category
    if (startDate) budget.startDate = new Date(startDate)
    if (endDate !== undefined) budget.endDate = endDate ? new Date(endDate) : null
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold
    if (color) budget.color = color
    if (notes !== undefined) budget.notes = notes
    if (isActive !== undefined) budget.isActive = isActive

    await budget.save()

    const spent = await getBudgetSpent(req.user.id, budget)
    const percentUsed = Math.round((spent / budget.amount) * 100)
    const remaining = budget.amount - spent

    res.json({
      budget: {
        ...budget.toObject(),
        spent,
        percentUsed,
        remaining
      }
    })
  } catch (error) {
    console.error('Update budget error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    })

    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' })
    }

    await budget.deleteOne()

    res.json({ msg: 'Budget deleted' })
  } catch (error) {
    console.error('Delete budget error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Get budget spending history (chart data)
// @route   GET /api/budgets/:id/history
// @access  Private
const getBudgetHistory = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    })

    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' })
    }

    const periodStart = getPeriodStart(budget.period, budget.startDate)
    const now = new Date()
    const points = []

    switch (budget.period) {
      case 'daily':
        for (let i = 0; i < 7; i++) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          d.setHours(0, 0, 0, 0)
          const spent = await getSpentForDate(req.user.id, budget, d)
          points.push({ date: d.toISOString().split('T')[0], spent })
        }
        break
      case 'weekly':
        for (let i = 0; i < 8; i++) {
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - (i * 7) - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(startOfWeek.getDate() + 6)
          const spent = await getSpentForRange(req.user.id, budget, startOfWeek, endOfWeek)
          points.push({
            date: `${startOfWeek.toISOString().split('T')[0]} - ${endOfWeek.toISOString().split('T')[0]}`,
            spent
          })
        }
        break
      case 'monthly':
        for (let i = 0; i < 6; i++) {
          const m = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const spent = await getSpentForMonth(req.user.id, budget, m)
          points.push({ date: m.toISOString().split('T')[0], spent })
        }
        break
      default:
        points.push({ date: 'N/A', spent: 0 })
    }

    const totalSpent = await getBudgetSpent(req.user.id, budget)
    const percentUsed = Math.round((totalSpent / budget.amount) * 100)

    res.json({
      history: points.reverse(),
      totalSpent,
      percentUsed,
      budgetAmount: budget.amount
    })
  } catch (error) {
    console.error('Get budget history error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// Helpers
async function getBudgetSpent(userId, budget) {
  const periodStart = getPeriodStart(budget.period, budget.startDate)
  const periodEnd = budget.endDate ? new Date(budget.endDate) : new Date()

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: periodStart, $lte: periodEnd },
        ...(budget.category && { category: budget.category })
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  return result.length > 0 ? result[0].total : 0
}

async function getSpentForDate(userId, budget, date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start, $lte: end },
        ...(budget.category && { category: budget.category })
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  return result.length > 0 ? result[0].total : 0
}

async function getSpentForRange(userId, budget, start, end) {
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start, $lte: end },
        ...(budget.category && { category: budget.category })
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  return result.length > 0 ? result[0].total : 0
}

async function getSpentForMonth(userId, budget, month) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1)
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999)

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start, $lte: end },
        ...(budget.category && { category: budget.category })
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  return result.length > 0 ? result[0].total : 0
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
    case 'semester': return new Date(d.getFullYear(), 7, 1)
    case 'yearly': return new Date(d.getFullYear(), 0, 1)
    default: return d
  }
}

module.exports = {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetHistory
}
