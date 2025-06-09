// Comprehensive automation testing script
import axios from 'axios';

async function testSystematicAutomation() {
  console.log('🚀 Starting comprehensive automation testing...');
  
  try {
    // Test Airtable connection first
    console.log('1. Testing Airtable connection...');
    const airtableTest = await axios.get('http://localhost:5000/api/test-airtable-connection');
    console.log('✅ Airtable connection:', airtableTest.data.message);
    
    // Test individual automation functions
    console.log('2. Testing individual automation functions...');
    const functions = [
      { id: 1, name: 'Slack Team Notification', moduleType: 'Communication' },
      { id: 2, name: 'Stripe Product SKU One-Time', moduleType: 'Payment' },
      { id: 3, name: 'Track Lead Source from Phantombuster', moduleType: 'Lead Management' },
      { id: 4, name: 'Calculate Support Ticket SLA Breach', moduleType: 'Support' },
      { id: 5, name: 'Assign Task to Onboarding Rep', moduleType: 'Onboarding' },
      { id: 6, name: 'Active Bot Audit Summary', moduleType: 'System Health' },
      { id: 7, name: 'Demo No Show Rebooker Bot', moduleType: 'Sales' },
      { id: 8, name: 'Multi-Agent Fallback Tracker', moduleType: 'AI Systems' },
      { id: 9, name: 'Toggle Feature Flag', moduleType: 'System Control' },
      { id: 10, name: 'Deactivate Expired Trial Clients', moduleType: 'Client Management' }
    ];
    
    let passedCount = 0;
    let failedCount = 0;
    
    for (const func of functions) {
      try {
        const response = await axios.post('http://localhost:5000/api/test-automation-function', {
          functionId: func.id,
          functionName: func.name,
          moduleType: func.moduleType
        });
        
        if (response.data.success) {
          console.log(`✅ Function ${func.id}: ${func.name} - PASSED`);
          passedCount++;
        } else {
          console.log(`❌ Function ${func.id}: ${func.name} - FAILED`);
          failedCount++;
        }
      } catch (error) {
        console.log(`❌ Function ${func.id}: ${func.name} - ERROR: ${error.message}`);
        failedCount++;
      }
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📈 Pass Rate: ${((passedCount / (passedCount + failedCount)) * 100).toFixed(2)}%`);
    
    // Test batch operations
    console.log('\n3. Testing batch operations...');
    try {
      const batchResponse = await axios.post('http://localhost:5000/api/test-batch', {
        startId: 11,
        endId: 20
      });
      console.log('✅ Batch testing:', batchResponse.data.message);
    } catch (error) {
      console.log('❌ Batch testing failed:', error.message);
    }
    
    // Get test summary
    console.log('\n4. Getting test summary...');
    try {
      const summaryResponse = await axios.get('http://localhost:5000/api/test-summary');
      console.log('📊 Test Summary:', summaryResponse.data.summary);
    } catch (error) {
      console.log('❌ Test summary failed:', error.message);
    }
    
    console.log('\n🎉 Comprehensive automation testing completed!');
    
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
  }
}

testSystematicAutomation();