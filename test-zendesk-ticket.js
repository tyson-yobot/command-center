// Test script to create a Zendesk support ticket and trigger the full AI workflow
import axios from 'axios';

async function createTestTicket() {
  const testTicketData = {
    ticketId: `TEST-${Date.now()}`,
    clientName: "Sarah Johnson",
    ticketBody: "Hi, I'm having trouble with my YoBot integration. The voice commands aren't working properly and I'm getting frustrated. This is urgent for our business operations. Can someone please help me immediately?",
    topic: "Voice Integration Issue"
  };

  try {
    console.log('🎫 Creating test support ticket...');
    console.log('Ticket Data:', testTicketData);

    const response = await axios.post('http://localhost:5000/api/support/ticket', testTicketData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Ticket processed successfully!');
    console.log('Response:', response.data);

    // Test Zendesk connection
    console.log('\n🔗 Testing Zendesk connection...');
    const zendeskTest = await axios.get('http://localhost:5000/api/support/zendesk/test');
    console.log('Zendesk Test Result:', zendeskTest.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestTicket();