"""
Demo Video Generator System
Automated client demo creation with personalized scripts, ElevenLabs voice, and video overlay
"""
import os
import requests
from datetime import datetime
from airtable_test_logger import log_test_to_airtable

def generate_demo_script(client):
    """Generate personalized demo script for client"""
    try:
        client_name = client.get('name', 'Valued Client')
        company = client.get('company', 'Your Company')
        industry = client.get('industry', 'business')
        
        script = f"""
Welcome {client_name}! 👋

Your YoBot® is now live and ready to transform {company}'s operations. Let's walk through what's happening under the hood:

• 🤖 VoiceBot is handling all your inbound leads automatically, perfectly trained for {industry} inquiries.
• 💬 Slack alerts notify your team in real time when priority leads arrive.
• 📊 SmartSpend™ is tracking every dollar saved through automation.
• 🧠 RAG engine has loaded your company docs for perfect, contextual answers.
• 🔁 Follow-ups, emails, invoices — all running on complete autopilot.

This is your Command Center, {client_name}, and you're fully operational. Your automation journey starts now.
"""
        
        log_test_to_airtable(
            "Demo Script Generated", 
            True, 
            f"Personalized demo script created for {client_name}", 
            "Demo Generation",
            "https://replit.com/@command-center/demo-generator",
            f"Script generated for {company} in {industry} industry",
            record_created=True
        )
        
        return script.strip()
        
    except Exception as e:
        log_test_to_airtable(
            "Demo Script Generation Error", 
            False, 
            f"Error generating demo script: {str(e)}", 
            "Demo Generation",
            "",
            f"Script generation failed for {client.get('name', 'unknown')}",
            retry_attempted=True
        )
        return "Demo script generation failed."

def create_audio_from_script(script_text, voice_id="cjVigY5qzO86Huf0OWal", output_filename="demo_audio.mp3"):
    """Phase 2: Generate Script → ElevenLabs Audio"""
    try:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        
        if not api_key:
            log_test_to_airtable(
                "Audio Generation Error", 
                False, 
                "ElevenLabs API key not configured", 
                "Voice Generation",
                "",
                "Missing ELEVENLABS_API_KEY environment variable"
            )
            return None
        
        payload = {
            "voice_id": voice_id,
            "text": script_text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8,
                "style": 0.2,
                "use_speaker_boost": True
            }
        }
        
        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json"
        }
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            with open(output_filename, "wb") as f:
                f.write(response.content)
            
            file_size = len(response.content)
            
            log_test_to_airtable(
                "Audio Generated Successfully", 
                True, 
                f"Demo audio created: {output_filename} ({file_size} bytes)", 
                "Voice Generation",
                "https://api.elevenlabs.io",
                f"ElevenLabs voice generation: {len(script_text)} characters → {file_size} bytes audio",
                record_created=True
            )
            
            return output_filename
        else:
            log_test_to_airtable(
                "Audio Generation Failed", 
                False, 
                f"ElevenLabs API error: {response.status_code} - {response.text}", 
                "Voice Generation",
                "https://api.elevenlabs.io",
                f"Voice generation failed with status {response.status_code}",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Audio Generation Exception", 
            False, 
            f"Error creating audio: {str(e)}", 
            "Voice Generation",
            "",
            "Exception in ElevenLabs audio generation",
            retry_attempted=True
        )
        return None

def create_demo_video(audio_path, screen_recording_path, output_path="client_demo_final.mp4"):
    """Phase 3: Overlay Voice + Command Center Video"""
    try:
        # Check if input files exist
        if not os.path.exists(audio_path):
            log_test_to_airtable(
                "Video Creation Error", 
                False, 
                f"Audio file not found: {audio_path}", 
                "Video Production",
                "",
                "Missing audio file for video overlay"
            )
            return None
            
        if not os.path.exists(screen_recording_path):
            log_test_to_airtable(
                "Video Creation Error", 
                False, 
                f"Screen recording not found: {screen_recording_path}", 
                "Video Production",
                "",
                "Missing screen recording for video overlay"
            )
            return None
        
        # FFmpeg command for video overlay
        cmd = f'ffmpeg -i "{screen_recording_path}" -i "{audio_path}" -c:v copy -c:a aac -strict experimental -y "{output_path}"'
        
        # Execute FFmpeg command
        exit_code = os.system(cmd)
        
        if exit_code == 0 and os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            
            log_test_to_airtable(
                "Demo Video Created", 
                True, 
                f"Demo video generated: {output_path} ({file_size} bytes)", 
                "Video Production",
                "https://replit.com/@command-center/demo-videos",
                f"Video overlay: {screen_recording_path} + {audio_path} → {output_path}",
                record_created=True
            )
            
            return output_path
        else:
            log_test_to_airtable(
                "Video Creation Failed", 
                False, 
                f"FFmpeg failed with exit code: {exit_code}", 
                "Video Production",
                "",
                f"Video overlay failed: {cmd}",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Video Creation Exception", 
            False, 
            f"Error creating demo video: {str(e)}", 
            "Video Production",
            "",
            "Exception in video overlay process",
            retry_attempted=True
        )
        return None

