const mongoose = require('mongoose')
const { isMemoryMode, memory, generateId } = require('../db')

// Mongoose schema (used when MongoDB is available)
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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
      'Food & Dining', 'Transportation', 'Housing', 'Utilities',
      'Entertainment', 'Shopping', 'Education', 'Healthcare',
      'Subscriptions', 'Travel', 'Personal Care', 'Gifts',
      'Insurance', 'Bank Fees', 'Other'
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
}, { timestamps: true })

transactionSchema.index({ user: 1, date: -1 })
transactionSchema.index({ user: 1, category: 1 })
transactionSchema.index({ user: 1, type: 1 })

// Auto-categorize based on merchant/description
transactionSchema.statics.categorizeTransaction = function (merchant, description) {
  const merchantLower = (merchant || '').toLowerCase()
  const descLower = (description || '').toLowerCase()

  const rules = [
    { patterns: ['uber', 'lyft', 'taxi', 'bus', 'metro', 'train', 'fuel', 'gas', 'parking', 'shell', 'exxon', 'bp', 'chevron', 'costco gas'], category: 'Transportation' },
    { patterns: ['starbucks', 'mcdonald', 'domino', 'pizza', 'grubhub', 'doordash', 'uber eats', 'restaurant', 'cafe', 'grocery', 'walmart', 'target', 'amazon fresh', 'instacart', 'chipotle', 'panera', 'subway', 'cuisine', 'dining', 'lunch', 'dinner', 'breakfast'], category: 'Food & Dining' },
    { patterns: ['netflix', 'spotify', 'disney+', 'hulu', 'hbo', 'prime video', 'youtube premium', 'apple music', 'apple tv+', 'paramount', 'peacock', 'paramount+'], category: 'Entertainment' },
    { patterns: ['amazon', 'ebay', 'best buy', 'apple store', 'microcenter', 'newegg', 'walmart', 'target', 'shop', 'etsy', 'wish'], category: 'Shopping' },
    { patterns: ['tuition', 'school', 'university', 'college', 'textbook', 'course', 'coursera', 'udemy', 'skillshare', 'dorm', 'rent', 'student'], category: 'Education' },
    { patterns: ['insurance', 'health', 'medical', 'pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'clinic'], category: 'Healthcare' },
    { patterns: ['netflix', 'spotify', 'hulu', 'hbo', 'apple icloud', 'dropbox', 'adobe', 'microsoft 365', 'unity', 'blender'], category: 'Subscriptions' },
    { patterns: ['amex', 'visa', 'mastercard', 'wirecard', 'paypal fee', 'square'], category: 'Bank Fees' }
  ]

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (merchantLower.includes(pattern) || descLower.includes(pattern)) {
        return rule.category
      }
    }
  }

  return null
}

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)

// In-memory CRUD helpers
function memoryFind(query) {
  const results = []
  for (const [id, tx] of memory.transactions) {
    if (tx.user !== query.user) continue
    if (query.type && tx.type !== query.type) continue
    if (query.category && tx.category !== query.category) continue
    if (query.startDate && new Date(tx.date) < new Date(query.startDate)) continue
    if (query.endDate && new Date(tx.date) > new Date(query.endDate)) continue
    if (query.minAmount && tx.amount < query.minAmount) continue
    if (query.maxAmount && tx.amount > query.maxAmount) continue
    if (query.search) {
      const s = query.search.toLowerCase()
      if (!tx.description.toLowerCase().includes(s) && !(tx.merchant || '').toLowerCase().includes(s)) continue
    }
    results.push(tx)
  }
  return results
}

