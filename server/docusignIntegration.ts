import axios from 'axios';

interface DocuSignConfig {
  accessToken: string;
  templateId: string;
  accountId: string;
  baseUrl: string;
}

interface SignerInfo {
  email: string;
  name: string;
  roleName?: string;
}

interface EnvelopeResponse {
  envelopeId: string;
  status: string;
  statusDateTime: string;
  uri: string;
}

const docuSignConfig: DocuSignConfig = {
  accessToken: "eb2dbcb54b7d277675e2ce002a60ce111ca71c7c4f1a9948a89d963ec3999d3b",
  templateId: "646522c7-edd9-485b-bbb4-20ea1cd92ef9",
  accountId: "1e6dd510-df4d-42bc-b998-23cf8dac6543",
  baseUrl: "https://demo.docusign.net/restapi/v2.1"
};

export async function sendDocuSignSignature(
  signerEmail: string, 
  signerName: string,
  emailSubject: string = "YoBot Sales Agreement – Please Sign"
): Promise<{ success: boolean; envelopeId?: string; error?: string }> {
  try {
    const url = `${docuSignConfig.baseUrl}/accounts/${docuSignConfig.accountId}/envelopes`;

    const headers = {
      "Authorization": `Bearer ${docuSignConfig.accessToken}`,
      "Content-Type": "application/json"
    };

    const payload = {
      templateId: docuSignConfig.templateId,
      templateRoles: [
        {
          roleName: "Client",
          name: signerName,
          email: signerEmail
        }
      ],
      status: "sent",
      emailSubject: emailSubject
    };

    console.log('Sending DocuSign envelope to:', signerEmail);

    const response = await axios.post(url, payload, { headers });

    if (response.status === 201) {
      const envelopeData: EnvelopeResponse = response.data;
      console.log('✅ DocuSign sent successfully. Envelope ID:', envelopeData.envelopeId);
      
      return {
        success: true,
        envelopeId: envelopeData.envelopeId
      };
    } else {
      console.error('❌ DocuSign Error:', response.status, response.data);
      return {
        success: false,
        error: `DocuSign API returned status ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('❌ DocuSign Integration Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown DocuSign error'
    };
  }
}

export async function getEnvelopeStatus(envelopeId: string): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    const url = `${docuSignConfig.baseUrl}/accounts/${docuSignConfig.accountId}/envelopes/${envelopeId}`;

    const headers = {
      "Authorization": `Bearer ${docuSignConfig.accessToken}`,
      "Accept": "application/json"
    };

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      return {
        success: true,
        status: response.data.status
      };
    } else {
      return {
        success: false,
        error: `Failed to get envelope status: ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('Error getting envelope status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    };
  }
}

export async function listEnvelopes(count: number = 10): Promise<{ success: boolean; envelopes?: any[]; error?: string }> {
  try {
    const url = `${docuSignConfig.baseUrl}/accounts/${docuSignConfig.accountId}/envelopes`;

    const headers = {
      "Authorization": `Bearer ${docuSignConfig.accessToken}`,
      "Accept": "application/json"
    };

    const params = {
      count: count,
      order: 'desc',
      order_by: 'created'
    };

    const response = await axios.get(url, { headers, params });

    if (response.status === 200) {
      return {
        success: true,
        envelopes: response.data.envelopes || []
      };
    } else {
      return {
        success: false,
        error: `Failed to list envelopes: ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('Error listing envelopes:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    };
  }
}