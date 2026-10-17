const User = require('../models/User')
const Transaction = require('../models/Transaction')

// @desc    Get user goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('goals')
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    // Enrich goals with transaction progress
    const enrichedGoals = await Promise.all(user.goals.map(async (goal) => {
      let spentOnCategory = 0
      if (goal.category) {
        const result = await Transaction.aggregate([
          {
            $match: {
              user: req.user.id,
              type: 'expense',
              category: goal.category,
              date: { $gte: new Date() }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
        spentOnCategory = result.length > 0 ? result[0].total : 0
      }

      const savedAmount = goal.targetAmount - (goal.currentAmount || 0)
      const progress = goal.targetAmount > 0 ? Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100) : 0

      return {
        ...goal.toObject(),
        currentAmount: goal.currentAmount || 0,
        progress,
        savedAmount,
        spentThisPeriod: spentOnCategory
      }
    }))

    res.json({ goals: enrichedGoals })
  } catch (error) {
    console.error('Get goals error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount = 0, deadline, category, color } = req.body

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    if (!name || !targetAmount) {
      return res.status(400).json({ msg: 'Name and target amount are required' })
    }

    user.goals.push({
      name,
      targetAmount,
      currentAmount,
      deadline: deadline ? new Date(deadline) : null,
      category: category || null,
      color: color || '#3B82F6'
    })

    await user.save()

    const goal = user.goals[user.goals.length - 1]
    const progress = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0

    res.status(201).json({
      goal: {
        ...goal.toObject(),
        currentAmount,
        progress
      }
    })
  } catch (error) {
    console.error('Create goal error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, category, color, isActive } = req.body

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    const goalIndex = user.goals.findIndex(g => g._id.toString() === req.params.id)
    if (goalIndex === -1) {
      return res.status(404).json({ msg: 'Goal not found' })
    }

    const goal = user.goals[goalIndex]

    if (name !== undefined) goal.name = name
    if (targetAmount !== undefined) goal.targetAmount = targetAmount
    if (currentAmount !== undefined) goal.currentAmount = currentAmount
    if (deadline !== undefined) goal.deadline = deadline ? new Date(deadline) : null
    if (category !== undefined) goal.category = category
    if (color) goal.color = color

    await user.save()

    const progress = goal.targetAmount > 0 ? Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100) : 0

    res.json({
      goal: {
        ...goal.toObject(),
        currentAmount: goal.currentAmount || 0,
        progress
      }
    })
  } catch (error) {
    console.error('Update goal error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    const initialLength = user.goals.length
    user.goals = user.goals.filter(g => g._id.toString() !== req.params.id)

    if (user.goals.length === initialLength) {
      return res.status(404).json({ msg: 'Goal not found' })
    }

    await user.save()

    res.json({ msg: 'Goal deleted' })
  } catch (error) {
    console.error('Delete goal error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
}
