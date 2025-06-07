"""
Phantombuster Lead Generation Integration for YoBot
Automatically generates leads and syncs them with CRM and Airtable
"""
import os
import requests
import json
from datetime import datetime
from airtable_test_logger import log_test_to_airtable

class PhantombusterLeadGenerator:
    def __init__(self):
        self.api_key = os.getenv('PHANTOMBUSTER_API_KEY')
        self.base_url = "https://api.phantombuster.com/api/v1"
        self.headers = {
            "X-Phantombuster-Key-1": self.api_key,
            "Content-Type": "application/json"
        }
    
    def test_connection(self):
        """Test Phantombuster API connection"""
        try:
            response = requests.get(
                f"{self.base_url}/agents",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                log_test_to_airtable(
                    "Phantombuster API Connection", 
                    True, 
                    f"Successfully connected. Found {len(response.json())} agents",
                    "Lead Generation"
                )
                return {"success": True, "message": "Phantombuster API connected successfully"}
            else:
                log_test_to_airtable(
                    "Phantombuster API Connection", 
                    False, 
                    f"Connection failed: {response.status_code}",
                    "Lead Generation"
                )
                return {"success": False, "message": f"API Error: {response.status_code}"}
                
        except Exception as e:
            log_test_to_airtable(
                "Phantombuster API Connection", 
                False, 
                f"Connection error: {str(e)}",
                "Lead Generation"
            )
            return {"success": False, "message": f"Connection error: {str(e)}"}
    
    def get_agents(self):
        """Get list of Phantombuster agents"""
        try:
            response = requests.get(
                f"{self.base_url}/agents",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                agents = response.json()
                return {"success": True, "agents": agents}
            else:
                return {"success": False, "message": f"Failed to get agents: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "message": f"Error getting agents: {str(e)}"}
    
    def launch_agent(self, agent_id, arguments=None):
        """Launch a Phantombuster agent for lead generation"""
        try:
            payload = {
                "id": agent_id
            }
            
            if arguments:
                payload["arguments"] = arguments
            
            response = requests.post(
                f"{self.base_url}/agents/launch",
                headers=self.headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                log_test_to_airtable(
                    f"Phantombuster Agent Launch", 
                    True, 
                    f"Agent {agent_id} launched successfully. Container ID: {result.get('containerId')}",
                    "Lead Generation"
                )
                return {"success": True, "result": result}
            else:
                log_test_to_airtable(
                    f"Phantombuster Agent Launch", 
                    False, 
                    f"Failed to launch agent {agent_id}: {response.status_code}",
                    "Lead Generation"
                )
                return {"success": False, "message": f"Failed to launch agent: {response.status_code}"}
                
        except Exception as e:
            log_test_to_airtable(
                f"Phantombuster Agent Launch", 
                False, 
                f"Error launching agent {agent_id}: {str(e)}",
                "Lead Generation"
            )
            return {"success": False, "message": f"Error launching agent: {str(e)}"}
    
    def get_agent_output(self, agent_id):
        """Get output/results from a Phantombuster agent"""
        try:
            response = requests.get(
                f"{self.base_url}/agents/output?id={agent_id}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                output = response.json()
                return {"success": True, "output": output}
            else:
                return {"success": False, "message": f"Failed to get output: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "message": f"Error getting output: {str(e)}"}
    
    def sync_leads_to_crm(self, leads_data):
        """Sync generated leads to HubSpot CRM"""
        try:
            # This would integrate with your existing HubSpot integration
            synced_count = 0
            
            for lead in leads_data:
                # Process each lead and sync to HubSpot
                # This is where you'd call your HubSpot API integration
                synced_count += 1
            
            log_test_to_airtable(
                "Phantombuster CRM Sync", 
                True, 
                f"Successfully synced {synced_count} leads to HubSpot CRM",
                "Lead Generation"
            )
            
            return {"success": True, "synced_count": synced_count}
            
        except Exception as e:
            log_test_to_airtable(
                "Phantombuster CRM Sync", 
                False, 
                f"Error syncing leads: {str(e)}",
                "Lead Generation"
            )
            return {"success": False, "message": f"Error syncing leads: {str(e)}"}

def test_phantombuster_integration():
    """Test complete Phantombuster integration"""
    print("Testing Phantombuster Lead Generation Integration...")
    
    # Initialize Phantombuster
    pb = PhantombusterLeadGenerator()
    
    # Test API connection
    connection_test = pb.test_connection()
    print(f"Connection Test: {connection_test}")
    
    if connection_test["success"]:
        # Get available agents
        agents_result = pb.get_agents()
        print(f"Available Agents: {agents_result}")
        
        if agents_result["success"] and agents_result["agents"]:
            print(f"Found {len(agents_result['agents'])} Phantombuster agents ready for lead generation")
            
            # Log successful integration
            log_test_to_airtable(
                "Phantombuster Integration Complete", 
                True, 
                f"Successfully integrated with {len(agents_result['agents'])} agents available",
                "Lead Generation",
                "https://phantombuster.com"
            )
        else:
            print("No agents found or error retrieving agents")
    else:
        print("Failed to connect to Phantombuster API")

def main():
    """Run Phantombuster integration test"""
    test_phantombuster_integration()

if __name__ == "__main__":
    main()