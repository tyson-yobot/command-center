"""
Launch Test Operations
Complete automated testing pipeline with execution, verification, and archival
"""

from batch_runner import run_all_batches
from archive_results import archive_audit, cleanup_old_archives
from airtable_test_logger import log_test_to_airtable
from datetime import datetime

def launch_complete_test_cycle():
    """Execute complete test operations cycle"""
    
    print("🚀 YoBot Enterprise Test Operations Launch")
    print("=" * 60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Phase 1: Execute all test batches
    print("\n📋 Phase 1: Executing All Test Batches")
    batch_success = run_all_batches()
    
    if batch_success:
        print("✅ Phase 1 Complete: All batches executed successfully")
    else:
        print("⚠️ Phase 1 Complete: Some batches had issues")
    
    # Phase 2: Archive results
    print("\n📦 Phase 2: Archiving Test Results")
    archive_success = archive_audit()
    
    if archive_success:
        print("✅ Phase 2 Complete: Test archive created")
    else:
        print("⚠️ Phase 2 Complete: Archive creation had issues")
    
    # Phase 3: Cleanup old archives
    print("\n🧹 Phase 3: Cleaning Up Old Archives")
    cleanup_count = cleanup_old_archives(days_to_keep=30)
    print(f"✅ Phase 3 Complete: {cleanup_count} old archives cleaned")
    
    # Final status
    print("\n" + "=" * 60)
    print("🏁 TEST OPERATIONS CYCLE COMPLETE")
    print("=" * 60)
    
    overall_success = batch_success and archive_success
    
    if overall_success:
        print("✅ STATUS: ALL OPERATIONS SUCCESSFUL")
        print("✅ System validated and ready for production")
    else:
        print("⚠️ STATUS: SOME OPERATIONS HAD ISSUES")
        print("⚠️ Review logs before production deployment")
    
    # Log final operations status
    log_test_to_airtable(
        name="Complete Test Operations Cycle",
        status="OPERATIONS_COMPLETE",
        notes=f"Full test cycle executed. Batch success: {batch_success}, Archive success: {archive_success}",
        module_type="Test Operations",
        link="https://yobot-command-center.com/operations",
        output_data=f"Operations cycle: {'SUCCESS' if overall_success else 'PARTIAL'}",
        record_created=True,
        retry_attempted=False
    )
    
    print(f"✅ Operations status logged to integration tracking")
    print(f"📊 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return overall_success

if __name__ == "__main__":
    success = launch_complete_test_cycle()
    
    if success:
        print("\n🎉 YoBot Enterprise System: Production Ready")
        exit(0)
    else:
        print("\n⚠️ Review operations logs before deployment")
        exit(1)