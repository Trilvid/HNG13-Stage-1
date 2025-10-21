const mongoose = require('mongoose');

const hngDataSchema = new mongoose.Schema({
  value: { 
    type: String, 
    required: true,
    trim: true
  },
  properties: {
    length: { 
      type: Number, 
      required: true 
    },
    is_palindrome: { 
      type: Boolean, 
      required: true 
    },
    unique_characters: { 
      type: Number, 
      required: true 
    },
    word_count: { 
      type: Number, 
      required: true 
    },
    sha256_hash: { 
      type: String, 
      required: true,
      unique: true 
    },
    character_frequency_map: { 
      type: Map,
      of: Number 
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexing the dB for faster queries
hngDataSchema.index({ 'properties.sha256_hash': 1 });
hngDataSchema.index({ 'value': 1 });

const HngData = mongoose.model('HngData', hngDataSchema);
module.exports = HngData;