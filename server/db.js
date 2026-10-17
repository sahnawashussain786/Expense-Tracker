require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const mongoose = require("mongoose");

let isMemoryMode = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log(
      "⚠️  No MONGO_URI set — running in in-memory dev mode (data resets on restart)",
    );
    isMemoryMode = true;
  } else {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      isMemoryMode = false;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      console.log("⚠️  Falling back to in-memory dev mode");
      isMemoryMode = true;
    }
  }
  // Refresh cached exports so modules that already imported see the final value
  module.exports.isMemoryMode = isMemoryMode;
  module.exports.memory = memory;
  module.exports.generateId = generateId;
};

// In-memory data store for dev mode
const memory = {
  users: new Map(),
  transactions: new Map(),
  budgets: new Map(),
  goals: new Map(),
  counters: { users: 0, transactions: 0, budgets: 0, goals: 0 },
  tokenUsers: new Map(), // token -> userId
};

const generateId = () => {
  if (isMemoryMode) {
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return undefined;
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isMemoryMode = isMemoryMode;
module.exports.memory = memory;
module.exports.generateId = generateId;
