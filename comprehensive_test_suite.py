"""
Comprehensive Test Suite for YoBot Systems
Tests webhook retry logic, OpenAI fallback, and PhantomBuster integration
"""
import requests
import time
from openai_fallback_handler import handle_openai_call
from phantom_handler import test_lead_processing_system
from phantombuster_request_module import test_phantombuster_system

def test_webhook_retry_logic():
    """Test webhook retry functionality"""
    print("Testing Webhook Retry Logic...")
    
    # Test successful webhook
    try:
        response = requests.post("http://localhost:5000/api/chat", 
                               json={"message": "Test webhook", "name": "Test User", "email": "test@example.com"},
                               timeout=10)
        if response.status_code == 200:
            print("✅ Webhook successful on first attempt")
            return True
        else:
            print(f"❌ Webhook failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Webhook test failed: {str(e)}")
        return False

def test_openai_fallback_system():
    """Test OpenAI fallback responses"""
    print("Testing OpenAI Fallback System...")
    
    try:
        # Test general agent
        response = handle_openai_call("What is YoBot?", "general")
        print(f"✅ General Agent Response: {response[:100]}...")
        
        # Test support agent
        response = handle_openai_call("I need help with my account", "support")
        print(f"✅ Support Agent Response: {response[:100]}...")
        
        # Test sales agent
        response = handle_openai_call("Tell me about pricing", "sales")
        print(f"✅ Sales Agent Response: {response[:100]}...")
        
        return True
    except Exception as e:
        print(f"❌ OpenAI fallback test failed: {str(e)}")
        return False

def test_phantombuster_integration():
    """Test PhantomBuster API integration"""
    print("Testing PhantomBuster Integration...")
    
    try:
        result = test_phantombuster_system()
        return result
    except Exception as e:
        print(f"❌ PhantomBuster test failed: {str(e)}")
        return False

def test_lead_processing_pipeline():
    """Test complete lead processing pipeline"""
    print("Testing Lead Processing Pipeline...")
    
    try:
        result = test_lead_processing_system()
        return result
    except Exception as e:
        print(f"❌ Lead processing test failed: {str(e)}")
        return False

def run_comprehensive_test_suite():
    """Run all tests and provide summary"""
    print("=" * 60)
    print("YoBot Comprehensive Test Suite")
    print("=" * 60)
    
    test_results = {
        "webhook_retry": test_webhook_retry_logic(),
        "openai_fallback": test_openai_fallback_system(),
        "phantombuster": test_phantombuster_integration(),
        "lead_processing": test_lead_processing_pipeline()
    }
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All systems operational!")
    else:
        print("⚠️  Some systems need attention")
    
    return test_results

if __name__ == "__main__":
    run_comprehensive_test_suite()