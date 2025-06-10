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

export async function enrichContactWithApollo(contact: Contact) {
  try {
    if (!process.env.APOLLO_API_KEY || !contact.email) {
      console.log('Apollo API key not configured or no email provided, skipping Apollo enrichment');
      return contact;
    }

    const response = await axios.post('https://api.apollo.io/v1/people/match', {
      email: contact.email
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.APOLLO_API_KEY
      },
      timeout: 5000
    });

    if (response.data && response.data.person) {
      const person = response.data.person;
      
      // Enrich contact with Apollo data
      if (person.first_name && !contact.firstName) {
        contact.firstName = person.first_name;
      }
      if (person.last_name && !contact.lastName) {
        contact.lastName = person.last_name;
      }
      if (person.organization?.name && !contact.company) {
        contact.company = person.organization.name;
      }
      if (person.title && !contact.title) {
        contact.title = person.title;
      }
      
      console.log('✨ Contact enriched with Apollo data');
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`Apollo enrichment: No data found for ${contact.email}`);
    } else {
      console.log(`Apollo enrichment failed for ${contact.email}:`, error.message);
    }
  }
  
  return contact;
}

export async function enrichContactWithClearbit(contact: Contact) {
  try {
    if (!process.env.CLEARBIT_API_KEY || !contact.email) {
      console.log('Clearbit API key not configured or no email provided, skipping enrichment');
      return contact;
    }

    const response = await axios.get(`https://person.clearbit.com/v2/people/find?email=${contact.email}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY}`
      },
      timeout: 5000
    });

    if (response.status === 200 && response.data) {
      const data = response.data;
      
      // Enrich contact with Clearbit data
      if (data.name?.fullName && !contact.firstName && !contact.lastName) {
        const nameParts = data.name.fullName.split(' ');
        contact.firstName = nameParts[0];
        contact.lastName = nameParts.slice(1).join(' ');
      }
      
      contact.company = data.employment?.name || contact.company;
      contact.title = data.employment?.title || contact.title;
      
      console.log('✨ Contact enriched with Clearbit data');
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`Clearbit enrichment: No data found for ${contact.email}`);
    } else {
      console.log(`Clearbit enrichment failed for ${contact.email}:`, error.message);
    }
  }
  
  return contact;
}

export async function sendSlackScanAlert(contact: Contact) {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.log('Slack webhook URL not configured, skipping scan alert');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email || 'Unknown Contact';
    
    const message = {
      text: `📇 *New Business Card Scanned!*\n👤 *${fullName}*\n🏢 ${contact.company || 'N/A'}\n✅ CRM + Deal + Task created.`
    };

    await axios.post(process.env.SLACK_WEBHOOK_URL, message, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('📱 Slack scan alert sent successfully');
  } catch (error: any) {
    console.error('Failed to send Slack scan alert:', error.message);
  }
}

