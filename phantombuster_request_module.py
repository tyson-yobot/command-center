"""
PhantomBuster Request Module - Reusable API Functions
Handles agent launching, monitoring, and data extraction
"""
import requests
import os
from airtable_test_logger import log_test_to_airtable

PHANTOMBUSTER_API_KEY = os.getenv('PHANTOMBUSTER_API_KEY')

def launch_phantom(agent_id):
    """Launch a PhantomBuster agent"""
    url = f"https://api.phantombuster.com/api/v2/agents/launch"
    headers = {
        "X-Phantombuster-Key-1": PHANTOMBUSTER_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "id": agent_id,
        "output": "first-result-object"  # or full format
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        log_test_to_airtable("PhantomBuster Launch", True, f"Agent ID: {agent_id}", "Lead Generation")
        return response.json()
    else:
        log_test_to_airtable("PhantomBuster Launch", False, f"{response.text}", "Lead Generation")
        return None

def get_phantom_agents():
    """Get list of available PhantomBuster agents"""
    url = "https://api.phantombuster.com/api/v2/agents"
    headers = {
        "X-Phantombuster-Key-1": PHANTOMBUSTER_API_KEY,
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        agents = response.json()
        log_test_to_airtable("PhantomBuster Agents", True, f"Found {len(agents)} agents", "Lead Generation")
        return agents
    else:
        log_test_to_airtable("PhantomBuster Agents", False, f"{response.text}", "Lead Generation")
        return []

def get_phantom_results(agent_id):
    """Get results from a completed PhantomBuster agent"""
    url = f"https://api.phantombuster.com/api/v2/agents/output?id={agent_id}"
    headers = {
        "X-Phantombuster-Key-1": PHANTOMBUSTER_API_KEY,
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        results = response.json()
        log_test_to_airtable("PhantomBuster Results", True, f"Retrieved results for agent {agent_id}", "Lead Generation")
        return results
    else:
        log_test_to_airtable("PhantomBuster Results", False, f"{response.text}", "Lead Generation")
        return None

def test_phantombuster_system():
    """Test complete PhantomBuster integration"""
    print("Testing PhantomBuster Request Module...")
    
    # Test 1: Get available agents
    agents = get_phantom_agents()
    if agents:
        print(f"✅ Found {len(agents)} PhantomBuster agents")
        
        # Test 2: Launch first agent (if available)
        if len(agents) > 0:
            first_agent = agents[0]
            agent_id = first_agent.get('id')
            if agent_id:
                print(f"Launching agent: {agent_id}")
                result = launch_phantom(agent_id)
                if result:
                    print(f"✅ Agent launched successfully: {result}")
                else:
                    print("❌ Failed to launch agent")
            else:
                print("No agent ID found")
        else:
            print("No agents available for testing")
    else:
        print("❌ Failed to retrieve agents")

if __name__ == "__main__":
    test_phantombuster_system()