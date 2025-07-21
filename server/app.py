"""
app.py - Main application file for YoBot Command Center server
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'logs', 'server.log'), mode='a')
    ]
)

logger = logging.getLogger("yobot.app")

def create_app():
    """Create and configure the Flask application."""
    # Create Flask app
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Load configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-key-change-in-production'),
        ENV=os.environ.get('FLASK_ENV', 'production'),
    )
    
    # Ensure required environment variables are set
    required_env_vars = [
        "AIRTABLE_API_KEY",
        "AIRTABLE_BASE_ID",
        "SLACK_WEBHOOK_URL",
    ]
    
    missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        if app.config['ENV'] == 'production':
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Create logs directory if it doesn't exist
    os.makedirs(os.path.join(os.path.dirname(__file__), 'logs'), exist_ok=True)
    
    # Initialize authentication
    from auth import init_auth
    init_auth(app)
    
    # Register blueprints
    from routes.generate_quote import bp as quote_bp
    app.register_blueprint(quote_bp)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy"})
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        logger.error(f"Server error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
    logger.info("Application initialized")
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    
    app.run(host='0.0.0.0', port=port, debug=debug)