"""
PhantomBuster Scheduler
Automated lead generation runs at scheduled intervals
"""
import schedule
import time
import os
from phantombuster_request_module import launch_phantom
from airtable_test_logger import log_test_to_airtable

# Configuration
PHANTOM_AGENT_ID = os.getenv('PHANTOM_AGENT_ID', 'your_agent_id_here')

def scheduled_run():
    """Execute scheduled PhantomBuster run"""
    print("⏰ Scheduled Phantom Run Triggered")
    
    try:
        result = launch_phantom(PHANTOM_AGENT_ID)
        if result:
            log_test_to_airtable(
                "Scheduled PhantomBuster Run", 
                True, 
                f"Automated lead generation run executed successfully at {time.strftime('%H:%M:%S')}", 
                "Lead Generation"
            )
            print(f"✅ Phantom agent {PHANTOM_AGENT_ID} launched successfully")
        else:
            log_test_to_airtable(
                "Scheduled PhantomBuster Run", 
                False, 
                f"Failed to launch phantom agent {PHANTOM_AGENT_ID}", 
                "Lead Generation"
            )
            print(f"❌ Failed to launch phantom agent {PHANTOM_AGENT_ID}")
    except Exception as e:
        log_test_to_airtable(
            "Scheduled PhantomBuster Run", 
            False, 
            f"Scheduler error: {str(e)}", 
            "Lead Generation"
        )
        print(f"❌ Scheduler error: {str(e)}")

def test_scheduler():
    """Test the scheduler functionality"""
    print("Testing PhantomBuster Scheduler...")
    scheduled_run()

# Schedule runs every day at 8AM and 2PM
schedule.every().day.at("08:00").do(scheduled_run)
schedule.every().day.at("14:00").do(scheduled_run)

# Optional: Add more frequent runs for testing
# schedule.every(30).minutes.do(scheduled_run)  # Every 30 minutes for testing

def run_scheduler():
    """Main scheduler loop"""
    print("🚀 PhantomBuster Scheduler Started")
    print("📅 Scheduled runs: 08:00 and 14:00 daily")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    # For testing, run once immediately
    test_scheduler()
    
    # Uncomment to run the continuous scheduler
    # run_scheduler()