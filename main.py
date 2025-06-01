from zendesk_auto_close import auto_close_solved_tickets

def job():
    """
    Main automation job that runs the Zendesk auto-close process
    """
    print("🔄 Starting Zendesk Auto-Close Engine...")
    try:
        auto_close_solved_tickets()
        print("✅ Zendesk auto-close engine completed successfully")
    except Exception as e:
        print(f"❌ Zendesk auto-close engine failed: {e}")

if __name__ == "__main__":
    print("🔄 Starting Zendesk Auto-Close Engine...")
    job()