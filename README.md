# HNG13 Stage 1 - String Analyzer Service

A RESTful API service that analyzes strings, computes their properties, and stores them persistently in MongoDB. The service supports advanced filtering including natural language query parsing.

## Features

- **String Analysis** - Computes 6 properties for each string:
  - Length
  - Palindrome detection (case-insensitive)
  - Unique character count
  - Word count
  - SHA-256 hash (used as unique ID)
  - Character frequency map
  
- **Full CRUD Operations** - Create, Read, Update, Delete strings
- **Advanced Filtering** - Filter by palindrome, length, word count, and characters
- **Natural Language Queries** - Parse human-readable queries like "all single word palindromic strings"
- **Duplicate Detection** - Prevents storing the same string twice
- **Persistent Storage** - MongoDB database integration

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database for persistent storage
- **Mongoose** - MongoDB object modeling
- **Crypto** - SHA-256 hash generation
- **CORS** - Cross-Origin Resource Sharing

## API Endpoints

### 1. Create/Analyze String
```http
POST /strings
Content-Type: application/json

{
  "value": "string to analyze"
}
```

**Success Response (201 Created):**
```json
{
  "id": "sha256_hash_value",
  "value": "string to analyze",
  "properties": {
    "length": 16,
    "is_palindrome": false,
    "unique_characters": 12,
    "word_count": 3,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "s": 2,
      "t": 3,
      "r": 2
    }
  },
  "created_at": "2025-10-22T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing "value" field
- `409 Conflict` - String already exists
- `422 Unprocessable Entity` - Invalid data type

### 2. Get Specific String
```http
GET /strings/{string_value}
```

**Success Response (200 OK):**
```json
{
  "id": "sha256_hash_value",
  "value": "requested string",
  "properties": { ... },
  "created_at": "2025-10-22T10:00:00.000Z"
}
```

**Error Response:**
- `404 Not Found` - String does not exist

### 3. Get All Strings with Filtering
```http
GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a
```

**Query Parameters:**
- `is_palindrome` - boolean (true/false)
- `min_length` - integer (minimum string length)
- `max_length` - integer (maximum string length)
- `word_count` - integer (exact word count)
- `contains_character` - string (single character to search for)

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "string1",
      "properties": { ... },
      "created_at": "2025-10-22T10:00:00.000Z"
    }
  ],
  "count": 15,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20,
    "word_count": 2,
    "contains_character": "a"
  }
}
```

### 4. Natural Language Filtering
```http
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Supported Query Patterns:**
- "all single word palindromic strings" → `word_count=1, is_palindrome=true`
- "strings longer than 10 characters" → `min_length=11`
- "strings containing the letter z" → `contains_character=z`
- "palindromic strings that contain the first vowel" → `is_palindrome=true, contains_character=a`

**Success Response (200 OK):**
```json
{
  "data": [ ... ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Unable to parse query
- `422 Unprocessable Entity` - Conflicting filters

### 5. Delete String
```http
DELETE /strings/{string_value}
```

**Success Response:**
- `204 No Content` (empty response)

**Error Response:**
- `404 Not Found` - String does not exist

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or cloud)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hng-stage1-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/hng-stage1
   # Or use MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hng-stage1
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   npm start
   ```

6. **Test the API**
   ```bash
   # Create a string
   curl -X POST http://localhost:3000/strings \
     -H "Content-Type: application/json" \
     -d '{"value":"racecar"}'
   
   # Get the string
   curl http://localhost:3000/strings/racecar
   ```

## Project Structure

```
.
├── controllers/
│   └── dataController.js    # Request handlers for all endpoints
├── models/
│   └── hngData.js           # MongoDB schema definition
├── routes/
│   └── dataRoutes.js        # Route definitions
├── utils/
│   └── myStringHelpers.js   # String analysis helper functions
├── app.js                   # Main application file
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (not in repo)
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## Dependencies

```json
{
  "express": "^4.19.2",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "axios": "^1.7.7"
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/hng-stage1` |

## Testing

### Manual Testing with cURL

**Create a palindrome:**
```bash
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value":"racecar"}'
```

**Get all palindromes:**
```bash
curl "http://localhost:3000/strings?is_palindrome=true"
```

**Natural language query:**
```bash
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"
```

**Delete a string:**
```bash
curl -X DELETE http://localhost:3000/strings/racecar
```

## Deployment

This API can be deployed on:
- **Railway** (Recommended)
- **Heroku**
- **AWS**
- **Any Node.js + MongoDB hosting**

### Deploying to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Add MongoDB plugin or use MongoDB Atlas
5. Set environment variables:
   - `MONGO_URI` (from Railway MongoDB or Atlas)
6. Deploy!

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request** - Invalid request parameters
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Duplicate string
- **422 Unprocessable Entity** - Invalid data type or conflicting filters
- **500 Internal Server Error** - Server issues

## Key Features Explained

### Palindrome Detection
Case-insensitive checking that ignores spaces:
- "Racecar" → `true`
- "A man a plan a canal Panama" → `true`
- "hello" → `false`

### Character Frequency Map
Counts occurrences of each character:
```json
"hello" → {
  "h": 1,
  "e": 1,
  "l": 2,
  "o": 1
}
```

### Natural Language Parsing
Interprets human-readable queries:
- Detects keywords: "palindrome", "single word", "longer than", "contains"
- Extracts numeric values and characters
- Converts to structured filters

## Author

Nnanna Divine Obinna - HNG13 Backend Track

## License

MIT

---

Built for HNG13 Internship Stage 1 🚀
