const express = require('express')
const router = express.Router()
const Transaction = require('../models/Transaction')
const { isMemoryMode, memory } = require('../db')
const auth = require('../middleware/auth')

const categoryIcons = {
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
  'Other': { icon: '📦', color: '#6B7280' }
}

const allCategories = Object.keys(categoryIcons)

const categoryBudgets = {
  'Food & Dining': 500,
  'Transportation': 200,
  'Housing': 1000,
  'Utilities': 150,
  'Entertainment': 100,
  'Shopping': 300,
  'Education': 500,
  'Healthcare': 200,
  'Subscriptions': 50,
  'Travel': 400,
  'Personal Care': 100,
  'Gifts': 150,
  'Insurance': 200,
  'Bank Fees': 50,
  'Other': 200
}

// @desc    Get all categories with spending stats
// @route   GET /api/categories
// @access  Private
router.get('/', auth, async (req, res) => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  try {
    let result
    if (isMemoryMode) {
      const grouped = {}
      for (const [id, t] of memory.transactions) {
        if (t.user !== req.user.id) continue
        if (t.type !== 'expense') continue
        if (new Date(t.date) < monthStart) continue
        const cat = t.category
        if (!grouped[cat]) grouped[cat] = { _id: cat, total: 0, count: 0, amounts: [] }
        grouped[cat].total += t.amount
        grouped[cat].count += 1
        grouped[cat].amounts.push(t.amount)
      }
      result = Object.values(grouped).map(g => ({
        _id: g._id,
        total: g.total,
        count: g.count,
        avgTransaction: g.count > 0 ? g.total / g.count : 0
      }))
      result.sort((a, b) => b.total - a.total)
    } else {
      result = await Transaction.aggregate([
        {
          $match: {
            user: req.user.id,
            type: 'expense',
            date: { $gte: monthStart }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            avgTransaction: { $avg: '$amount' }
          }
        }
      ])
    }

    const spendingMap = {}
    result.forEach(r => {
      spendingMap[r._id] = { spent: r.total, count: r.count, avg: r.avgTransaction }
    })

    const enriched = allCategories.map(cat => {
      const info = categoryIcons[cat]
      const spent = spendingMap[cat]?.spent || 0
      const count = spendingMap[cat]?.count || 0
      const avg = spendingMap[cat]?.avg || 0
      const suggestedBudget = categoryBudgets[cat]
      const percentUsed = suggestedBudget > 0 ? Math.round((spent / suggestedBudget) * 100) : 0

      return {
        name: cat,
        icon: info.icon,
        color: info.color,
        spent,
        count,
        avg,
        suggestedBudget,
        percentUsed: Math.min(percentUsed, 100),
        status: percentUsed >= 90 ? 'danger' : percentUsed >= 70 ? 'warning' : 'ok'
      }
    })

    // Sort by spent amount desc
    enriched.sort((a, b) => b.spent - a.spent)

    res.json({ categories: enriched })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
})

// @desc    Get all categories (without stats)
// @route   GET /api/categories/list
// @access  Private
router.get('/list', auth, (req, res) => {
  const categories = allCategories.map(cat => ({
    name: cat,
    icon: categoryIcons[cat].icon,
    color: categoryIcons[cat].color
  }))
  res.json({ categories })
})

module.exports = router