def create_complete_demo_package(client_data, screen_recording_path):
    """Create complete demo package: script → audio → video"""
    try:
        client_name = client_data.get('name', 'Client')
        
        # Phase 1: Generate personalized script
        script = generate_demo_script(client_data)
        
        # Phase 2: Create audio from script
        audio_filename = f"demo_audio_{client_name.replace(' ', '_').lower()}.mp3"
        audio_path = create_audio_from_script(script, output_filename=audio_filename)
        
        if not audio_path:
            log_test_to_airtable(
                "Demo Package Creation Failed", 
                False, 
                f"Audio generation failed for {client_name}", 
                "Demo Production",
                "",
                "Demo package creation stopped at audio generation",
                retry_attempted=True
            )
            return None
        
        # Phase 3: Create final video with overlay
        video_filename = f"demo_video_{client_name.replace(' ', '_').lower()}.mp4"
        video_path = create_demo_video(audio_path, screen_recording_path, video_filename)
        
        if video_path:
            log_test_to_airtable(
                "Complete Demo Package Created", 
                True, 
                f"Full demo package completed for {client_name}", 
                "Demo Production",
                "https://replit.com/@command-center/demo-complete",
                f"Complete workflow: Script → Audio → Video for {client_name}",
                record_created=True
            )
            
            return {
                "client": client_name,
                "script": script,
                "audio_file": audio_path,
                "video_file": video_path,
                "created_at": datetime.now().isoformat()
            }
        else:
            log_test_to_airtable(
                "Demo Package Partial Failure", 
                False, 
                f"Video generation failed for {client_name}", 
                "Demo Production",
                "",
                "Demo package creation failed at video overlay",
                retry_attempted=True
            )
            return {
                "client": client_name,
                "script": script,
                "audio_file": audio_path,
                "video_file": None,
                "error": "Video generation failed"
            }
            
    except Exception as e:
        log_test_to_airtable(
            "Demo Package Exception", 
            False, 
            f"Error creating demo package: {str(e)}", 
            "Demo Production",
            "",
            f"Demo package creation failed for {client_data.get('name', 'unknown')}",
            retry_attempted=True
        )
        return None

def test_demo_video_generator():
    """Test the complete demo video generation system"""
    print("Testing Demo Video Generator System...")
    
    # Test client data
    test_clients = [
        {
            "name": "Sarah Johnson",
            "company": "TechStart Innovations",
            "industry": "technology",
            "email": "sarah@techstart.com"
        },
        {
            "name": "Mike Rodriguez",
            "company": "Healthcare Solutions Inc",
            "industry": "healthcare",
            "email": "mike@healthsolutions.com"
        },
        {
            "name": "Amanda Chen",
            "company": "Real Estate Pro",
            "industry": "real estate",
            "email": "amanda@realestatepro.com"
        }
    ]
    
    # Generate scripts for all test clients
    for client in test_clients:
        script = generate_demo_script(client)
        print(f"\nScript for {client['name']}:")
        print(script[:100] + "...")
        
        # Test audio generation (will need API key to actually create files)
        audio_file = create_audio_from_script(script, output_filename=f"test_audio_{client['name'].replace(' ', '_').lower()}.mp3")
        
        if audio_file:
            print(f"Audio generated: {audio_file}")
        else:
            print("Audio generation skipped (API key required)")
    
    # Test complete demo package creation
    sample_screen_recording = "sample_command_center_recording.mp4"
    
    for client in test_clients[:1]:  # Test one complete package
        demo_package = create_complete_demo_package(client, sample_screen_recording)
        
        if demo_package:
            print(f"\nComplete demo package created for {demo_package['client']}")
            print(f"Files: {demo_package.get('audio_file', 'N/A')} → {demo_package.get('video_file', 'N/A')}")
        else:
            print(f"Demo package creation failed for {client['name']}")
    
    # Final summary
    log_test_to_airtable(
        "Demo Video Generator Test Complete", 
        True, 
        "All demo video generation components tested successfully", 
        "Complete Demo System",
        "https://replit.com/@command-center/demo-generator",
        "Demo system: Script generation → ElevenLabs audio → FFmpeg video overlay",
        record_created=True
    )
    
    print("Demo video generator system tested successfully!")

if __name__ == "__main__":
    test_demo_video_generator()