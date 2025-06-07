import schedule
import time
from zendesk_auto_close import auto_close_solved_tickets

def job():
    """
    Main automation job that runs the Zendesk auto-close process
    """
    print("🔄 Running scheduled Zendesk auto-close job...")
    try:
        auto_close_solved_tickets()
        print("✅ Zendesk auto-close job completed successfully")
    except Exception as e:
        print(f"❌ Zendesk auto-close job failed: {e}")

# Schedule the job to run daily at 2 AM UTC
schedule.every().day.at("02:00").do(job)

# Also allow running every 4 hours for more frequent processing
# schedule.every(4).hours.do(job)

def run_scheduler():
    """
    Run the scheduler continuously
    """
    print("📅 Zendesk Auto-Close Scheduler started")
    print("🕐 Scheduled to run daily at 2:00 AM UTC")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    run_scheduler()