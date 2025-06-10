/**
 * Twilio SMS Automation Routes (Functions 301-310)
 */

import { Router } from 'express';
import * as twilioAutomation from './twilioAutomation';

const router = Router();

// Function 301: SMS Lead Notification
router.post('/function-301', async (req, res) => {
  try {
    const { phoneNumber, leadInfo } = req.body;
    const result = await twilioAutomation.sendSMSLeadNotification(phoneNumber, leadInfo);
    res.json({ success: true, functionId: 301, name: "SMS Lead Notification", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 301, error: error.message });
  }
});

// Function 302: SMS Appointment Reminder
router.post('/function-302', async (req, res) => {
  try {
    const { phoneNumber, appointment } = req.body;
    const result = await twilioAutomation.sendAppointmentReminder(phoneNumber, appointment);
    res.json({ success: true, functionId: 302, name: "SMS Appointment Reminder", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 302, error: error.message });
  }
});

// Function 303: SMS Follow-up Automation
router.post('/function-303', async (req, res) => {
  try {
    const { phoneNumber, followUpData } = req.body;
    const result = await twilioAutomation.sendFollowUpSMS(phoneNumber, followUpData);
    res.json({ success: true, functionId: 303, name: "SMS Follow-up Automation", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 303, error: error.message });
  }
});

// Function 304: SMS Payment Reminder
router.post('/function-304', async (req, res) => {
  try {
    const { phoneNumber, paymentInfo } = req.body;
    const result = await twilioAutomation.sendPaymentReminder(phoneNumber, paymentInfo);
    res.json({ success: true, functionId: 304, name: "SMS Payment Reminder", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 304, error: error.message });
  }
});

// Function 305: SMS Support Ticket Alert
router.post('/function-305', async (req, res) => {
  try {
    const { phoneNumber, ticketInfo } = req.body;
    const result = await twilioAutomation.sendSupportTicketAlert(phoneNumber, ticketInfo);
    res.json({ success: true, functionId: 305, name: "SMS Support Ticket Alert", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 305, error: error.message });
  }
});

// Function 306: SMS Survey Request
router.post('/function-306', async (req, res) => {
  try {
    const { phoneNumber, surveyData } = req.body;
    const result = await twilioAutomation.sendSurveyRequest(phoneNumber, surveyData);
    res.json({ success: true, functionId: 306, name: "SMS Survey Request", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 306, error: error.message });
  }
});

// Function 307: SMS Booking Confirmation
router.post('/function-307', async (req, res) => {
  try {
    const { phoneNumber, bookingInfo } = req.body;
    const result = await twilioAutomation.sendBookingConfirmation(phoneNumber, bookingInfo);
    res.json({ success: true, functionId: 307, name: "SMS Booking Confirmation", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 307, error: error.message });
  }
});

// Function 308: SMS Status Update
router.post('/function-308', async (req, res) => {
  try {
    const { phoneNumber, statusInfo } = req.body;
    const result = await twilioAutomation.sendStatusUpdate(phoneNumber, statusInfo);
    res.json({ success: true, functionId: 308, name: "SMS Status Update", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 308, error: error.message });
  }
});

// Function 309: SMS Emergency Alert
router.post('/function-309', async (req, res) => {
  try {
    const { phoneNumber, alertInfo } = req.body;
    const result = await twilioAutomation.sendEmergencyAlert(phoneNumber, alertInfo);
    res.json({ success: true, functionId: 309, name: "SMS Emergency Alert", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 309, error: error.message });
  }
});

// Function 310: SMS Bulk Campaign
router.post('/function-310', async (req, res) => {
  try {
    const { phoneNumbers, campaignData } = req.body;
    const result = await twilioAutomation.sendBulkCampaign(phoneNumbers, campaignData);
    res.json({ success: true, functionId: 310, name: "SMS Bulk Campaign", result });
  } catch (error: any) {
    res.status(500).json({ success: false, functionId: 310, error: error.message });
  }
});

// Execute all Twilio SMS functions
router.post('/execute-all', async (req, res) => {
  const results = [];
  const testData = {
    phoneNumber: '+1234567890',
    leadInfo: { name: 'Test Lead', company: 'Test Corp', score: 85 },
    appointment: { company: 'YoBot', date: '2025-06-05', time: '2:00 PM' },
    followUpData: { name: 'John', service: 'AI Automation' },
    paymentInfo: { invoiceId: 'INV-001', amount: 299, dueDate: '2025-06-10' },
    ticketInfo: { ticketId: 'TKT-001', status: 'resolved', priority: 'high' },
    surveyData: { name: 'Customer', surveyLink: 'https://survey.link' },
    bookingInfo: { service: 'Consultation', date: '2025-06-05', time: '3:00 PM', confirmationId: 'CONF-001' },
    statusInfo: { type: 'Project', status: 'completed', reference: 'PROJ-001' },
    alertInfo: { message: 'System maintenance', action: 'Review logs', contact: 'support@yobot.com' },
    campaignData: { campaignId: 'CAMP-001', message: 'Special offer available!' }
  };

  for (let i = 301; i <= 310; i++) {
    try {
      let result;
      switch (i) {
        case 301: result = await twilioAutomation.sendSMSLeadNotification(testData.phoneNumber, testData.leadInfo); break;
        case 302: result = await twilioAutomation.sendAppointmentReminder(testData.phoneNumber, testData.appointment); break;
        case 303: result = await twilioAutomation.sendFollowUpSMS(testData.phoneNumber, testData.followUpData); break;
        case 304: result = await twilioAutomation.sendPaymentReminder(testData.phoneNumber, testData.paymentInfo); break;
        case 305: result = await twilioAutomation.sendSupportTicketAlert(testData.phoneNumber, testData.ticketInfo); break;
        case 306: result = await twilioAutomation.sendSurveyRequest(testData.phoneNumber, testData.surveyData); break;
        case 307: result = await twilioAutomation.sendBookingConfirmation(testData.phoneNumber, testData.bookingInfo); break;
        case 308: result = await twilioAutomation.sendStatusUpdate(testData.phoneNumber, testData.statusInfo); break;
        case 309: result = await twilioAutomation.sendEmergencyAlert(testData.phoneNumber, testData.alertInfo); break;
        case 310: result = await twilioAutomation.sendBulkCampaign([testData.phoneNumber], testData.campaignData); break;
      }
      results.push({ functionId: i, success: true, result });
    } catch (error: any) {
      results.push({ functionId: i, success: false, error: error.message });
    }
  }

  res.json({
    success: true,
    batch: "Twilio SMS Automation (301-310)",
    totalFunctions: 10,
    results
  });
});

export default router;