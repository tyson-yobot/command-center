// Test script to discover actual Airtable field names
import fetch from 'node-fetch';

const AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa";
const AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if";
const AIRTABLE_TABLE_ID = "tbly0fjE2M5uHET9X";

// Test each field individually to see which ones work
const fieldsToTest = [
  "🔧 Integration Name",
  "🔌 Integration Name", 
  "✅ Pass/Fail",
  "Pass/Fail",
  "🧠 Notes / Debug",
  "Notes / Debug",
  "🗓️ Test Date",
  "Test Date",
  "👤 QA Owner",
  "QA Owner",
  "📤 Output Data Pop...",
  "Output Data Pop...",
  "🆕 Record Created?",
  "Record Created?",
  "🔁 Retry Attempted?",
  "Retry Attempted?",
  "🧩 Module Type",
  "Module Type",
  "📁 Related Scenario Link",
  "Related Scenario Link"
];

async function testField(fieldName: string) {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          [fieldName]: `Test for field: ${fieldName}`
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ FIELD WORKS: "${fieldName}" - Record ID: ${result.id}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ FIELD FAILED: "${fieldName}" - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR testing "${fieldName}": ${error.message}`);
    return false;
  }
}

export async function discoverWorkingFields() {
  console.log('🔍 Testing Airtable field names...\n');
  
  const workingFields = [];
  
  for (const field of fieldsToTest) {
    const works = await testField(field);
    if (works) {
      workingFields.push(field);
    }
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n📋 WORKING FIELDS SUMMARY:');
  workingFields.forEach(field => console.log(`  ✅ "${field}"`));
  
  return workingFields;
}