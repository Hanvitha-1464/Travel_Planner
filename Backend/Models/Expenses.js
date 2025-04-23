const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paidByName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transportation', 'Accommodation', 'Activities', 'Shopping', 'Other']
  },
  date: {
    type: Date,
    default: Date.now
  },
  splitBetween: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String
    },
    amount: {
      type: Number
    }
  }],
  receipt: {
    type: String, // URL to uploaded receipt image
    default: ''
  }
});

// Use this pattern to prevent "OverwriteModelError"
let ExpenseModel;
try {
  // Try to retrieve the existing model
  ExpenseModel = mongoose.model('Expense');
} catch (error) {
  // Model doesn't exist yet, so create it
  ExpenseModel = mongoose.model('Expense', ExpenseSchema);
}

module.exports = ExpenseModel;