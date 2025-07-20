import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

interface VersionControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TemplateVersion {
  id: string;
  industry: string;
  version: string;
  releaseDate: string;
  changes: string[];
  isLatest: boolean;
}

interface ClientTemplate {
  clientId: string;
  clientName: string;
  industry: string;
  currentVersion: string;
  latestVersion: string;
  needsUpdate: boolean;
}

export const VersionControlModal = ({ isOpen, onClose }: VersionControlModalProps) => {
  const [templates, setTemplates] = useState<TemplateVersion[]>([]);
  const [clientTemplates, setClientTemplates] = useState<ClientTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [diffView, setDiffView] = useState(false);

  useEffect(() => {
    const fetchVersionData = async () => {
      setIsLoading(true);
      try {
        const templatesResponse = await fetch('/api/templates/versions');
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);

        const clientsResponse = await fetch('/api/templates/clients');
        const clientsData = await clientsResponse.json();
        setClientTemplates(clientsData);
      } catch (error) {
        console.error('Error fetching version data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchVersionData();
    }
  }, [isOpen]);

  const industries = ['all', ...new Set(templates.map(t => t.industry))];
  
  const filteredTemplates = templates.filter(template => {
    if (selectedIndustry === 'all') return true;
    return template.industry === selectedIndustry;
  });

  const filteredClientTemplates = clientTemplates.filter(client => {
    if (selectedIndustry === 'all') return true;
    return client.industry === selectedIndustry;
  });

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      setDiffView(true);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, versionId]);
      } else {
        setSelectedVersions([selectedVersions[1], versionId]);
      }
    }
  };

  const handleUpdateClient = async (clientId: string) => {
    try {
      await fetch(`/api/templates/clients/${clientId}/update`, { method: 'POST' });
      // Refresh client data
      const response = await fetch('/api/templates/clients');
      const data = await response.json();
      setClientTemplates(data);
    } catch (error) {
      console.error('Error updating client template:', error);
    }
  };

  const renderTemplatesTab = () => (
    <div className="templates-tab">
      <div className="filter-controls">
        <div className="filter-group">
          <label>Industry:</label>
          <select 
            value={selectedIndustry} 
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="industry-filter"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? 'All Industries' : industry}
              </option>
            ))}
          </select>
        </div>
        
        {selectedVersions.length > 0 && (
          <div className="selected-versions">
            <span>Selected: {selectedVersions.length}/2</span>
            <button 
              className="btn-compare" 
              disabled={selectedVersions.length !== 2}
              onClick={handleCompareVersions}
            >
              Compare Versions
            </button>
          </div>
        )}
      </div>
      
      <div className="templates-table-container">
        <table className="templates-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Industry</th>
              <th>Version</th>
              <th>Release Date</th>
              <th>Status</th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map(template => (
              <tr 
                key={template.id} 
                className={template.isLatest ? 'latest-version' : ''}
              >
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedVersions.includes(template.id)}
                    onChange={() => handleVersionSelect(template.id)}
                  />
                </td>
                <td>{template.industry}</td>
                <td>{template.version}</td>
                <td>{template.releaseDate}</td>
                <td>{template.isLatest ? <span className="latest-badge">Latest</span> : ''}</td>
                <td>
                  <button className="btn-view-changes">View Changes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClientsTab = () => (
    <div className="clients-tab">
      <div className="filter-controls">
        <div className="filter-group">
          <label>Industry:</label>
          <select 
            value={selectedIndustry} 
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="industry-filter"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? 'All Industries' : industry}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Show:</label>
          <select className="update-filter">
            <option value="all">All Clients</option>
            <option value="needsUpdate">Needs Update</option>
            <option value="current">Current</option>
          </select>
        </div>
      </div>
      
      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Industry</th>
              <th>Current Version</th>
              <th>Latest Version</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientTemplates.map(client => (
              <tr 
                key={client.clientId} 
                className={client.needsUpdate ? 'needs-update' : ''}
              >
                <td>{client.clientName}</td>
                <td>{client.industry}</td>
                <td>{client.currentVersion}</td>
                <td>{client.latestVersion}</td>
                <td>
                  {client.needsUpdate ? 
                    <span className="update-badge">Update Available</span> : 
                    <span className="current-badge">Current</span>
                  }
                </td>
                <td>
                  <button 
                    className="btn-update" 
                    disabled={!client.needsUpdate}
                    onClick={() => handleUpdateClient(client.clientId)}
                  >
                    Update to Latest
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDiffView = () => {
    if (selectedVersions.length !== 2) return null;
    
    const version1 = templates.find(t => t.id === selectedVersions[0]);
    const version2 = templates.find(t => t.id === selectedVersions[1]);
    
    if (!version1 || !version2) return null;
    
    return (
      <div className="diff-view">
        <div className="diff-header">
          <h3>Comparing Versions</h3>
          <div className="diff-versions">
            <div className="diff-version">
              <span className="version-label">From:</span>
              <span className="version-value">{version1.industry} v{version1.version}</span>
            </div>
            <div className="diff-version">
              <span className="version-label">To:</span>
              <span className="version-value">{version2.industry} v{version2.version}</span>
            </div>
          </div>
          <button className="btn-close-diff" onClick={() => setDiffView(false)}>
            Close Diff
          </button>
        </div>
        
        <div className="diff-content">
          <div className="diff-section">
            <h4>Changes in {version2.version}</h4>
            <ul className="changes-list">
              {version2.changes.map((change, index) => (
                <li key={index} className="change-item">
                  <span className="change-icon">+</span>
                  <span className="change-text">{change}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="diff-preview">
            <h4>Template Preview</h4>
            <div className="preview-container">
              <div className="preview-code">
                {/* This would show actual template code differences */}
                <pre>
                  {`// Template code differences would be shown here
+ Added lines
- Removed lines
  Unchanged lines`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔄 Version Control"
      size="xl"
    >
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading version data...</div>
        </div>
      ) : diffView ? (
        renderDiffView()
      ) : (
        <div className="version-control-modal">
          <div className="tabs-container">
            <div className="tabs-header">
              <button 
                className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                Template Versions
              </button>
              <button 
                className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                Client Templates
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'templates' && renderTemplatesTab()}
              {activeTab === 'clients' && renderClientsTab()}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};