function memoryAggregate(pipeline) {
  const match = pipeline?.[0]?.$match || {}
  const group = pipeline?.[1]?.$group || {}
  const sort = pipeline?.[2]?.$sort || {}
  const limit = pipeline?.[3]?.$limit || Infinity

  let docs = []
  for (const [id, tx] of memory.transactions) {
    if (match.user && tx.user !== match.user) continue
    if (match.type && tx.type !== match.type) continue
    if (match.date) {
      if (match.date.$gte && new Date(tx.date) < new Date(match.date.$gte)) continue
      if (match.date.$lte && new Date(tx.date) > new Date(match.date.$lte)) continue
    }
    if (match.category && tx.category !== match.category) continue
    docs.push(tx)
  }

  if (group._id !== null) {
    const grouped = {}
    for (const doc of docs) {
      const key = group._id === '$merchant' ? (doc.merchant || 'Unknown') :
        group._id === '$category' ? doc.category :
        group._id === '$paymentMethod' ? doc.paymentMethod :
        group._id === '$merchant' ? (doc.merchant || 'Unknown') :
        doc[group._id] || doc._id
      if (!grouped[key]) grouped[key] = { _id: key, total: 0, count: 0, amount: [] }
      grouped[key].total += doc.amount
      grouped[key].count += 1
      grouped[key].amount.push(doc.amount)
    }
    const result = Object.values(grouped).map(g => ({
      ...g,
      total: g.total,
      count: g.count,
      avg: g.count > 0 ? g.total / g.count : 0,
      max: Math.max(...g.amount),
      min: Math.min(...g.amount),
    }))
    return result.sort((a, b) => {
      const sortKey = Object.keys(sort)[0]
      const dir = sort[sortKey] === -1 ? -1 : 1
      return (a[sortKey === '_id' ? 'total' : sortKey] || 0) * dir - (b[sortKey === '_id' ? 'total' : sortKey] || 0) * dir
    }).slice(0, limit)
  }

  if (group._id === null) {
    let total = 0, count = 0, max = 0, min = Infinity
    for (const doc of docs) {
      total += doc.amount
      count += 1
      if (doc.amount > max) max = doc.amount
      if (doc.amount < min) min = doc.amount
    }
    return [{ _id: null, totalSpent: total, total: total, average: count > 0 ? total / count : 0, count, maxTransaction: max === Infinity ? 0 : max, minTransaction: min === Infinity ? 0 : min }]
  }

  return result.length > 0 ? result : [{ _id: null, total: 0 }]
}

// Override model methods for memory mode
if (isMemoryMode) {
  Transaction.create = function (data) {
    const id = generateId()
    const now = new Date()
    const tx = {
      _id: id,
      ...data,
      user: data.user,
      createdAt: now,
      updatedAt: now,
    }
    memory.transactions.set(id, tx)
    memory.counters.transactions++
    return Promise.resolve(tx)
  }

  Transaction.findOne = function (query) {
    for (const [id, tx] of memory.transactions) {
      if (tx._id === query._id && tx.user === query.user) {
        return Promise.resolve(tx)
      }
    }
    return Promise.resolve(null)
  }

  Transaction.find = function (query) {
    const docs = memoryFind(query)
    const sortBy = query.sort?.[Object.keys(query.sort)[0]] || -1
    const sorted = [...docs].sort((a, b) => {
      const av = a[Object.keys(query.sort)[0]] || a.date
      const bv = b[Object.keys(query.sort)[0]] || b.date
      return sortBy === -1 ? new Date(bv) - new Date(av) : new Date(av) - new Date(bv)
    })
    return Promise.resolve(sorted)
  }

  Transaction.countDocuments = function (query) {
    return Promise.resolve(memoryFind(query).length)
  }

  Transaction.deleteOne = function (query) {
    if (memory.transactions.has(query._id)) {
      memory.transactions.delete(query._id)
      return Promise.resolve({ deletedCount: 1 })
    }
    return Promise.resolve({ deletedCount: 0 })
  }

  Transaction.aggregate = function (pipeline) {
    return Promise.resolve(memoryAggregate(pipeline))
  }

  Transaction.deleteMany = function (query) {
    let count = 0
    for (const [id, tx] of memory.transactions) {
      if (tx.user === query.user) {
        memory.transactions.delete(id)
        count++
      }
    }
    return Promise.resolve({ deletedCount: count })
  }

  Transaction.prototype.save = function () {
    return Promise.resolve(this)
  }

  Transaction.prototype.toObject = function () {
    return { ...this }
  }
}

module.exports = Transaction