export async function logToSupabase(contact: Contact, eventType: string) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.log('Supabase credentials not configured, skipping database logging');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';
    
    const payload = {
      event_type: eventType,
      contact_name: fullName,
      email: contact.email,
      company: contact.company,
      phone: contact.phone,
      timestamp: new Date().toISOString(),
      source: 'Business Card Scanner',
      status: 'Success'
    };

    await axios.post(`${process.env.SUPABASE_URL}/rest/v1/EventLogs`, payload, {
      headers: {
        'apikey': process.env.SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('🗄️ Event logged to Supabase database');
  } catch (error: any) {
    console.error('Failed to log to Supabase:', error.message);
  }
}

export async function triggerQuotePDF(contact: Contact) {
  try {
    if (!process.env.PDF_QUOTE_WEBHOOK_URL) {
      console.log('PDF quote webhook URL not configured, skipping quote generation');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';
    
    // Check if contact qualifies for quote (has company domain)
    const qualifiesForQuote = contact.company && contact.email && contact.email.includes('@');
    
    if (!qualifiesForQuote) {
      console.log('Contact does not qualify for automated quote generation');
      return;
    }

    const payload = {
      contact_email: contact.email,
      company: contact.company,
      full_name: fullName,
      phone: contact.phone,
      title: contact.title,
      scan_source: 'business_card_scanner',
      timestamp: new Date().toISOString()
    };

    await axios.post(process.env.PDF_QUOTE_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📄 PDF quote generation triggered via Make.com webhook');
  } catch (error: any) {
    console.error('Failed to trigger PDF quote:', error.message);
  }
}

export async function addToCalendar(contact: Contact) {
  try {
    const calendarWebhookUrl = process.env.CALENDAR_WEBHOOK_URL || "https://hook.us2.make.com/pd6js5hayd17egoe0o28b7adwbqy5yyo";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(calendarWebhookUrl, {
      title: `👤 Follow-Up: ${fullName}`,
      email: contact.email,
      start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      source: 'Business Card Scanner',
      company: contact.company,
      phone: contact.phone,
      full_name: fullName
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📅 Calendar follow-up event created for', fullName);
  } catch (error: any) {
    console.error('Failed to add calendar event:', error.message);
  }
}

export async function pushToStripe(contact: Contact) {
  try {
    const stripeWebhookUrl = process.env.STRIPE_WEBHOOK_URL;
    
    if (!stripeWebhookUrl) {
      console.log('Stripe webhook URL not configured, skipping billing flow');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    // Check if contact qualifies for billing (has company and email domain)
    const qualifiesForBilling = contact.company && contact.email && contact.email.includes('@') && !contact.email.includes('gmail.com');
    
    if (!qualifiesForBilling) {
      console.log('Contact does not qualify for automated billing flow');
      return;
    }

    await axios.post(stripeWebhookUrl, {
      email: contact.email,
      full_name: fullName,
      company: contact.company,
      phone: contact.phone,
      selected_package: 'Pro',
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('💳 Stripe billing flow triggered for', fullName);
  } catch (error: any) {
    console.error('Failed to trigger Stripe billing:', error.message);
  }
}

export async function sendNDAEmail(contact: Contact) {
  try {
    const ndaEmailWebhookUrl = process.env.NDA_EMAIL_WEBHOOK_URL;
    
    if (!ndaEmailWebhookUrl) {
      console.log('NDA email webhook URL not configured, skipping NDA email');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    // Check if contact qualifies for NDA (has company and business email)
    const qualifiesForNDA = contact.company && contact.email && contact.email.includes('@') && !contact.email.includes('gmail.com');
    
    if (!qualifiesForNDA) {
      console.log('Contact does not qualify for automated NDA email');
      return;
    }

    await axios.post(ndaEmailWebhookUrl, {
      email: contact.email,
      full_name: fullName,
      company: contact.company,
      subject: `YoBot NDA - Confidentiality Agreement for ${contact.company}`,
      message: `Hi ${fullName},\n\nThank you for your interest in YoBot's automation solutions. To proceed with our business discussions, please review and sign the attached Non-Disclosure Agreement.\n\nThis NDA will protect both parties' confidential information as we explore potential collaboration opportunities.\n\nBest regards,\nYoBot Team`,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📧 NDA email sent to', fullName);
  } catch (error: any) {
    console.error('Failed to send NDA email:', error.message);
  }
}

export async function autoTagContactType(contact: Contact): Promise<string> {
  let contactType = "Unknown";
  const domain = contact.email?.split("@")[1] || "";
  const company = contact.company?.toLowerCase() || "";

  // Government detection
  if (domain.endsWith(".gov") || domain.endsWith(".mil") || 
      company.includes("department") || company.includes("municipal") || 
      company.includes("federal") || company.includes("county") || 
      company.includes("city of")) {
    contactType = "Gov";
  }
  // Business detection
  else if (company.includes("llc") || company.includes("inc") || 
           company.includes("corp") || company.includes("solutions") ||
           company.includes("consulting") || company.includes("services") ||
           (!domain.includes("gmail") && !domain.includes("yahoo") && !domain.includes("hotmail") && company)) {
    contactType = "B2B";
  }
  // Consumer detection
  else if (domain.includes("gmail") || domain.includes("yahoo") || 
           domain.includes("hotmail") || domain.includes("outlook") ||
           !company) {
    contactType = "B2C";
  }
  // Default to B2B if we have company info but unclear domain
  else {
    contactType = "B2B";
  }

  console.log(`🏷️ Tagged contact as: ${contactType}`);
  return contactType;
}

export async function sendVoicebotWebhookResponse(contact: Contact, status: string = 'success') {
  const contactType = await autoTagContactType(contact);
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

  return {
    status: status,
    message: 'Contact processed and logged in CRM.',
    contact_type: contactType,
    contact_name: fullName,
    company: contact.company,
    next_steps: 'Follow-up scheduled and NDA sent for qualified contacts.',
    timestamp: new Date().toISOString()
  };
}

export async function sendWebhookResponse(contact: Contact, status: string, webhookReplyUrl?: string) {
  try {
    if (!webhookReplyUrl) {
      console.log('No webhook reply URL provided, skipping response');
      return;
    }

    const responseBody = {
      contactId: contact.email, // Using email as unique identifier
      voiceBotReply: status === "success"
        ? `Got it. Your request has been completed.`
        : `There was a hiccup. I've logged the issue for review.`,
      status: status,
      timestamp: new Date().toISOString(),
      source: 'YoBot Business Card Scanner'
    };

    await axios.post(webhookReplyUrl, responseBody, {
      headers: { 
        "Content-Type": "application/json" 
      },
      timeout: 5000
    });

    console.log('📬 Webhook response sent to VoiceBot');
  } catch (error: any) {
    console.error('Failed to send webhook response:', error.message);
  }
}

export async function syncToQuickBooks(contact: Contact) {
  try {
    // Try direct QuickBooks API first, fallback to webhook
    if (process.env.QUICKBOOKS_TOKEN && process.env.QUICKBOOKS_COMPANY_ID) {
      await syncToQuickBooksDirectAPI(contact);
    } else {
      await syncToQuickBooksWebhook(contact);
    }
  } catch (error: any) {
    console.error('Failed to sync to QuickBooks:', error.message);
  }
}

async function syncToQuickBooksDirectAPI(contact: Contact) {
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
  const contactType = await autoTagContactType(contact);

  // Check if contact qualifies for QuickBooks (B2B or Gov)
  const qualifiesForQuickBooks = contactType === 'B2B' || contactType === 'Gov';
  
  if (!qualifiesForQuickBooks) {
    console.log('Contact does not qualify for QuickBooks sync');
    return;
  }

  const quickBooksPayload = {
    displayName: fullName,
    primaryEmailAddr: { address: contact.email },
    notes: `Imported from YoBot® | CRM → QuickBooks`,
    companyName: contact.company,
    customField: [
      {
        DefinitionId: "1",
        Name: "Lead Source",
        Type: "StringType",
        StringValue: "YoBot® AI"
      }
    ]
  };

  await axios.post(
    `https://quickbooks.api.intuit.com/v3/company/${process.env.QUICKBOOKS_COMPANY_ID}/customer`,
    quickBooksPayload,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.QUICKBOOKS_TOKEN}`
      },
      timeout: 10000
    }
  );

  console.log('✅ QuickBooks direct API sync complete for', fullName);
}

async function syncToQuickBooksWebhook(contact: Contact) {
  const quickbooksWebhookUrl = process.env.QUICKBOOKS_WEBHOOK_URL || "https://hook.us2.make.com/1n4fqwckdjfdwdq28sds8";
  
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
  const contactType = await autoTagContactType(contact);

  // Check if contact qualifies for QuickBooks invoice (B2B or Gov)
  const qualifiesForInvoice = contactType === 'B2B' || contactType === 'Gov';
  
  if (!qualifiesForInvoice) {
    console.log('Contact does not qualify for QuickBooks invoice generation');
    return;
  }

  await axios.post(quickbooksWebhookUrl, {
    email: contact.email,
    company: contact.company,
    full_name: fullName,
    amount: 5000, // Default Pro package amount
    line_items: [
      {
        description: "YoBot Pro Automation Package",
        quantity: 1,
        rate: 5000
      }
    ],
    contact_type: contactType,
    quote_id: `YB-${Date.now()}`,
    source: 'Business Card Scanner',
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  console.log('📊 QuickBooks webhook sync triggered for', fullName);
}

export async function alertSlackFailure(contact: Contact, errorMessage: string) {
  try {
    const slackFailWebhookUrl = process.env.SLACK_FAIL_WEBHOOK_URL || "https://hooks.slack.com/services/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";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const contactType = await autoTagContactType(contact);

    await axios.post(slackFailWebhookUrl, {
      text: `❌ *YoBot® Alert: System Failure Detected*\n• Contact: ${fullName} (${contact.email})\n• Company: ${contact.company || 'N/A'}\n• Type: ${contactType}\n• Error: ${errorMessage}\n• Time: ${new Date().toLocaleString()}`
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('🚨 Failure alert sent to #yobot-fails channel');
  } catch (error: any) {
    console.error('Failed to send Slack failure alert:', error.message);
  }
}

export async function sendHubSpotFallback(contact: Contact) {
  try {
    const fallbackWebhookUrl = process.env.HUBSPOT_FALLBACK_WEBHOOK_URL || "https://hook.us2.make.com/bkq2nv4pqlc8y0jtp9a2le4g";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const contactType = await autoTagContactType(contact);

    await axios.post(fallbackWebhookUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      type: contactType,
      phone: contact.phone,
      source: "HubSpot Fallback",
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🔄 HubSpot fallback webhook triggered for', fullName);
  } catch (error: any) {
    console.error('Failed to send HubSpot fallback:', error.message);
  }
}

export async function sendErrorSlackAlert(contact: Contact, moduleName: string, error: Error) {
  try {
    const errorWebhookUrl = process.env.SLACK_ERROR_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
    
    if (!errorWebhookUrl) {
      console.log('No error Slack webhook configured');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';

    const message = {
      text: `🚨 *YoBot® Error Alert*\n• *Module:* ${moduleName}\n• *Name:* ${fullName}\n• *Email:* ${contact.email || 'N/A'}\n• *Error:* ${error.message}\n• *Time:* ${new Date().toLocaleString()}`
    };

    await axios.post(errorWebhookUrl, message, {
      headers: { 
        "Content-Type": "application/json" 
      },
      timeout: 5000
    });

    console.log('⚠️ Sent error alert to Slack error channel');
  } catch (alertError: any) {
    console.error('Failed to send error alert:', alertError.message);
  }
}

export async function pushToProposalDashboard(contact: Contact) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log('Airtable credentials not configured for proposal dashboard');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const contactType = await autoTagContactType(contact);

    const payload = {
      fields: {
        "Contact Name": fullName,
        "Email": contact.email,
        "Company": contact.company || "",
        "Submitted At": new Date().toISOString(),
        "Package Type": "YoBot Pro", // Default package
        "Contact Type": contactType,
        "Source": "Business Card Scanner"
      }
    };

    await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Proposal%20Dashboard`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log('📤 Contact pushed to Proposal Dashboard');
  } catch (error: any) {
    console.error('Failed to push to proposal dashboard:', error.message);
  }
}

export async function pushToQuoteDashboard(contact: Contact) {
  try {
    const quoteDashboardUrl = process.env.QUOTE_DASHBOARD_WEBHOOK_URL || "https://hook.us2.make.com/3dx9f28jqwlzcvjv8mpks1r";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const contactType = await autoTagContactType(contact);
    const quoteId = `YB-${Date.now()}`;

    await axios.post(quoteDashboardUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      quote_id: quoteId,
      type: contactType,
      quote_status: "Pending",
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📄 Quote dashboard entry created for', fullName);
  } catch (error: any) {
    console.error('Failed to push to quote dashboard:', error.message);
  }
}

export async function scheduleFollowUpTask(contact: Contact) {
  try {
    const taskSchedulerUrl = process.env.TASK_SCHEDULER_WEBHOOK_URL || "https://hook.us2.make.com/q0z48nfwhv7xgcxdjkpx81";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    await axios.post(taskSchedulerUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      task_type: "Follow-Up",
      due_date: followUpDate,
      assigned_to: "Tyson",
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📅 Follow-up task scheduled for', fullName);
  } catch (error: any) {
    console.error('Failed to schedule follow-up task:', error.message);
  }
}

async function enrichWithApollo(firstName: string, lastName: string, companyDomain: string) {
  try {
    const apolloKey = process.env.APOLLO_API_KEY;
    if (!apolloKey) {
      console.log('Apollo API key not configured, skipping enrichment');
      return null;
    }

    const url = "https://api.apollo.io/v1/mixed_people/search";
    const headers = {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json"
    };
    
    const payload = {
      api_key: apolloKey,
      q_organization_domains: [companyDomain],
      person_titles: [],
      page: 1,
      person_names: [`${firstName} ${lastName}`]
    };

    const response = await axios.post(url, payload, { headers });
    
    if (response.status === 200) {
      const data = response.data;
      if (data.people && data.people.length > 0) {
        const enriched = data.people[0];
        return {
          email: enriched.email,
          phone: enriched.phone,
          job_title: enriched.title,
          linkedin_url: enriched.linkedin_url
        };
      }
    }
    return null;
  } catch (error: any) {
    console.error('Apollo enrichment failed:', error.message);
    return null;
  }
}

async function sendSlackAlert(event_type: string, source: string, status: string, details: string) {
  try {
    const slack_url = process.env.SLACK_WEBHOOK_URL;
    if (!slack_url) {
      console.log('Slack webhook URL not configured, skipping alert');
      return { status: 200, message: 'Skipped - no webhook URL' };
    }
    
    const slack_payload = {
      "text": `📡 *${event_type}* from *${source}*\nStatus: *${status}*\n🧾 ${details}`
    };
    
    const response = await axios.post(slack_url, slack_payload);
    return { status: response.status, data: response.data };
  } catch (error: any) {
    console.error('Failed to send Slack alert:', error.message);
    return { status: 500, error: error.message };
  }
}

export async function logEventToAirtable(event_type: string, source: string, contact: string, status: string, details: string) {
  try {
    // Using the correct Base ID and Table ID you provided
    const airtable_url = "https://api.airtable.com/v0/appCoAtCZdARb4AM2/tblRfeIho29IKqqCQ";
    const headers = {
      "Authorization": "Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa",
      "Content-Type": "application/json"
    };
    
    const payload = {
      "fields": {
        "📅 Timestamp": new Date().toISOString() + "Z",
        "📌 Event Type": event_type,
        "🌿 Source Module": source,
        "👤 Contact": contact,
        "📍 Status": status,
        "🧾 Details": details
      }
    };
    
    const response = await axios.post(airtable_url, payload, { headers });
    console.log('📡 Event logged to Airtable:', event_type);
    
    // Optional: Send Slack alert after successful Airtable logging
    await sendSlackAlert(event_type, source, status, details);
    
    return { status: response.status, data: response.data };
  } catch (error: any) {
    console.error('❌ Failed to log event to Airtable:', error.message);
    return { status: 500, error: error.message };
  }
}

export async function pushStripeConfirmation(contact: Contact, paymentData: any = {}) {
  try {
    const stripeConfirmationUrl = process.env.STRIPE_CONFIRMATION_WEBHOOK_URL || "https://hook.us2.make.com/4z2rnkq6bpp0v2t7c6qf1j";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(stripeConfirmationUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      stripe_id: paymentData.stripe_id || `stripe_${Date.now()}`,
      amount_paid: paymentData.amount_paid || 5000,
      payment_date: paymentData.payment_date || new Date().toISOString(),
      payment_type: "Initial Deposit",
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('💰 Stripe payment confirmation logged for', fullName);
  } catch (error: any) {
    console.error('Failed to push Stripe confirmation:', error.message);
  }
}

export async function notifyStripePaymentSlack(contact: Contact, paymentData: any = {}) {
  try {
    const salesConfirmationUrl = process.env.SALES_CONFIRMATION_WEBHOOK_URL || "https://hooks.slack.com/services/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";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const amountPaid = paymentData.amount_paid || 5000;
    const stripeId = paymentData.stripe_id || `stripe_${Date.now()}`;

    await axios.post(salesConfirmationUrl, {
      text: `💰 *YoBot® Payment Received*\n• ${fullName} (${contact.email})\n• Amount: $${amountPaid}\n• Company: ${contact.company || 'N/A'}\n• Stripe ID: ${stripeId}\n• Time: ${new Date().toLocaleString()}`
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('🎉 Sales confirmation alert sent to #sales-confirmations');
  } catch (error: any) {
    console.error('Failed to send sales confirmation alert:', error.message);
  }
}

export async function triggerToneVariant(contact: Contact, voiceData: any = {}) {
  try {
    const toneVariantUrl = process.env.TONE_VARIANT_WEBHOOK_URL || "https://hook.us2.make.com/22nsdvwb0rvyakx7qe67k9";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const contactType = await autoTagContactType(contact);
    
    // Determine preferred tone based on contact type
    const preferredTone = contactType === 'Gov' ? 'professional' : 
                         contactType === 'B2B' ? 'friendly' : 'casual';

    await axios.post(toneVariantUrl, {
      voice_id: "cjVigY5qzO86Huf0OWal",
      full_name: fullName,
      tone: voiceData.preferred_tone || preferredTone,
      response_text: voiceData.voice_response_text || `Hello ${fullName}, thank you for your interest in YoBot automation solutions.`,
      contact_type: contactType,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🗣️ Voice tone variant triggered for', fullName);
  } catch (error: any) {
    console.error('Failed to trigger tone variant:', error.message);
  }
}

export async function generateFallbackAudio(contact: Contact, audioData: any = {}) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('ElevenLabs API key not configured');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const fallbackText = audioData.fallback_text || 
      `Thank you ${fullName} for connecting with YoBot. We'll be in touch soon regarding your automation needs.`;

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/cjVigY5qzO86Huf0OWal/stream",
      {
        text: fallbackText,
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.8
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        },
        timeout: 15000,
        responseType: 'stream'
      }
    );

    console.log('🎧 Fallback audio generated for', fullName);
    return response.data;
  } catch (error: any) {
    console.error('Failed to generate fallback audio:', error.message);
  }
}

export async function triggerPDFReceipt(contact: Contact, paymentData: any = {}) {
  try {
    const pdfReceiptUrl = process.env.PDF_RECEIPT_WEBHOOK_URL || "https://hook.us2.make.com/ed89qp23lzjmf71jxdplnc";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(pdfReceiptUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      amount_paid: paymentData.amount_paid || 5000,
      stripe_id: paymentData.stripe_id || `stripe_${Date.now()}`,
      payment_date: paymentData.payment_date || new Date().toISOString(),
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📄 PDF receipt generation triggered for', fullName);
  } catch (error: any) {
    console.error('Failed to trigger PDF receipt:', error.message);
  }
}

export async function handleStripeRetry(contact: Contact, errorData: any = {}) {
  try {
    const stripeRetryUrl = process.env.STRIPE_RETRY_WEBHOOK_URL || "https://hook.us2.make.com/xd7vw9c1k8qpqv03pdrzsb";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(stripeRetryUrl, {
      email: contact.email,
      full_name: fullName,
      company: contact.company,
      failed_reason: errorData.payment_error || 'Payment processing failed',
      retry_flag: true,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🔁 Stripe retry handler triggered for', fullName);
  } catch (error: any) {
    console.error('Failed to handle Stripe retry:', error.message);
  }
}

export async function logToneMatch(contact: Contact, voiceData: any = {}) {
  try {
    const toneMatchUrl = process.env.TONE_MATCH_WEBHOOK_URL || "https://hook.us2.make.com/9r2xkm67dpvlxqk1mzpa4e";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const contactType = await autoTagContactType(contact);
    
    // Calculate tone match score based on contact type alignment
    const selectedTone = voiceData.preferred_tone || (contactType === 'Gov' ? 'professional' : contactType === 'B2B' ? 'friendly' : 'casual');
    const matchScore = voiceData.tone_match_score || 0.85;

    await axios.post(toneMatchUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      selected_tone: selectedTone,
      match_score: matchScore,
      contact_type: contactType,
      source: "VoiceBot Personality Sync",
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🧠 Voice tone match logged for', fullName);
  } catch (error: any) {
    console.error('Failed to log tone match:', error.message);
  }
}

export async function logVoiceTranscript(contact: Contact, transcriptData: any = {}) {
  try {
    const transcriptUrl = process.env.VOICE_TRANSCRIPT_WEBHOOK_URL || "https://hook.us2.make.com/8pxdmlvqzqptokjv3n9nrr";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(transcriptUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      transcript_text: transcriptData.transcript_fallback || `Business card scan initiated for ${fullName}`,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📝 Voice transcript logged for', fullName);
  } catch (error: any) {
    console.error('Failed to log voice transcript:', error.message);
  }
}

export async function assignCRMOwner(contact: Contact) {
  try {
    const contactType = await autoTagContactType(contact);
    let assignedRep = "Unassigned";

    if (contactType === 'Gov') {
      assignedRep = "Daniel Sharpe";
    } else if (contactType === 'B2B') {
      assignedRep = "Tyson Lerfald";
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    console.log(`🧑‍💼 CRM Owner assigned: ${fullName} → ${assignedRep} (${contactType})`);
    
    return assignedRep;
  } catch (error: any) {
    console.error('Failed to assign CRM owner:', error.message);
    return "Unassigned";
  }
}

export async function logVoiceEscalationEvent(contact: Contact, escalationData: any = {}) {
  try {
    const escalationUrl = process.env.VOICE_ESCALATION_WEBHOOK_URL || "https://hook.us2.make.com/npqxkjwvm8q7z2rj9dy76w";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(escalationUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      reason: escalationData.escalation_reason || 'Voice trigger detected',
      timestamp: new Date().toISOString(),
      escalated_by: "VoiceBot",
      source: 'Business Card Scanner'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🛑 Voice escalation logged for', fullName);
  } catch (error: any) {
    console.error('Failed to log voice escalation:', error.message);
  }
}

export async function dispatchCallSummary(contact: Contact, callData: any = {}) {
  try {
    const callSummaryUrl = process.env.CALL_SUMMARY_WEBHOOK_URL || "https://hook.us2.make.com/vqp92zwkx7lp8yk9gz4o3w";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(callSummaryUrl, {
      full_name: fullName,
      company: contact.company,
      summary: callData.call_summary || `Business card scan completed for ${fullName}`,
      duration: callData.call_duration || '2:30',
      sentiment_score: callData.sentiment_score || 0.8,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Call summary dispatched for', fullName);
  } catch (error: any) {
    console.error('Failed to dispatch call summary:', error.message);
  }
}

export async function pushToMetricsTracker(contact: Contact, metricsData: any = {}) {
  try {
    const metricsUrl = process.env.METRICS_TRACKER_WEBHOOK_URL || "https://hook.us2.make.com/nzm39kp0od0s87wvbz92ew";
    
    await axios.post(metricsUrl, {
      email: contact.email,
      company: contact.company,
      interaction_type: "Business Card Scanner",
      duration: metricsData.call_duration || '2:30',
      score: metricsData.sentiment_score || 0.8,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📈 Metrics pushed to Command Center tracker');
  } catch (error: any) {
    console.error('Failed to push metrics:', error.message);
  }
}

export async function logCRMVoiceMatch(contact: Contact, matchData: any = {}) {
  try {
    const crossRefUrl = process.env.CRM_VOICE_MATCH_WEBHOOK_URL || "https://hook.us2.make.com/lqr9jpvbx7xkmdo2apxe8j";
    
    await axios.post(crossRefUrl, {
      email: contact.email,
      company: contact.company,
      crm_id: matchData.crm_id || `hubspot_${Date.now()}`,
      voice_log_id: matchData.voice_log_id || `voice_${Date.now()}`,
      matched: true,
      synced_at: new Date().toISOString(),
      source: 'Business Card Scanner'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🔗 CRM-VoiceBot cross-reference logged');
  } catch (error: any) {
    console.error('Failed to log CRM-Voice match:', error.message);
  }
}

export async function updateContractStatus(contact: Contact, contractData: any = {}) {
  try {
    const contractUrl = process.env.CONTRACT_STATUS_WEBHOOK_URL || "https://hook.us2.make.com/2zyqjkwlbdl09vqw7am3o8";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(contractUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      contract_status: contractData.contract_status || "Pending",
      signed_at: contractData.contract_signed_date || new Date().toISOString(),
      source: 'Business Card Scanner'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🧾 Contract status updated for', fullName);
  } catch (error: any) {
    console.error('Failed to update contract status:', error.message);
  }
}

export async function logIntentAndEntities(contact: Contact, nluData: any = {}) {
  try {
    const intentUrl = process.env.INTENT_ENTITY_WEBHOOK_URL || "https://hook.us2.make.com/oq7l1wkv39xpejkz6ev2m3";

    await axios.post(intentUrl, {
      email: contact.email,
      company: contact.company,
      intent: nluData.detected_intent || 'business_card_scan',
      entities: nluData.extracted_entities || { name: contact.firstName + ' ' + contact.lastName, company: contact.company },
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🧠 Intent and entities logged for NLU analysis');
  } catch (error: any) {
    console.error('Failed to log intent and entities:', error.message);
  }
}

export async function pushCommandSuggestions(contact: Contact, suggestionData: any = {}) {
  try {
    const suggestionsUrl = process.env.COMMAND_SUGGESTIONS_WEBHOOK_URL || "https://hook.us2.make.com/7ndopkwz4x2mqlvgjm0yka";
    
    const contactType = await autoTagContactType(contact);
    const suggestions = suggestionData.bot_suggestions || [
      `Follow up with ${contact.firstName} within 24 hours`,
      `Send personalized demo for ${contact.company}`,
      `Schedule discovery call for enterprise features`
    ];

    await axios.post(suggestionsUrl, {
      email: contact.email,
      company: contact.company,
      suggestions: suggestions,
      trigger_event: suggestionData.suggestion_trigger || 'new_business_card_scan',
      contact_type: contactType,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🧠 Command suggestions pushed to dashboard');
  } catch (error: any) {
    console.error('Failed to push command suggestions:', error.message);
  }
}

export async function logScenarioLoop(contact: Contact, testData: any = {}) {
  try {
    const scenarioUrl = process.env.QA_SCENARIO_WEBHOOK_URL || "https://hook.us2.make.com/vqz0mky9xnzjgwdqka0jv3";

    await axios.post(scenarioUrl, {
      test_case_id: testData.test_case_id || `tc_${Date.now()}`,
      scenario_name: testData.scenario_name || 'business_card_scan_workflow',
      loop_count: testData.loop_count || 1,
      success: testData.test_passed || true,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🔁 QA scenario loop tracked');
  } catch (error: any) {
    console.error('Failed to log scenario loop:', error.message);
  }
}

export async function logABScriptTest(contact: Contact, scriptData: any = {}) {
  try {
    const abTestUrl = process.env.AB_SCRIPT_WEBHOOK_URL || "https://hook.us2.make.com/1npkjv9xdqzr52wv3kj8m6";
    
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;

    await axios.post(abTestUrl, {
      full_name: fullName,
      email: contact.email,
      company: contact.company,
      script_variant: scriptData.script_variant || 'variant_a',
      conversion_result: scriptData.conversion_result || 'pending',
      call_id: scriptData.call_id || `call_${Date.now()}`,
      source: 'Business Card Scanner',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('🧪 A/B script test logged for optimization');
  } catch (error: any) {
    console.error('Failed to log A/B script test:', error.message);
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

export async function assignLeadScore(contact: Contact): Promise<string> {
  let score = "🧊 Cold";
  
  const domain = contact.email?.split("@")[1] || "";
  const company = contact.company?.toLowerCase() || "";
  const contactType = await autoTagContactType(contact);
  
  // Hot lead criteria
  if (contactType === "Gov" || 
      company.includes("enterprise") || 
      company.includes("fortune") ||
      domain.includes("microsoft") || 
      domain.includes("amazon") ||
      domain.includes("google")) {
    score = "🔥 Hot";
  }
  // Warm lead criteria
  else if (contactType === "B2B" || 
           company.includes("llc") || 
           company.includes("inc") || 
           company.includes("corp")) {
    score = "⚠️ Warm";
  }
  // Cold remains default for B2C or unclear contacts

  console.log(`🎯 Lead scored as: ${score}`);
  return score;
}

export async function logToSmartSpend(contact: Contact) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log('Airtable credentials not configured for SmartSpend logging');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const leadScore = await assignLeadScore(contact);
    const contactType = await autoTagContactType(contact);

    // Estimate budget based on contact type and lead score
    let estimatedBudget = 0;
    if (contactType === "Gov" && leadScore === "🔥 Hot") {
      estimatedBudget = 25000;
    } else if (contactType === "B2B" && leadScore === "🔥 Hot") {
      estimatedBudget = 15000;
    } else if (contactType === "B2B" && leadScore === "⚠️ Warm") {
      estimatedBudget = 7500;
    } else {
      estimatedBudget = 2500;
    }

    const payload = {
      fields: {
        "Contact": fullName,
        "Email": contact.email,
        "Company": contact.company || "",
        "Lead Score": leadScore,
        "Contact Type": contactType,
        "Estimated Budget": estimatedBudget,
        "ROI Estimate": `${Math.round(estimatedBudget * 3.2)}`, // 3.2x ROI estimate
        "Source": "Business Card Scanner",
        "Logged At": new Date().toISOString()
      }
    };

    await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Botalytics%20Monthly%20Log`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log('🧾 Contact ROI logged to SmartSpend with', leadScore, 'scoring');
  } catch (error: any) {
    console.error('Failed to log to SmartSpend:', error.message);
  }
}

export async function markContactComplete(contact: Contact, airtableRecordId?: string) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !airtableRecordId) {
      console.log('Cannot mark contact complete - missing Airtable config or record ID');
      return;
    }

    await axios.patch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Contacts`,
      {
        records: [
          {
            id: airtableRecordId,
            fields: {
              "Completed": true,
              "Completed At": new Date().toISOString(),
              "Status": "Processing Complete"
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log('✅ Contact marked complete in Airtable');
  } catch (error: any) {
    console.error('Failed to mark contact complete:', error.message);
  }
}

export async function logToCommandCenter(contact: Contact, source: string = "Business Card Scanner") {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log('Airtable credentials not configured for Command Center logging');
      return;
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const leadScore = await assignLeadScore(contact);
    const contactType = await autoTagContactType(contact);

    const payload = {
      fields: {
        "Contact": fullName,
        "Email": contact.email,
        "Company": contact.company || "",
        "Package Type": "YoBot Pro", // Default package
        "Lead Score": leadScore,
        "Contact Type": contactType,
        "Source": source,
        "Timestamp": new Date().toISOString()
      }
    };

    await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Command%20Center%20Metrics%20Tracker`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log('📊 Logged to Command Center Metrics Tracker');
  } catch (error: any) {
    console.error('Failed to log to Command Center:', error.message);
  }
}