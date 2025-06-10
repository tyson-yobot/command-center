import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Core business documents that should always be available
const BUSINESS_DOCUMENTS = {
  nda: {
    name: 'YoBot NDA - Non-Disclosure Form.docx',
    path: 'attached_assets/YoBot NDA - Non-Disclosure Form.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'Mutual Non-Disclosure Agreement for confidential business discussions'
  },
  contract: {
    name: 'YoBot Sales Contract.docx',
    path: 'attached_assets/YoBot Sales Contract.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'Standard AI Services Agreement with pricing and terms'
  }
};

// GET /api/documents - List available business documents
router.get('/documents', (req, res) => {
  const documents = Object.entries(BUSINESS_DOCUMENTS).map(([key, doc]) => ({
    id: key,
    name: doc.name,
    description: doc.description,
    downloadUrl: `/api/documents/download/${key}`,
    emailUrl: `/api/documents/email/${key}`
  }));
  
  res.json(documents);
});

// GET /api/documents/download/:docId - Download document
router.get('/download/:docId', (req, res) => {
  const { docId } = req.params;
  const document = BUSINESS_DOCUMENTS[docId as keyof typeof BUSINESS_DOCUMENTS];
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  const filePath = path.join(process.cwd(), document.path);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document file not found on server' });
  }
  
  res.setHeader('Content-Type', document.type);
  res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
  res.sendFile(filePath);
});

// POST /api/documents/email/:docId - Email document to recipient
router.post('/email/:docId', async (req, res) => {
  const { docId } = req.params;
  const { recipientEmail, recipientName, message } = req.body;
  
  const document = BUSINESS_DOCUMENTS[docId as keyof typeof BUSINESS_DOCUMENTS];
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  if (!recipientEmail) {
    return res.status(400).json({ error: 'Recipient email is required' });
  }
  
  const filePath = path.join(process.cwd(), document.path);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document file not found on server' });
  }
  
  try {
    // For now, we'll log the email request - you can integrate with SendGrid later
    console.log(`📧 Email Request:
      Document: ${document.name}
      To: ${recipientEmail} (${recipientName || 'N/A'})
      Message: ${message || 'Standard document delivery'}
      File: ${filePath}
    `);
    
    // TODO: Integrate with SendGrid to actually send email with attachment
    // This would require SENDGRID_API_KEY to be configured
    
    res.json({ 
      success: true, 
      message: `Document "${document.name}" email logged for ${recipientEmail}` 
    });
    
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;