const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Stage 1 routes - IMPORTANT: Use base path without /stage1 prefix
const dataRoutes = require('./routes/dataRoutes');
app.use('/', dataRoutes);  // Changed from '/stage1' to '/' so routes match spec

// Stage 0 task (keep for reference)
app.get('/me', async (req, res) => {
  try {
    const catFactResponse = await axios.get('https://catfact.ninja/fact', { 
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    const catFact = catFactResponse.data.fact;
    const timestamp = new Date().toISOString();

    const response = {
      status: "success",
      user: {
        email: "myemail@gmail.com",
        name: "my name",
        stack: "Node.js/Express" 
      },
      timestamp: timestamp,
      fact: catFact
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching cat fact:', error.message);
    
    // Fallback response
    const timestamp = new Date().toISOString();
    res.status(200).json({
      status: "success",
      user: {
        email: "myemail@gmail.com",
        name: "my name",
        stack: "Node.js/Express"
      },
      timestamp: timestamp,
      fact: "Unable to fetch cat fact at this time."
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'HNG Stage 1 API is running!',
    endpoints: {
      stage0: '/me',
      stage1: {
        create: 'POST /strings',
        get_one: 'GET /strings/{string_value}',
        get_all: 'GET /strings',
        natural_language: 'GET /strings/filter-by-natural-language',
        delete: 'DELETE /strings/{string_value}'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('MongoDB connected successfully');
      console.log({'\nAvailable endpoints:': [
        'POST   /strings',
        'GET    /strings/:string_value',
        'GET    /strings',
        'GET    /strings/filter-by-natural-language',
        'DELETE /strings/:string_value'
      ]});
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });