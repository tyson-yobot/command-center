#!/usr/bin/env python3
"""
Airtable Helper - Centralized Configuration Management
Eliminates hardcoded table references and provides unified API access
"""

import os
import json
from pyairtable import Api

class AirtableHelper:
    def __init__(self):
        self.config = self._load_config()
        self.token = self._get_token()
        self.api = Api(self.token) if self.token else None
    
    def _load_config(self):
        """Load centralized table configuration"""
        try:
            with open('airtable_config.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise Exception("airtable_config.json not found. Please create configuration file.")
    
    def _get_token(self):
        """Get API token with fallback priority"""
        return (os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN') or 
                os.getenv('AIRTABLE_API_KEY'))
    
    def get_table(self, table_name):
        """Get configured Airtable table instance"""
        if not self.api:
            raise Exception("Airtable token not found. Set AIRTABLE_PERSONAL_ACCESS_TOKEN or AIRTABLE_API_KEY.")
        
        if table_name not in self.config:
            raise Exception(f"Table '{table_name}' not found in configuration.")
        
        table_config = self.config[table_name]
        return self.api.table(table_config['baseId'], table_config['tableName'])
    
    def get_table_config(self, table_name):
        """Get full table configuration including fields and views"""
        if table_name not in self.config:
            raise Exception(f"Table '{table_name}' not found in configuration.")
        return self.config[table_name]
    
    def get_field_name(self, table_name, field_key):
        """Get actual field name from configuration"""
        table_config = self.get_table_config(table_name)
        if 'fields' in table_config and field_key in table_config['fields']:
            return table_config['fields'][field_key]
        return field_key
    
    def create_record(self, table_name, data):
        """Create record with field name mapping"""
        table = self.get_table(table_name)
        mapped_data = self._map_field_names(table_name, data)
        return table.create(mapped_data)
    
    def update_record(self, table_name, record_id, data):
        """Update record with field name mapping"""
        table = self.get_table(table_name)
        mapped_data = self._map_field_names(table_name, data)
        return table.update(record_id, mapped_data)
    
    def get_records(self, table_name, view=None, formula=None):
        """Get records with optional view and formula"""
        table = self.get_table(table_name)
        kwargs = {}
        
        if view:
            # Use configured view name if available
            table_config = self.get_table_config(table_name)
            if 'view' in table_config:
                kwargs['view'] = table_config['view']
            else:
                kwargs['view'] = view
        
        if formula:
            kwargs['formula'] = formula
            
        return table.all(**kwargs)
    
    def _map_field_names(self, table_name, data):
        """Map logical field names to actual Airtable field names"""
        table_config = self.get_table_config(table_name)
        if 'fields' not in table_config:
            return data
        
        mapped_data = {}
        field_mapping = table_config['fields']
        
        for key, value in data.items():
            # Use mapped field name if available, otherwise use original key
            field_name = field_mapping.get(key, key)
            mapped_data[field_name] = value
        
        return mapped_data

# Global instance for easy import
airtable = AirtableHelper()

# Convenience functions for backward compatibility
def get_airtable_table(table_name):
    """Get Airtable table instance"""
    return airtable.get_table(table_name)

def log_to_airtable(table_name, data):
    """Log data to specified table with field mapping"""
    return airtable.create_record(table_name, data)

def update_airtable_record(table_name, record_id, data):
    """Update Airtable record with field mapping"""
    return airtable.update_record(table_name, record_id, data)

def get_airtable_records(table_name, view=None, formula=None):
    """Get records from specified table"""
    return airtable.get_records(table_name, view, formula)

# Usage examples for testing
if __name__ == "__main__":
    try:
        # Test configuration loading
        helper = AirtableHelper()
        print("Configuration loaded successfully")
        
        # Test table access
        tables = list(helper.config.keys())
        print(f"Available tables: {tables}")
        
        # Test field mapping
        for table_name in tables[:2]:  # Test first 2 tables
            config = helper.get_table_config(table_name)
            print(f"\n{table_name} configuration:")
            print(f"  Base ID: {config['baseId']}")
            print(f"  Table Name: {config['tableName']}")
            if 'view' in config:
                print(f"  Default View: {config['view']}")
            if 'fields' in config:
                print(f"  Mapped Fields: {len(config['fields'])}")
        
    except Exception as e:
        print(f"Configuration test failed: {e}")