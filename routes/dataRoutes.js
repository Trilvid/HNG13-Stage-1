const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// POST /strings - Create/Analyze String
router.post('/strings', dataController.createString);

// GET /strings/filter-by-natural-language - Natural Language Filtering (MUST be before /:string_value)
router.get('/strings/filter-by-natural-language', dataController.filterByNaturalLanguage);

// GET /strings/:string_value - Get Specific String
router.get('/strings/:string_value', dataController.getString);

// GET /strings - Get All Strings with Filtering
router.get('/strings', dataController.getAllStrings);

// DELETE /strings/:string_value - Delete String
router.delete('/strings/:string_value', dataController.deleteString);

module.exports = router;