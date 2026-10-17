const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { isMemoryMode, memory, generateId } = require('../db')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  monthlyBudget: {
    type: Number,
    default: 0
  },
  weeklyBudget: {
    type: Number,
    default: 0
  },
  semesterBudget: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: process.env.CURRENCY || 'INR',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  autoCategorize: {
    type: Boolean,
    default: true
  },
  favoriteCategories: [{
    type: String,
    enum: [
      'Food & Dining',
      'Transportation',
      'Housing',
      'Utilities',
      'Entertainment',
      'Shopping',
      'Education',
      'Healthcare',
      'Subscriptions',
      'Travel',
      'Personal Care',
      'Gifts',
      'Insurance',
      'Bank Fees',
      'Other'
    ]
  }],
  goals: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    deadline: {
      type: Date
    },
    category: {
      type: String,
      enum: [
        'Food & Dining',
        'Transportation',
        'Housing',
        'Utilities',
        'Entertainment',
        'Shopping',
        'Education',
        'Healthcare',
        'Subscriptions',
        'Travel',
        'Personal Care',
        'Gifts',
        'Insurance',
        'Bank Fees',
        'Other'
      ]
    },
    color: {
      type: String,
      default: '#3B82F6'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
