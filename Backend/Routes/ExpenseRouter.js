const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/AuthValidation');
const { 
  createExpense, 
  getRoomExpenses, 
  updateExpense, 
  deleteExpense, 
  getExpenseSummary 
} = require('../Controllers/ExpenseController');

// Create new expense
// Create new expense
router.post('/', protect, createExpense);

// Get all expenses for a room
router.get('/room/:roomId', protect, getRoomExpenses);

// Get expense summary for a room
router.get('/summary/:roomId',protect, getExpenseSummary);

// Update expense
router.put('/:expenseId', protect, updateExpense);

// Delete expense
router.delete('/:expenseId', protect, deleteExpense);

module.exports = router;