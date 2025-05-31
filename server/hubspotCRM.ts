import axios from 'axios';

interface Contact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
}

export async function contactExistsInHubSpot(email: string): Promise<boolean> {
  try {
    if (!process.env.HUBSPOT_API_KEY || !email) {
      return false;
    }

    const response = await axios.get(
      `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.status === 200;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return false;
    }
    throw new Error('Error checking HubSpot for existing contact');
  }
}

export async function notifySlack(contact: Contact) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('Slack webhook not configured, skipping notification');
    return;
  }

  const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown';
  const message = {
    text: `📇 New contact scanned & synced:\n*Name:* ${name}\n*Email:* ${contact.email || 'N/A'}\n*Phone:* ${contact.phone || 'N/A'}\n*Company:* ${contact.company || 'N/A'}`
  };

  try {
    await axios.post(webhookUrl, message);
    console.log('📣 Slack notified');
  } catch (err: any) {
    console.error('🧨 Slack notification failed:', err.message);
  }
}

export async function createFollowUpTask(contact: Contact) {
  try {
    if (!process.env.HUBSPOT_API_KEY || !contact.email) {
      console.log('HubSpot API key or contact email missing, skipping task creation');
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // +1 day

    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';

    // Step 1: Get contact ID from email
    const searchRes = await axios.get(
      `https://api.hubapi.com/contacts/v1/contact/email/${contact.email}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const contactId = searchRes.data.vid;

    // Step 2: Create the follow-up task
    const taskPayload = {
      engagement: {
        active: true,
        type: 'TASK',
        timestamp: dueDate.getTime()
      },
      associations: {
        contactIds: [contactId]
      },
      metadata: {
        subject: `Follow up with ${name}`,
        body: `Contact scanned from business card\nEmail: ${contact.email}\nPhone: ${contact.phone || 'N/A'}\nCompany: ${contact.company || 'N/A'}\nTitle: ${contact.title || 'N/A'}\n\nSource: Business Card Scanner`,
        status: 'NOT_STARTED'
      }
    };

    const taskRes = await axios.post(
      'https://api.hubapi.com/engagements/v1/engagements',
      taskPayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🗓️ Follow-up task created in HubSpot:', taskRes.data.engagement?.id);
  } catch (err: any) {
    console.error('❌ Failed to create follow-up task:', err.response?.data || err.message);
  }
}

export async function tagContactSource(contact: Contact) {
  try {
    if (!process.env.HUBSPOT_API_KEY || !contact.email) {
      console.log('HubSpot API key or contact email missing, skipping contact tagging');
      return;
    }

    const updatePayload = {
      properties: [
        {
          property: 'source',
          value: 'business_card_scanner'
        },
        {
          property: 'hs_lead_status',
          value: 'NEW'
        }
      ]
    };

    const res = await axios.post(
      `https://api.hubapi.com/contacts/v1/contact/email/${contact.email}/profile`,
      updatePayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🏷️ Contact tagged with source "business_card_scanner"');
  } catch (err: any) {
    console.error('⚠️ Failed to tag contact:', err.response?.data || err.message);
  }
}

export async function enrollInWorkflow(contact: Contact) {
  try {
    if (!process.env.HUBSPOT_API_KEY || !contact.email) {
      console.log('HubSpot API key or contact email missing, skipping workflow enrollment');
      return;
    }

    // Get the workflow ID from environment variable
    const workflowId = process.env.HUBSPOT_WORKFLOW_ID;
    if (!workflowId) {
      console.log('HUBSPOT_WORKFLOW_ID not configured, skipping workflow enrollment');
      return;
    }

    // First, get the contact ID
    const contactRes = await axios.get(
      `https://api.hubapi.com/contacts/v1/contact/email/${contact.email}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const contactId = contactRes.data.vid;

    // Enroll contact in workflow
    const response = await axios.post(
      `https://api.hubapi.com/automation/v3/workflows/${workflowId}/enrollments/contacts/${contactId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📤 Contact enrolled in HubSpot workflow:', response.data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.log('⚠️ Workflow not found or contact already enrolled');
    } else {
      console.error('⚠️ Failed to enroll contact in workflow:', err.response?.data || err.message);
    }
  }
}

export async function createDealForContact(contact: Contact) {
  try {
    if (!process.env.HUBSPOT_API_KEY || !contact.email) {
      console.log('HubSpot API key or contact email missing, skipping deal creation');
      return;
    }

    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';

    // Step 1: Get contact ID from email
    const contactRes = await axios.get(
      `https://api.hubapi.com/contacts/v1/contact/email/${contact.email}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const contactId = contactRes.data.vid;

    // Step 2: Create the deal
    const dealPayload = {
      properties: [
        { name: 'dealname', value: `Business Card Lead - ${name}` },
        { name: 'dealstage', value: 'appointmentscheduled' },
        { name: 'pipeline', value: 'default' },
        { name: 'amount', value: '0' },
        { name: 'source', value: 'business_card_scanner' }
      ],
      associations: {
        associatedVids: [contactId]
      }
    };

    const res = await axios.post(
      'https://api.hubapi.com/deals/v1/deal',
      dealPayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📈 Deal created for contact:', res.data.dealId);
  } catch (err: any) {
    console.error('❌ Failed to create deal:', err.response?.data || err.message);
  }
}

export async function exportToGoogleSheet(contact: Contact) {
  try {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('Google Sheets webhook URL not configured, skipping backup export');
      return;
    }

    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';
    
    // Ensure URL has proper protocol
    const cleanUrl = webhookUrl.startsWith('http') ? webhookUrl : `https://${webhookUrl}`;
    
    const response = await axios.post(cleanUrl, {
      name: name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      source: 'business_card_scanner',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📄 Contact exported to Google Sheet for backup');
  } catch (err: any) {
    console.error('⚠️ Failed to export to Google Sheet:', err.response?.data || err.message);
  }
}

export async function pushToCRM(contact: Contact) {
  try {
    if (!process.env.HUBSPOT_API_KEY) {
      console.warn('HubSpot API key not configured');
      return null;
    }

    const [first, ...rest] = (contact.firstName && contact.lastName) 
      ? [contact.firstName, contact.lastName]
      : (contact.firstName || 'Unknown').split(' ');
    const last = rest.join(' ') || contact.lastName || 'Contact';

    const properties = [
      { property: 'firstname', value: first },
      { property: 'lastname', value: last }
    ];

    if (contact.email) {
      properties.push({ property: 'email', value: contact.email });
    }

    if (contact.phone) {
      properties.push({ property: 'phone', value: contact.phone });
    }

    if (contact.company) {
      properties.push({ property: 'company', value: contact.company });
    }

    if (contact.title) {
      properties.push({ property: 'jobtitle', value: contact.title });
    }

    const response = await axios.post('https://api.hubapi.com/contacts/v1/contact', {
      properties
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Contact pushed to CRM:', response.data);
    return response.data;
  } catch (err: any) {
    console.error('❌ CRM push failed:', err.response?.data || err.message);
    throw err;
  }
}