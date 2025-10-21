const Hngdata = require('../models/hngData');
const Helper = require('../utils/myStringHelpers');

// POST /strings - Create/Analyze String
exports.createString = async (req, res) => {
  const { value } = req.body;

  // Validation
  if (!value) {
    return res.status(400).json({ error: 'Missing "value" field in request body' });
  }

  if (typeof value !== 'string') {
    return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
  }

  try {
    // Generate SHA-256 hash to use as ID
    const sha256Hash = Helper.generateSHA256(value);

    // Check if string already exists (409 Conflict)
    // const existingString = await Hngdata.findOne({ 'properties.sha256_hash': sha256Hash });
    
    const existingString = await Hngdata.findOne({ value: value });
    if (existingString) {
      return res.status(409).json({ error: 'String already exists in the system' });
    }

    // Analyze the string
    const properties = Helper.analyzeString(value);

    // Create new record
    const newData = await Hngdata.create({
      value,
      properties
    });

    // Return response in exact format required
    res.status(201).json({
      id: properties.sha256_hash,
      value: value,
      properties: properties,
      created_at: newData.createdAt.toISOString()
    });

  } catch (err) {
    console.error('Error creating string:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// GET /strings/:string_value - Get Specific String
exports.getString = async (req, res) => {
  const { string_value } = req.params;

  try {
    // Find by the actual string value
    const record = await Hngdata.findOne({ value: string_value });

    if (!record) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    res.status(200).json({
      id: record.properties.sha256_hash,
      value: record.value,
      properties: record.properties,
      created_at: record.createdAt.toISOString()
    });

  } catch (err) {
    console.error('Error getting string:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// GET /strings - Get All Strings with Filtering
exports.getAllStrings = async (req, res) => {
  try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

    // Build MongoDB query
    const query = {};

    if (is_palindrome !== undefined) {
      const isPal = is_palindrome === 'true';
      query['properties.is_palindrome'] = isPal;
    }

    if (min_length !== undefined) {
      const minLen = parseInt(min_length);
      if (isNaN(minLen)) {
        return res.status(400).json({ error: 'Invalid value for min_length parameter' });
      }
      query['properties.length'] = { ...query['properties.length'], $gte: minLen };
    }

    if (max_length !== undefined) {
      const maxLen = parseInt(max_length);
      if (isNaN(maxLen)) {
        return res.status(400).json({ error: 'Invalid value for max_length parameter' });
      }
      query['properties.length'] = { ...query['properties.length'], $lte: maxLen };
    }

    if (word_count !== undefined) {
      const wc = parseInt(word_count);
      if (isNaN(wc)) {
        return res.status(400).json({ error: 'Invalid value for word_count parameter' });
      }
      query['properties.word_count'] = wc;
    }

    if (contains_character !== undefined) {
      if (typeof contains_character !== 'string' || contains_character.length !== 1) {
        return res.status(400).json({ error: 'contains_character must be a single character' });
      }
      query['value'] = { $regex: contains_character, $options: 'i' };
    }

    // Fetch all matching records
    const records = await Hngdata.find(query);

    // Format response
    const data = records.map(record => ({
      id: record.properties.sha256_hash,
      value: record.value,
      properties: record.properties,
      created_at: record.createdAt.toISOString()
    }));

    // Build filters_applied object
    const filters_applied = {};
    if (is_palindrome !== undefined) filters_applied.is_palindrome = is_palindrome === 'true';
    if (min_length !== undefined) filters_applied.min_length = parseInt(min_length);
    if (max_length !== undefined) filters_applied.max_length = parseInt(max_length);
    if (word_count !== undefined) filters_applied.word_count = parseInt(word_count);
    if (contains_character !== undefined) filters_applied.contains_character = contains_character;

    res.status(200).json({
      data,
      count: data.length,
      filters_applied
    });

  } catch (err) {
    console.error('Error getting all strings:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// GET /strings/filter-by-natural-language - Natural Language Filtering
exports.filterByNaturalLanguage = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  try {
    // Parse the natural language query
    const { parsed_filters, original } = Helper.parseNaturalLanguageQuery(query);

    // Check for conflicting filters (example: min_length > max_length)
    if (parsed_filters.min_length && parsed_filters.max_length) {
      if (parsed_filters.min_length > parsed_filters.max_length) {
        return res.status(422).json({ 
          error: 'Query parsed but resulted in conflicting filters',
          details: 'min_length cannot be greater than max_length'
        });
      }
    }

    // Fetch all records and apply filters
    const allRecords = await Hngdata.find({});
    const formattedRecords = allRecords.map(record => ({
      id: record.properties.sha256_hash,
      value: record.value,
      properties: record.properties,
      created_at: record.createdAt.toISOString()
    }));

    const filteredResults = Helper.applyFilters(formattedRecords, parsed_filters);

    res.status(200).json({
      data: filteredResults,
      count: filteredResults.length,
      interpreted_query: {
        original: original,
        parsed_filters: parsed_filters
      }
    });

  } catch (err) {
    console.error('Error parsing natural language query:', err);
    res.status(400).json({ error: 'Unable to parse natural language query', details: err.message });
  }
};

// DELETE /strings/:string_value - Delete String
exports.deleteString = async (req, res) => {
  const { string_value } = req.params;

  try {
    const record = await Hngdata.findOneAndDelete({ value: string_value });

    if (!record) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    // Return 204 No Content (empty response)
    res.status(204).send();

  } catch (err) {
    console.error('Error deleting string:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};