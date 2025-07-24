import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerProfile {
  id: string;
  name: string;
  industry: string;
  templateVersion: string;
  configOverrides: {
    callQuestions: boolean;
    leadHandling: boolean;
    other: boolean;
  };
  onboardingStatus: 'Pending' | 'Configured' | 'Live';
  syncState: {
    crm: boolean;
    airtable: boolean;
  };
  supportTier: string;
}

export const CustomerProfileModal = ({ isOpen, onClose }: CustomerProfileModalProps) => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStatusBadge = (status: 'Pending' | 'Configured' | 'Live') => {
    const statusClasses: Record<'Pending' | 'Configured' | 'Live', string> = {
      'Pending': 'bg-yellow-500',
      'Configured': 'bg-blue-500',
      'Live': 'bg-green-500'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const renderSyncState = (isSync: boolean) => {
    return isSync ? 
      <span className="sync-badge sync-success">✅</span> : 
      <span className="sync-badge sync-failed">❌</span>;
  };

  const handleCustomerSelect = (customer: CustomerProfile) => {
    setSelectedCustomer(customer);
  };

  const renderCustomerList = () => (
    <div className="customer-list">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Industry</th>
              <th>Template</th>
              <th>Status</th>
              <th>CRM Sync</th>
              <th>Airtable Sync</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} onClick={() => handleCustomerSelect(customer)}>
                <td>{customer.name}</td>
                <td>{customer.industry}</td>
                <td>{customer.templateVersion}</td>
                <td>{renderStatusBadge(customer.onboardingStatus)}</td>
                <td>{renderSyncState(customer.syncState.crm)}</td>
                <td>{renderSyncState(customer.syncState.airtable)}</td>
                <td>
                  <button className="btn-view" onClick={() => handleCustomerSelect(customer)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomerDetail = () => {
    if (!selectedCustomer) return null;
    
    return (
      <div className="customer-detail">
        <div className="detail-header">
          <h3>{selectedCustomer.name}</h3>
          <button className="btn-back" onClick={() => setSelectedCustomer(null)}>
            Back to List
          </button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h4>Basic Information</h4>
            <div className="detail-row">
              <span className="detail-label">Customer ID:</span>
              <span className="detail-value">{selectedCustomer.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Industry:</span>
              <span className="detail-value">{selectedCustomer.industry}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Support Tier:</span>
              <span className="detail-value">{selectedCustomer.supportTier}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Onboarding Status:</span>
              <span className="detail-value">{renderStatusBadge(selectedCustomer.onboardingStatus)}</span>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Template & Configuration</h4>
            <div className="detail-row">
              <span className="detail-label">Template Version:</span>
              <span className="detail-value">{selectedCustomer.templateVersion}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Config Overrides:</span>
              <div className="config-overrides">
                <div className="config-item">
                  <span className="config-label">Call Questions:</span>
                  <span className="config-value">{selectedCustomer.configOverrides.callQuestions ? 'Yes' : 'No'}</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Lead Handling:</span>
                  <span className="config-value">{selectedCustomer.configOverrides.leadHandling ? 'Yes' : 'No'}</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Other:</span>
                  <span className="config-value">{selectedCustomer.configOverrides.other ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Integration Status</h4>
            <div className="detail-row">
              <span className="detail-label">CRM Sync:</span>
              <span className="detail-value">{renderSyncState(selectedCustomer.syncState.crm)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Airtable Sync:</span>
              <span className="detail-value">{renderSyncState(selectedCustomer.syncState.airtable)}</span>
            </div>
          </div>
          
          <div className="detail-actions">
            <button className="btn-edit">Edit Profile</button>
            <button className="btn-sync">Sync Integrations</button>
            <button className="btn-template">Update Template</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="👤 Customer Profiles"
      size="xl"
    >
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading customer profiles...</div>
        </div>
      ) : (
        <div className="customer-profile-modal">
          {selectedCustomer ? renderCustomerDetail() : renderCustomerList()}
        </div>
      )}
    </Modal>
  );
};