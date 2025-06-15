from flask import Flask
import os

app = Flask(__name__)

@app.route("/")
def run_live():
    os.system("python3 Function\\ Library\\ Cleaned.py")
    return "✅ Live mode executed", 200

@app.route("/test")
def run_test():
    os.system("python3 Function\\ Library\\ Cleaned.py test")
    return "🧪 Test mode executed", 200

app.run(host="0.0.0.0", port=8080)
