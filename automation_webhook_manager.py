#!/usr/bin/env python3
"""
Automation Webhook Manager
Comprehensive webhook automation for all YoBot integrations
"""

import os
import json
import requests
from datetime import datetime
import hashlib
import hmac

class WebhookAutomationManager:
    def __init__(self):
        self.webhook_endpoints = self.setup_webhook_endpoints()
        self.automation_rules = self.load_automation_rules()
        
    def setup_webhook_endpoints(self):
        """Configure all webhook endpoints for automation"""
        return {
            "/webhook/lead-capture": self.process_lead_webhook,
            "/webhook/support-ticket": self.process_support_webhook,
            "/webhook/payment-completed": self.process_payment_webhook,
            "/webhook/stripe-event": self.process_stripe_webhook,
            "/webhook/hubspot-contact": self.process_hubspot_webhook,
            "/webhook/calendar-booking": self.process_calendar_webhook,
            "/webhook/voice-completed": self.process_voice_webhook,
            "/webhook/form-submission": self.process_form_webhook,
            "/webhook/email-opened": self.process_email_webhook,
            "/webhook/demo-scheduled": self.process_demo_webhook,
            "/webhook/contract-signed": self.process_contract_webhook,
            "/webhook/usage-threshold": self.process_usage_webhook
        }

    def load_automation_rules(self):
        """Load comprehensive automation rules"""
        return {
            "lead_automation": {
                "immediate_actions": [
                    "score_lead",
                    "enrich_contact_data",
                    "assign_sales_rep",
                    "send_welcome_email",
                    "create_hubspot_contact",
                    "log_to_airtable",
                    "schedule_followup"
                ],
                "scoring_criteria": {
                    "company_size": {"1-10": 20, "11-50": 40, "51-200": 60, "200+": 80},
                    "industry": {"tech": 30, "finance": 25, "healthcare": 35, "other": 15},
                    "role": {"ceo": 40, "cto": 35, "director": 25, "manager": 15},
                    "engagement": {"demo_request": 50, "pricing_view": 30, "blog_read": 10}
                }
            },
            "support_automation": {
                "immediate_actions": [
                    "categorize_ticket",
                    "generate_ai_response",
                    "create_voice_reply",
                    "post_to_slack",
                    "update_customer_record",
                    "schedule_followup"
                ],
                "escalation_triggers": [
                    "negative_sentiment",
                    "cancellation_keywords",
                    "vip_customer",
                    "response_time_exceeded"
                ]
            },
            "payment_automation": {
                "immediate_actions": [
                    "update_subscription_status",
                    "sync_to_quickbooks",
                    "send_receipt",
                    "update_customer_tier",
                    "trigger_onboarding",
                    "notify_sales_team"
                ]
            },
            "usage_automation": {
                "threshold_actions": [
                    "send_upgrade_notification",
                    "alert_account_manager",
                    "log_usage_spike",
                    "check_billing_limits"
                ]
            }
        }

    def process_lead_webhook(self, payload):
        """Process incoming lead webhook"""
        try:
            lead_data = payload.get('lead', {})
            
            # Score the lead
            score = self.calculate_lead_score(lead_data)
            
            # Enrich contact data
            enriched_data = self.enrich_lead_data(lead_data)
            
            # Auto-assign sales rep
            assigned_rep = self.auto_assign_sales_rep(enriched_data, score)
            
            # Create HubSpot contact
            hubspot_contact = self.create_hubspot_contact(enriched_data)
            
            # Log to Airtable
            airtable_record = self.log_to_airtable(enriched_data, score)
            
            # Send welcome email
            welcome_email = self.send_welcome_email(enriched_data)
            
            # Schedule followup
            followup_scheduled = self.schedule_followup(enriched_data, assigned_rep)
            
            # Post to Slack
            slack_notification = self.post_lead_to_slack(enriched_data, score)
            
            return {
                "status": "success",
                "lead_id": enriched_data.get('id'),
                "score": score,
                "assigned_rep": assigned_rep,
                "hubspot_contact_id": hubspot_contact.get('id'),
                "airtable_record_id": airtable_record.get('id'),
                "actions_completed": 7
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_support_webhook(self, payload):
        """Process support ticket webhook"""
        try:
            ticket_data = payload.get('ticket', {})
            
            # Categorize ticket
            category = self.categorize_support_ticket(ticket_data)
            
            # Generate AI response
            ai_response = self.generate_ai_support_response(ticket_data)
            
            # Create voice reply
            voice_file = self.generate_voice_reply(ai_response)
            
            # Check escalation triggers
            should_escalate = self.check_escalation_triggers(ticket_data)
            
            # Post to appropriate Slack channel
            slack_channel = self.determine_slack_channel(category, should_escalate)
            slack_post = self.post_ticket_to_slack(ticket_data, slack_channel)
            
            # Update customer record
            customer_update = self.update_customer_support_record(ticket_data)
            
            # Log to Airtable
            support_log = self.log_support_to_airtable(ticket_data, category)
            
            return {
                "status": "success",
                "ticket_id": ticket_data.get('id'),
                "category": category,
                "escalated": should_escalate,
                "ai_response": ai_response,
                "voice_file": voice_file,
                "slack_posted": slack_post,
                "actions_completed": 6
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_payment_webhook(self, payload):
        """Process payment completed webhook"""
        try:
            payment_data = payload.get('payment', {})
            
            # Update subscription status
            subscription_update = self.update_subscription_status(payment_data)
            
            # Sync to QuickBooks
            qbo_sync = self.sync_payment_to_quickbooks(payment_data)
            
            # Send receipt
            receipt_sent = self.send_payment_receipt(payment_data)
            
            # Update customer tier if applicable
            tier_update = self.check_customer_tier_update(payment_data)
            
            # Trigger onboarding if new customer
            onboarding_triggered = self.trigger_onboarding_if_new(payment_data)
            
            # Notify sales team of upgrade
            sales_notification = self.notify_sales_of_payment(payment_data)
            
            # Log revenue analytics
            analytics_log = self.log_revenue_analytics(payment_data)
            
            return {
                "status": "success",
                "payment_id": payment_data.get('id'),
                "amount": payment_data.get('amount'),
                "subscription_updated": subscription_update,
                "qbo_synced": qbo_sync,
                "receipt_sent": receipt_sent,
                "actions_completed": 7
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_stripe_webhook(self, payload):
        """Process Stripe webhook events"""
        try:
            event_type = payload.get('type')
            event_data = payload.get('data', {}).get('object', {})
            
            automation_mapping = {
                'payment_intent.succeeded': self.handle_payment_success,
                'payment_intent.payment_failed': self.handle_payment_failure,
                'customer.subscription.created': self.handle_subscription_created,
                'customer.subscription.updated': self.handle_subscription_updated,
                'customer.subscription.deleted': self.handle_subscription_cancelled,
                'invoice.payment_succeeded': self.handle_invoice_paid,
                'invoice.payment_failed': self.handle_invoice_failed
            }
            
            handler = automation_mapping.get(event_type)
            if handler:
                result = handler(event_data)
                return {"status": "success", "event_type": event_type, "result": result}
            else:
                return {"status": "ignored", "event_type": event_type}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_hubspot_webhook(self, payload):
        """Process HubSpot webhook events"""
        try:
            contact_data = payload.get('contact', {})
            
            # Sync contact updates to Airtable
            airtable_sync = self.sync_hubspot_to_airtable(contact_data)
            
            # Check for lead qualification changes
            qualification_check = self.check_lead_qualification_update(contact_data)
            
            # Update internal CRM records
            crm_update = self.update_internal_crm(contact_data)
            
            # Trigger automation workflows
            workflow_triggers = self.trigger_hubspot_workflows(contact_data)
            
            return {
                "status": "success",
                "contact_id": contact_data.get('id'),
                "airtable_synced": airtable_sync,
                "qualification_updated": qualification_check,
                "workflows_triggered": len(workflow_triggers)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_calendar_webhook(self, payload):
        """Process calendar booking webhook"""
        try:
            booking_data = payload.get('booking', {})
            customer_id = booking_data.get('customer_id')
            
            # Create calendar event
            calendar_event = self.create_calendar_event(booking_data)
            
            # Send confirmation email
            confirmation_sent = self.send_booking_confirmation(booking_data)
            
            # Update CRM with booking
            crm_update = self.update_crm_booking(booking_data)
            
            # Notify sales team
            sales_notification = self.notify_sales_team_booking(booking_data)
            
            return {
                "status": "success",
                "booking_id": booking_data.get('id'),
                "calendar_created": calendar_event,
                "confirmation_sent": confirmation_sent,
                "crm_updated": crm_update,
                "actions_completed": 4
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_usage_webhook(self, payload):
        """Process usage threshold webhook"""
        try:
            usage_data = payload.get('usage', {})
            customer_id = usage_data.get('customer_id')
            threshold_type = usage_data.get('threshold_type')
            
            # Determine appropriate action
            if threshold_type == "approaching_limit":
                notification_sent = self.send_usage_warning(customer_id, usage_data)
                account_manager_alert = self.alert_account_manager(customer_id, usage_data)
            elif threshold_type == "limit_exceeded":
                overage_notification = self.send_overage_notification(customer_id, usage_data)
                billing_adjustment = self.process_overage_billing(customer_id, usage_data)
            elif threshold_type == "upgrade_opportunity":
                upgrade_offer = self.send_upgrade_offer(customer_id, usage_data)
                sales_alert = self.alert_sales_team(customer_id, usage_data)
            
            # Log usage analytics
            usage_log = self.log_usage_analytics(usage_data)
            
            return {
                "status": "success",
                "customer_id": customer_id,
                "threshold_type": threshold_type,
                "actions_completed": 3
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def calculate_lead_score(self, lead_data):
        """Calculate comprehensive lead score"""
        score = 0
        scoring_rules = self.automation_rules["lead_automation"]["scoring_criteria"]
        
        # Company size scoring
        company_size = lead_data.get('company_size', 'other')
        score += scoring_rules["company_size"].get(company_size, 0)
        
        # Industry scoring
        industry = lead_data.get('industry', 'other')
        score += scoring_rules["industry"].get(industry, 0)
        
        # Role scoring
        role = lead_data.get('role', 'other')
        score += scoring_rules["role"].get(role, 0)
        
        # Engagement scoring
        engagement_actions = lead_data.get('engagement_actions', [])
        for action in engagement_actions:
            score += scoring_rules["engagement"].get(action, 0)
        
        return min(score, 100)  # Cap at 100

    def auto_assign_sales_rep(self, lead_data, score):
        """Auto-assign sales representative based on criteria"""
        if score >= 80:
            return "senior_sales_rep"
        elif score >= 60:
            return "mid_level_rep"
        else:
            return "junior_rep"

    def check_escalation_triggers(self, ticket_data):
        """Check if support ticket should be escalated"""
        escalation_triggers = self.automation_rules["support_automation"]["escalation_triggers"]
        
        sentiment = ticket_data.get('sentiment', 'neutral')
        if sentiment in ['negative', 'angry', 'frustrated']:
            return True
            
        content = ticket_data.get('content', '').lower()
        keywords = ['cancel', 'refund', 'lawsuit', 'terrible', 'worst']
        if any(keyword in content for keyword in keywords):
            return True
            
        customer_tier = ticket_data.get('customer_tier', 'standard')
        if customer_tier == 'vip':
            return True
            
        return False

    def setup_automation_monitoring(self):
        """Setup monitoring for all automation processes"""
        monitoring_config = {
            "webhook_success_rate": self.monitor_webhook_success_rate,
            "automation_latency": self.monitor_automation_latency,
            "error_tracking": self.track_automation_errors,
            "throughput_monitoring": self.monitor_automation_throughput
        }
        return monitoring_config

def create_webhook_routes():
    """Create Express routes for all webhook endpoints"""
    webhook_routes = """
    // Comprehensive webhook automation routes
    app.post('/webhook/lead-capture', async (req, res) => {
        try {
            const result = await processWebhookAutomation('lead-capture', req.body);
            res.json(result);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    });

    app.post('/webhook/support-ticket', async (req, res) => {
        try {
            const result = await processWebhookAutomation('support-ticket', req.body);
            res.json(result);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    });

    app.post('/webhook/payment-completed', async (req, res) => {
        try {
            const result = await processWebhookAutomation('payment-completed', req.body);
            res.json(result);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    });

    app.post('/webhook/stripe-event', async (req, res) => {
        try {
            const result = await processWebhookAutomation('stripe-event', req.body);
            res.json(result);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    });

    async function processWebhookAutomation(type, payload) {
        return new Promise((resolve, reject) => {
            exec(`python3 automation_webhook_manager.py ${type} '${JSON.stringify(payload)}'`, 
                (error, stdout, stderr) => {
                    if (error) reject(new Error(stderr));
                    else resolve(JSON.parse(stdout));
                });
        });
    }
    """
    return webhook_routes

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) >= 3:
        webhook_type = sys.argv[1]
        payload = json.loads(sys.argv[2])
        
        manager = WebhookAutomationManager()
        
        webhook_handlers = {
            'lead-capture': manager.process_lead_webhook,
            'support-ticket': manager.process_support_webhook,
            'payment-completed': manager.process_payment_webhook,
            'stripe-event': manager.process_stripe_webhook,
            'hubspot-contact': manager.process_hubspot_webhook,
            'usage-threshold': manager.process_usage_webhook
        }
        
        handler = webhook_handlers.get(webhook_type)
        if handler:
            result = handler(payload)
            print(json.dumps(result))
        else:
            print(json.dumps({"status": "error", "message": "Unknown webhook type"}))
    else:
        print(json.dumps({"status": "error", "message": "Invalid arguments"}))