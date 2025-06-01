import axios from 'axios';

interface ChatContactData {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  source?: string;
}

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_CONTACTS_TABLE = "Contacts";

/**
 * Capture or update contact from chat interaction
 */
export async function captureChatContact(data: ChatContactData): Promise<{ success: boolean; action: string; contactId?: string; error?: string }> {
  const { name, email, phone, message, source = "Chat Widget" } = data;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      success: false,
      action: "error",
      error: "Airtable credentials not configured"
    };
  }

  const identifier = email || phone;
  if (!identifier) {
    return {
      success: false,
      action: "error",
      error: "Either email or phone required for contact capture"
    };
  }

  try {
    // Search for existing contact
    const searchField = email ? "Email" : "Phone";
    const searchValue = identifier;
    
    const searchResponse = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTACTS_TABLE}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        },
        params: {
          filterByFormula: `{${searchField}} = '${searchValue}'`
        }
      }
    );

    const existingContacts = searchResponse.data.records;

    if (existingContacts.length > 0) {
      // Update existing contact
      const contactId = existingContacts[0].id;
      
      await axios.patch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTACTS_TABLE}/${contactId}`,
        {
          fields: {
            "Last Chat": new Date().toISOString(),
            "Recent Message": message,
            "Chat Count": (existingContacts[0].fields["Chat Count"] || 0) + 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        action: "updated",
        contactId
      };

    } else {
      // Create new contact
      const createResponse = await axios.post(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTACTS_TABLE}`,
        {
          fields: {
            "Name": name,
            ...(email && { "Email": email }),
            ...(phone && { "Phone": phone }),
            "Lead Source": source,
            "Recent Message": message,
            "Last Chat": new Date().toISOString(),
            "Chat Count": 1,
            "Status": "New Lead"
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        action: "created",
        contactId: createResponse.data.id
      };
    }

  } catch (error: any) {
    console.error('Chat contact capture error:', error);
    return {
      success: false,
      action: "error",
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Log chat interaction to Command Center metrics
 */
export async function logChatInteraction(data: ChatContactData, result: { success: boolean; action: string; contactId?: string }): Promise<void> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return;
  }

  try {
    await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/📊 Command Center · Metrics Tracker`,
      {
        fields: {
          "📁 Source": "Chat Widget",
          "📄 Ticket ID": `chat_${Date.now()}`,
          "🕒 Timestamp": new Date().toISOString(),
          "📣 Action": `Contact ${result.action}`,
          "⚠️ Result": result.success ? "Success" : "Failed"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Failed to log chat interaction to metrics:', error);
  }
}