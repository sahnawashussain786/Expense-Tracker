const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isMemoryMode, memory, generateId } = require("../db");

const budgetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Budget name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    period: {
      type: String,
      required: [true, "Budget period is required"],
      enum: ["daily", "weekly", "monthly", "semester", "yearly"],
    },
    category: {
      type: String,
      enum: [
        "Food & Dining",
        "Transportation",
        "Housing",
        "Utilities",
        "Entertainment",
        "Shopping",
        "Education",
        "Healthcare",
        "Subscriptions",
        "Travel",
        "Personal Care",
        "Gifts",
        "Insurance",
        "Bank Fees",
        "Other",
        null,
      ],
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is used
      min: 1,
      max: 100,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for unique budgets per user
budgetSchema.index({ user: 1, name: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
