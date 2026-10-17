const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const config = require('../config')
const { isMemoryMode, memory, generateId } = require('../db')

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, phone } = req.body

  try {
    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists with this email' })
    }

    // Create user
    let user
    if (isMemoryMode) {
      const id = generateId()
      const hashed = await bcrypt.hash(password, 10)
      user = {
        _id: id,
        name,
        email,
        password: hashed,
        phone,
        monthlyBudget: 0,
        weeklyBudget: 0,
        semesterBudget: 0,
        currency: 'USD',
        notificationsEnabled: true,
        autoCategorize: true,
        favoriteCategories: [],
        goals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: function() { return { ...this } },
        toJSON: function() { const o = this.toObject(); delete o.password; return o }
      }
      memory.users.set(id, user)
      memory.counters.users++
    } else {
      user = await User.create({ name, email, password, phone })
    }

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        monthlyBudget: user.monthlyBudget,
        weeklyBudget: user.weeklyBudget,
        semesterBudget: user.semesterBudget,
        currency: user.currency,
        notificationsEnabled: user.notificationsEnabled,
        autoCategorize: user.autoCategorize,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ msg: 'Server error during registration' })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body

  try {
    let user
    if (isMemoryMode) {
      for (const [, u] of memory.users) {
        if (u.email === email) { user = u; break }
      }
    } else {
      user = await User.findOne({ email }).select('+password')
    }
    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' })
    }

    let isMatch
    if (isMemoryMode) {
      isMatch = await bcrypt.compare(password, user.password)
    } else {
      isMatch = await user.matchPassword(password)
    }
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user._id)
    if (isMemoryMode) {
      memory.tokenUsers.set(token, user._id)
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        monthlyBudget: user.monthlyBudget,
        weeklyBudget: user.weeklyBudget,
        semesterBudget: user.semesterBudget,
        currency: user.currency,
        notificationsEnabled: user.notificationsEnabled,
        autoCategorize: user.autoCategorize,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ msg: 'Server error during login' })
  }
}

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    let user
    if (isMemoryMode) {
      user = memory.users.get(req.user.id) || null
    } else {
      user = await User.findById(req.user.id)
    }
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        monthlyBudget: user.monthlyBudget,
        weeklyBudget: user.weeklyBudget,
        semesterBudget: user.semesterBudget,
        currency: user.currency,
        notificationsEnabled: user.notificationsEnabled,
        autoCategorize: user.autoCategorize,
        favoriteCategories: user.favoriteCategories,
        goals: user.goals,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, phone, monthlyBudget, weeklyBudget, semesterBudget, currency, notificationsEnabled, autoCategorize } = req.body

  try {
    let user
    if (isMemoryMode) {
      user = memory.users.get(req.user.id) || null
    } else {
      user = await User.findById(req.user.id)
    }

    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    if (name) user.name = name
    if (phone !== undefined) user.phone = phone
    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget
    if (weeklyBudget !== undefined) user.weeklyBudget = weeklyBudget
    if (semesterBudget !== undefined) user.semesterBudget = semesterBudget
    if (currency) user.currency = currency
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled
    if (autoCategorize !== undefined) user.autoCategorize = autoCategorize

    if (isMemoryMode) {
      user.updatedAt = new Date()
    } else {
      await user.save()
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        monthlyBudget: user.monthlyBudget,
        weeklyBudget: user.weeklyBudget,
        semesterBudget: user.semesterBudget,
        currency: user.currency,
        notificationsEnabled: user.notificationsEnabled,
        autoCategorize: user.autoCategorize
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body

  try {
    let user
    if (isMemoryMode) {
      user = memory.users.get(req.user.id) || null
    } else {
      user = await User.findById(req.user.id).select('+password')
    }
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    // Check current password
    const isMatch = isMemoryMode
      ? await bcrypt.compare(currentPassword, user.password)
      : await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' })
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters' })
    }

    user.password = isMemoryMode
      ? await bcrypt.hash(newPassword, 10)
      : newPassword
    if (isMemoryMode) {
      user.updatedAt = new Date()
    } else {
      await user.save()
    }

    const token = generateToken(user._id)

    res.json({
      token,
      msg: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Update password error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    if (isMemoryMode) {
      memory.users.delete(req.user.id)
      for (const [id, t] of memory.transactions) {
        if (t.user === req.user.id) memory.transactions.delete(id)
      }
      for (const [id, b] of memory.budgets) {
        if (b.user === req.user.id) memory.budgets.delete(id)
      }
      for (const [id, g] of memory.goals) {
        if (g.user === req.user.id) memory.goals.delete(id)
      }
    } else {
      await User.findByIdAndDelete(req.user.id)
      await require('../models/Transaction').deleteMany({ user: req.user.id })
      await require('../models/Budget').deleteMany({ user: req.user.id })
    }
    res.json({ msg: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

// @desc    Update favorite categories
// @route   PUT /api/auth/favorites
// @access  Private
const updateFavorites = async (req, res) => {
  const { favoriteCategories } = req.body

  try {
    let user
    if (isMemoryMode) {
      user = memory.users.get(req.user.id) || null
    } else {
      user = await User.findById(req.user.id)
    }
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    user.favoriteCategories = favoriteCategories || []
    if (isMemoryMode) {
      user.updatedAt = new Date()
    } else {
      await user.save()
    }

    res.json({
      user: {
        favoriteCategories: user.favoriteCategories
      }
    })
  } catch (error) {
    console.error('Update favorites error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount,
  updateFavorites
}
