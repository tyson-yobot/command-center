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