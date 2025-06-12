import axios from 'axios';

interface AirtableLogEntry {
  functionName: string;
  result: boolean;
  notes?: string;
  qaOwner?: string;
  moduleType?: string;
  relatedScenarioLink?: string;
}

export async function logToAirtable({
  functionName,
  result,
  notes = "",
  qaOwner = "Tyson Lerfald",
  moduleType = "Webhook",
  relatedScenarioLink = ""
}: AirtableLogEntry): Promise<number> {
  const airtableUrl = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbly0fjE2M5uHET9X";
  const headers = {
    "Authorization": "Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa",
    "Content-Type": "application/json"
  };

  const payload = {
    fields: {
      "🔧 Integration Name": functionName,
      "✅ Pass/Fail": result ? "✅" : "❌",
      "🧠 Notes / Debug": notes,
      "📅 Test Date": new Date().toISOString(),
      "🧑‍💻 QA Owner": qaOwner,
      "📤 Output Data Populated": true,
      "🗃️ Record Created?": true,
      "🔁 Retry Attempted?": false,
      "🧩 Module Type": moduleType,
      "📂 Related Scenario Link": relatedScenarioLink
    }
  };

  try {
    const response = await axios.post(airtableUrl, payload, { headers });
    console.log(`[AIRTABLE LOG] ${functionName}: ${result ? 'SUCCESS' : 'FAILED'} - Status: ${response.status}`);
    return response.status;
  } catch (error) {
    console.error(`[AIRTABLE LOG ERROR] Failed to log ${functionName}:`, error);
    return 500;
  }
}

export default logToAirtable;