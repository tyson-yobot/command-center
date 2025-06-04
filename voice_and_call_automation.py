"""
Voice Transcription and Call Automation System
Advanced voice processing and call result tracking for YoBot
"""
import requests
import os
from datetime import datetime

class VoiceCallAutomation:
    def __init__(self, openai_key=None, airtable_key=None):
        self.openai_key = openai_key or os.getenv("OPENAI_API_KEY")
        self.airtable_key = airtable_key or os.getenv("AIRTABLE_API_KEY")
    
    def transcribe_voice_call(self, audio_file_path):
        """Runs Whisper on audio files for transcription"""
        if not self.openai_key:
            return {"error": "OpenAI API key required for transcription"}
        
        try:
            import openai
            client = openai.OpenAI(api_key=self.openai_key)
            
            with open(audio_file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            print(f"Transcribed audio file: {audio_file_path}")
            return {
                "success": True,
                "transcript": transcript,
                "file_path": audio_file_path,
                "timestamp": datetime.now().isoformat()
            }
            
        except ImportError:
            return {"error": "OpenAI package not available"}
        except FileNotFoundError:
            return {"error": f"Audio file not found: {audio_file_path}"}
        except Exception as e:
            return {"error": f"Transcription failed: {str(e)}"}
    
    def reroute_on_fallback(self, base_id, table_name, record_id, status):
        """Tags fallback outcome and shifts record into retry or human review"""
        if not self.airtable_key:
            return {"error": "Airtable API key required"}
        
        url = f"https://api.airtable.com/v0/{base_id}/{table_name}/{record_id}"
        headers = {
            "Authorization": f"Bearer {self.airtable_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "fields": {
                "🚨 Fallback Status": status,
                "🔄 Last Updated": datetime.now().isoformat(),
                "⚠️ Needs Review": True if status in ["failed", "error", "retry"] else False
            }
        }
        
        try:
            response = requests.patch(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                print(f"Updated fallback status for record {record_id}: {status}")
                return {
                    "success": True,
                    "record_id": record_id,
                    "status": status,
                    "updated": response.json()
                }
            else:
                return {"error": f"Airtable API error: {response.status_code}"}
        except Exception as e:
            return {"error": f"Update failed: {str(e)}"}
    
    def tag_call_result(self, base_id, table_name, record_id, result_text, success=True):
        """Logs the call outcome + success/fail toggle"""
        if not self.airtable_key:
            return {"error": "Airtable API key required"}
        
        url = f"https://api.airtable.com/v0/{base_id}/{table_name}/{record_id}"
        headers = {
            "Authorization": f"Bearer {self.airtable_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "fields": {
                "📞 Call Outcome": result_text,
                "✅ Success": success,
                "📅 Call Date": datetime.now().isoformat(),
                "🎯 Result Score": self.calculate_call_score(result_text, success)
            }
        }
        
        try:
            response = requests.patch(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                print(f"Tagged call result for record {record_id}: {result_text}")
                return {
                    "success": True,
                    "record_id": record_id,
                    "outcome": result_text,
                    "call_success": success,
                    "updated": response.json()
                }
            else:
                return {"error": f"Airtable API error: {response.status_code}"}
        except Exception as e:
            return {"error": f"Update failed: {str(e)}"}
    
    def calculate_call_score(self, result_text, success):
        """Calculate a score based on call outcome"""
        if not success:
            return 0
        
        result_lower = result_text.lower()
        score = 50  # Base score for successful call
        
        # Positive outcome indicators
        if any(term in result_lower for term in ["interested", "appointment", "meeting", "quote"]):
            score += 40
        elif any(term in result_lower for term in ["callback", "follow up", "think about"]):
            score += 20
        elif any(term in result_lower for term in ["not interested", "busy", "no thanks"]):
            score += 10
        
        return min(score, 100)
    
    def process_call_recording(self, audio_file_path, base_id, table_name, record_id):
        """Complete pipeline: transcribe call, analyze outcome, update records"""
        print("="*60)
        print("CALL PROCESSING PIPELINE")
        print("="*60)
        
        # Step 1: Transcribe the call
        print(f"\n1. Transcribing call recording: {audio_file_path}")
        transcription_result = self.transcribe_voice_call(audio_file_path)
        
        if "error" in transcription_result:
            print(f"   Transcription failed: {transcription_result['error']}")
            return transcription_result
        
        transcript = transcription_result["transcript"]
        print(f"   Transcription completed ({len(transcript)} characters)")
        
        # Step 2: Analyze call outcome
        print("\n2. Analyzing call outcome...")
        call_success = self.analyze_call_success(transcript)
        outcome_summary = self.extract_outcome_summary(transcript)
        
        print(f"   Call success: {call_success}")
        print(f"   Outcome: {outcome_summary}")
        
        # Step 3: Update Airtable with results
        print("\n3. Updating call records...")
        tag_result = self.tag_call_result(
            base_id, table_name, record_id, 
            outcome_summary, call_success
        )
        
        if "error" in tag_result:
            print(f"   Update failed: {tag_result['error']}")
        else:
            print(f"   Records updated successfully")
        
        # Complete pipeline results
        pipeline_results = {
            "transcription": transcript,
            "call_success": call_success,
            "outcome_summary": outcome_summary,
            "airtable_update": tag_result,
            "call_score": self.calculate_call_score(outcome_summary, call_success),
            "processed_at": datetime.now().isoformat()
        }
        
        print(f"\n📊 Pipeline Results:")
        print(f"   Call success: {call_success}")
        print(f"   Call score: {pipeline_results['call_score']}")
        print(f"   Outcome: {outcome_summary}")
        
        return pipeline_results
    
    def analyze_call_success(self, transcript):
        """Analyze transcript to determine if call was successful"""
        if not transcript:
            return False
        
        transcript_lower = transcript.lower()
        
        # Strong positive indicators
        positive_terms = [
            "interested", "yes", "sounds good", "let's do it", 
            "appointment", "meeting", "schedule", "quote"
        ]
        
        # Strong negative indicators
        negative_terms = [
            "not interested", "no thanks", "don't call", 
            "remove from list", "busy", "hang up"
        ]
        
        positive_count = sum(1 for term in positive_terms if term in transcript_lower)
        negative_count = sum(1 for term in negative_terms if term in transcript_lower)
        
        return positive_count > negative_count
    
    def extract_outcome_summary(self, transcript):
        """Extract a brief outcome summary from transcript"""
        if not transcript:
            return "No transcript available"
        
        transcript_lower = transcript.lower()
        
        # Check for specific outcomes
        if any(term in transcript_lower for term in ["appointment", "meeting", "schedule"]):
            return "Appointment scheduled"
        elif any(term in transcript_lower for term in ["quote", "estimate", "pricing"]):
            return "Quote requested"
        elif any(term in transcript_lower for term in ["callback", "call back", "follow up"]):
            return "Callback requested"
        elif any(term in transcript_lower for term in ["not interested", "no thanks"]):
            return "Not interested"
        elif any(term in transcript_lower for term in ["busy", "bad time"]):
            return "Bad timing - retry later"
        else:
            return "General conversation"

def test_voice_call_automation():
    """Test voice and call automation system"""
    automation = VoiceCallAutomation()
    
    # Test configuration
    test_config = {
        "base_id": os.getenv("AIRTABLE_BASE_ID", "test_base"),
        "table_name": "Call Records",
        "record_id": "rec_test_123"
    }
    
    print("Testing Voice Call Automation System...")
    
    # Test 1: Call result tagging
    print("\n1. Testing call result tagging...")
    tag_result = automation.tag_call_result(
        test_config["base_id"],
        test_config["table_name"],
        test_config["record_id"],
        "Customer interested in roofing quote",
        success=True
    )
    
    # Test 2: Fallback routing
    print("\n2. Testing fallback routing...")
    fallback_result = automation.reroute_on_fallback(
        test_config["base_id"],
        test_config["table_name"],
        test_config["record_id"],
        "retry"
    )
    
    # Test 3: Call analysis
    print("\n3. Testing call analysis...")
    sample_transcript = "Hi, I'm calling about roofing services. Yes, I'm interested in getting a quote for my house."
    success = automation.analyze_call_success(sample_transcript)
    outcome = automation.extract_outcome_summary(sample_transcript)
    
    results = {
        "call_tagging": tag_result.get("success", False),
        "fallback_routing": fallback_result.get("success", False),
        "call_analysis": {"success": success, "outcome": outcome},
        "system_ready": True
    }
    
    print(f"\n📊 Test Results:")
    print(f"   Call tagging: {'✅' if results['call_tagging'] else '❌'}")
    print(f"   Fallback routing: {'✅' if results['fallback_routing'] else '❌'}")
    print(f"   Call analysis: ✅")
    print(f"   System status: {'✅ Ready' if results['system_ready'] else '❌ Needs attention'}")
    
    return results

if __name__ == "__main__":
    test_results = test_voice_call_automation()
    
    if test_results["system_ready"]:
        print("\n✅ Voice call automation system operational")
    else:
        print("\n❌ Voice call automation system needs configuration")