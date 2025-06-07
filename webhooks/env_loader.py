import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """YoBot configuration management"""
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY") 
    SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
    AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
    
    # Airtable Configuration
    AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
    TICKET_LOG_TABLE = "tblQPr9cHyNZDpipS"
    ERROR_LOG_TABLE = "tblo1ESkt9ybkvaJH"
    
    # Slack Configuration
    SLACK_CHANNEL = "#support-queue"
    
    # Voice Generation
    VOICE_ID = "cjVigY5qzO86Huf0OWal"
    OUTPUT_PATH = "./uploads/test_yobot_voice.mp3"
    
    # File Size Limits
    MAX_MP3_SIZE_MB = 10
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present"""
        required_keys = [
            'OPENAI_API_KEY',
            'ELEVENLABS_API_KEY', 
            'SLACK_BOT_TOKEN',
            'AIRTABLE_API_KEY',
            'AIRTABLE_BASE_ID'
        ]
        
        missing_keys = []
        for key in required_keys:
            if not getattr(cls, key):
                missing_keys.append(key)
        
        if missing_keys:
            print(f"Missing required configuration: {', '.join(missing_keys)}")
            return False
        
        print("Configuration validation successful")
        return True
    
    @classmethod
    def get_file_size_mb(cls, file_path):
        """Get file size in MB"""
        if os.path.exists(file_path):
            size_bytes = os.path.getsize(file_path)
            return size_bytes / (1024 * 1024)
        return 0
    
    @classmethod
    def check_mp3_size(cls, file_path):
        """Check if MP3 file exceeds size limit"""
        size_mb = cls.get_file_size_mb(file_path)
        if size_mb > cls.MAX_MP3_SIZE_MB:
            print(f"Warning: MP3 file ({size_mb:.2f}MB) exceeds {cls.MAX_MP3_SIZE_MB}MB limit")
            return False
        return True

if __name__ == "__main__":
    Config.validate_config()