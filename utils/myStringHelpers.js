const crypto = require('crypto');

/**
 * Check if a string is a palindrome (case-insensitive)
 * "Racecar" -> true
 * "hello" -> false
 */
function isPalindrome(str) {
  // Remove spaces and convert to lowercase for comparison
  const cleaned = str.toLowerCase().replace(/\s/g, '');
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}

/**
 * Count unique characters in a string
 * "hello" -> 4 (h, e, l, o)
 */
function countUniqueCharacters(str) {
  const uniqueChars = new Set(str);
  return uniqueChars.size;
}

/**
 * Count words separated by whitespace
 * "hello world" -> 2
 * "hello   world  test" -> 3
 */
function countWords(str) {
  const words = str.trim().split(/\s+/);
  // Handle empty string case
  return str.trim() === '' ? 0 : words.length;
}

/**
 * Generate SHA-256 hash of a string
 * This will be used as the unique ID
 */
function generateSHA256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Create character frequency map
 * "hello" -> { h: 1, e: 1, l: 2, o: 1 }
 */
function getCharacterFrequencyMap(str) {
  const frequencyMap = {};
  
  for (const char of str) {
    if (frequencyMap[char]) {
      frequencyMap[char]++;
    } else {
      frequencyMap[char] = 1;
    }
  }
  
  return frequencyMap;
}

/**
 * Main function to analyze a string and return all properties
 */
function analyzeString(value) {
  return {
    length: value.length,
    is_palindrome: isPalindrome(value),
    unique_characters: countUniqueCharacters(value),
    word_count: countWords(value),
    sha256_hash: generateSHA256(value),
    character_frequency_map: getCharacterFrequencyMap(value)
  };
}

/**
 * Parse natural language query into filters
 * This is the TRICKY part!
 */
function parseNaturalLanguageQuery(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Detect palindrome requests
  if (lowerQuery.includes('palindrome') || lowerQuery.includes('palindromic')) {
    filters.is_palindrome = true;
  }

  // Detect word count
  if (lowerQuery.includes('single word')) {
    filters.word_count = 1;
  } else if (lowerQuery.includes('two word') || lowerQuery.includes('2 word')) {
    filters.word_count = 2;
  } else if (lowerQuery.includes('three word') || lowerQuery.includes('3 word')) {
    filters.word_count = 3;
  }

  // Detect length requirements
  const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerThanMatch) {
    filters.min_length = parseInt(longerThanMatch[1]) + 1;
  }

  const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterThanMatch) {
    filters.max_length = parseInt(shorterThanMatch[1]) - 1;
  }

  // Detect specific character requirements
  const containsLetterMatch = lowerQuery.match(/contains? (?:the letter |)([a-z])/);
  if (containsLetterMatch) {
    filters.contains_character = containsLetterMatch[1];
  }

  // Detect vowel requirements
  if (lowerQuery.includes('first vowel')) {
    filters.contains_character = 'a';
  } else if (lowerQuery.includes('last vowel')) {
    filters.contains_character = 'u';
  }

  return {
    parsed_filters: filters,
    original: query
  };
}

/**
 * Apply filters to a list of string records
 */
function applyFilters(strings, filters) {
  return strings.filter(record => {
    // Check is_palindrome filter
    if (filters.is_palindrome !== undefined) {
      if (record.properties.is_palindrome !== filters.is_palindrome) {
        return false;
      }
    }

    // Check min_length filter
    if (filters.min_length !== undefined) {
      if (record.properties.length < filters.min_length) {
        return false;
      }
    }

    // Check max_length filter
    if (filters.max_length !== undefined) {
      if (record.properties.length > filters.max_length) {
        return false;
      }
    }

    // Check word_count filter
    if (filters.word_count !== undefined) {
      if (record.properties.word_count !== filters.word_count) {
        return false;
      }
    }

    // Check contains_character filter
    if (filters.contains_character !== undefined) {
      if (!record.value.includes(filters.contains_character)) {
        return false;
      }
    }

    return true;
  });
}

// Export all functions
module.exports = {
  isPalindrome,
  countUniqueCharacters,
  countWords,
  generateSHA256,
  getCharacterFrequencyMap,
  analyzeString,
  parseNaturalLanguageQuery,
  applyFilters
};

// Example usage:
// const result = analyzeString("Hello World");
// console.log(result);
/*
Output:
{
  length: 11,
  is_palindrome: false,
  unique_characters: 8,
  word_count: 2,
  sha256_hash: '...',
  character_frequency_map: { H: 1, e: 1, l: 3, o: 2, ' ': 1, W: 1, r: 1, d: 1 }
}
*/