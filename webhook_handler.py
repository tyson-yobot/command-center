from flask import Flask, request, jsonify
import stripe
import os
from stripe_to_qbo_invoice import create_qbo_invoice
from airtable_logger import log_sales_event

app = Flask(__name__)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@app.route("/stripe-webhook", methods=["POST"])
def stripe_webhook():
    """
    Handle Stripe webhook events for payment processing
    """
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        if not sig_header or not endpoint_secret:
            return jsonify(success=False, error="Missing signature or secret"), 400
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception as e:
        print("Webhook signature verification failed:", e)
        return jsonify(success=False, error="Invalid signature"), 400

    # Handle payment success
    if event['type'] == 'payment_intent.succeeded':
        data = event['data']['object']
        amount = data['amount_received'] / 100  # Convert from cents
        customer = data['charges']['data'][0]['billing_details']['name']
        description = data['description'] or "YoBot Service Payment"
        sales_order_id = data['metadata'].get('sales_order_id', '')

        try:
            # Create QBO invoice (will work when token is active)
            invoice = create_qbo_invoice(customer, amount, description)
            qbo_status = "Created"
        except Exception as qbo_error:
            print(f"QBO invoice creation pending: {qbo_error}")
            qbo_status = "Pending Token"

        # Log to Airtable
        log_sales_event(
            event_type="💳 Stripe Payment Received", 
            sales_order_id=sales_order_id, 
            source_id=data['id'], 
            amount=amount, 
            notes=f"Auto-logged via webhook - QBO: {qbo_status}"
        )

        print(f"✅ Payment processed: ${amount} from {customer}")

    # Handle invoice payment success
    elif event['type'] == 'invoice.payment_succeeded':
        data = event['data']['object']
        amount = data['amount_paid'] / 100
        customer_id = data['customer']
        
        log_sales_event(
            event_type="🧾 Invoice Payment",
            sales_order_id=data['id'],
            source_id=data['id'],
            amount=amount,
            notes=f"Invoice payment succeeded - Customer: {customer_id}"
        )

    return jsonify(success=True), 200

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(status="healthy", service="stripe-webhook-handler")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)