const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
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
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense'
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Cash', 'Mobile Wallet', 'Bank Transfer', 'Online Payment', 'Other'],
    default: 'Cash'
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  merchant: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for faster queries
transactionSchema.index({ user: 1, date: -1 })
transactionSchema.index({ user: 1, category: 1 })
transactionSchema.index({ user: 1, type: 1 })

// Auto-assign category based on merchant name
transactionSchema.statics.categorizeTransaction = function (merchant, description) {
  const merchantLower = (merchant || '').toLowerCase()
  const descLower = (description || '').toLowerCase()

  const rules = [
    { patterns: ['uber', 'lyft', 'taxi', 'bus', 'metro', 'train', 'fuel', 'gas', 'parking', 'shell', ' Exxon'], category: 'Transportation' },
    { patterns: ['starbucks', 'mcdonald', 'domino', 'pizza', 'grubhub', 'doordash', 'uber eats', 'restaurant', 'cafe', 'shell', 'grocery', 'walmart', 'target', 'amazon fresh', 'instacart'], category: 'Food & Dining' },
    { patterns: ['netflix', 'spotify', 'disney+', 'hulu', 'hbo', 'prime video', 'youtube premium', 'apple music'], category: 'Entertainment' },
    { patterns: ['amazon', 'uber', 'shop', 'ebay', 'best buy', 'apple', 'microcenter', 'newegg'], category: 'Shopping' },
    { patterns: ['tuition', 'school', 'university', 'college', 'textbook', 'course', 'coursera', 'udemy', 'skillshare', 'dorm', 'rent'], category: 'Education' },
    { patterns: ['insurance', 'health', 'medical', 'pharmacy', 'cvs', 'walgreens', 'doctor'], category: 'Healthcare' },
    { patterns: ['netflix', 'spotify', 'hulu', 'hbo', 'apple icloud', 'dropbox', 'adobe', 'microsoft 365', 'unity'], category: 'Subscriptions' },
    { patterns: ['amex', 'visa', 'mastercard', 'credit card'], category: 'Bank Fees' }
  ]

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (merchantLower.includes(pattern) || descLower.includes(pattern)) {
        return rule.category
      }
    }
  }

  return null // Let user decide
}

module.exports = mongoose.model('Transaction', transactionSchema)
