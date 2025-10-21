const axios = require('axios');

const BASE_URL = 'http://localhost:5002';

const testStrings = [
  'racecar',
  'noon',
  'level',
  'hello world',
  'test',
  'A man a plan a canal Panama',
  'programming',
  'a'
];

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  // Test 1: Create strings
  console.log('📝 Test 1: Creating strings...');
  for (const str of testStrings) {
    try {
      const response = await axios.post(`${BASE_URL}/strings`, {
        value: str
      });
      console.log(`✅ Created: "${str}" - Palindrome: ${response.data.properties.is_palindrome}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  "${str}" already exists (409)`);
      } else {
        console.log(`❌ Error creating "${str}":`, error.response?.data || error.message);
      }
    }
  }

  console.log('\n📖 Test 2: Getting specific string...');
  try {
    const response = await axios.get(`${BASE_URL}/strings/racecar`);
    console.log('✅ Retrieved "racecar":', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n🔍 Test 3: Get all palindromes...');
  try {
    const response = await axios.get(`${BASE_URL}/strings?is_palindrome=true`);
    console.log(`✅ Found ${response.data.count} palindromes`);
    response.data.data.forEach(item => {
      console.log(`   - "${item.value}"`);
    });
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n🔍 Test 4: Get single word strings...');
  try {
    const response = await axios.get(`${BASE_URL}/strings?word_count=1`);
    console.log(`✅ Found ${response.data.count} single-word strings`);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n🗣️  Test 5: Natural language query...');
  try {
    const response = await axios.get(
      `${BASE_URL}/strings/filter-by-natural-language?query=all single word palindromic strings`
    );
    console.log(`✅ Found ${response.data.count} results`);
    console.log('Interpreted filters:', response.data.interpreted_query.parsed_filters);
    response.data.data.forEach(item => {
      console.log(`   - "${item.value}"`);
    });
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n🗑️  Test 6: Delete a string...');
  try {
    await axios.delete(`${BASE_URL}/strings/test`);
    console.log('✅ Deleted "test"');
    
    // Verify deletion
    try {
      await axios.get(`${BASE_URL}/strings/test`);
      console.log('❌ String still exists after deletion!');
    } catch (e) {
      if (e.response?.status === 404) {
        console.log('✅ Verified deletion (404)');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n✨ Tests Complete!\n');
}

runTests();