import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

interface PipelineStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AutomationJob {
  id: string;
  name: string;
  type: string;
  lastRunTime: string;
  status: 'success' | 'warning' | 'error' | 'running';
  duration: string;
  failureCount: number;
  customer?: string;
}

interface FailureLog {
  id: string;
  jobId: string;
  timestamp: string;
  errorMessage: string;
  stackTrace: string;
  severity: 'high' | 'medium' | 'low';
}

export const PipelineStatusModal = ({ isOpen, onClose }: PipelineStatusModalProps) => {
  const [automationJobs, setAutomationJobs] = useState<AutomationJob[]>([]);
  const [failureLogs, setFailureLogs] = useState<FailureLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchPipelineData = async () => {
      setIsLoading(true);
      try {
        const jobsResponse = await fetch('/api/pipeline/jobs');
        const jobsData = await jobsResponse.json();
        setAutomationJobs(jobsData);

        const logsResponse = await fetch('/api/pipeline/failure-logs');
        const logsData = await logsResponse.json();
        setFailureLogs(logsData);
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchPipelineData();
    }
  }, [isOpen]);

  const handleRetryJob = async (jobId: string) => {
    try {
      await fetch(`/api/pipeline/jobs/${jobId}/retry`, { method: 'POST' });
      // Refresh job data
      const response = await fetch('/api/pipeline/jobs');
      const data = await response.json();
      setAutomationJobs(data);
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  const filteredJobs = automationJobs.filter(job => {
    if (filterStatus === 'all') return true;
    return job.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'running': return '⏳';
      default: return '❓';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      case 'low': return '🟡';
      default: return '⚪';
    }
  };

  const renderJobsTab = () => (
    <div className="jobs-tab">
      <div className="filter-controls">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="running">Running</option>
          </select>
        </div>
        <button className="btn-refresh">Refresh</button>
      </div>
      
      <div className="jobs-table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Job Name</th>
              <th>Type</th>
              <th>Last Run</th>
              <th>Duration</th>
              <th>Failures</th>
              <th>Customer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr 
                key={job.id} 
                className={`job-row status-${job.status}`}
                onClick={() => setSelectedJob(job.id === selectedJob ? null : job.id)}
              >
                <td>{getStatusIcon(job.status)}</td>
                <td>{job.name}</td>
                <td>{job.type}</td>
                <td>{job.lastRunTime}</td>
                <td>{job.duration}</td>
                <td>{job.failureCount > 0 ? <span className="failure-count">{job.failureCount}</span> : '0'}</td>
                <td>{job.customer || 'System'}</td>
                <td>
                  <button 
                    className="btn-retry" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetryJob(job.id);
                    }}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFailureLogsTab = () => (
    <div className="failure-logs-tab">
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Timestamp</th>
              <th>Job</th>
              <th>Error Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {failureLogs.map(log => {
              const job = automationJobs.find(j => j.id === log.jobId);
              return (
                <tr key={log.id} className={`log-row severity-${log.severity}`}>
                  <td>{getSeverityIcon(log.severity)}</td>
                  <td>{log.timestamp}</td>
                  <td>{job?.name || 'Unknown'}</td>
                  <td className="error-message">{log.errorMessage}</td>
                  <td>
                    <button className="btn-view-details">Details</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWarningsTab = () => {
    const outdatedJobs = automationJobs.filter(job => job.status === 'warning');
    
    return (
      <div className="warnings-tab">
        <h3>Template & Configuration Warnings</h3>
        
        {outdatedJobs.length > 0 ? (
          <div className="warnings-list">
            {outdatedJobs.map(job => (
              <div key={job.id} className="warning-item">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <div className="warning-title">{job.name}</div>
                  <div className="warning-description">
                    This job may be using an outdated template or has configuration mismatches.
                  </div>
                </div>
                <div className="warning-actions">
                  <button className="btn-fix">Fix</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-warnings">
            No template or configuration warnings detected.
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📊 Pipeline Status"
      size="xl"
    >
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading pipeline status...</div>
        </div>
      ) : (
        <div className="pipeline-status-modal">
          <div className="tabs-container">
            <div className="tabs-header">
              <button 
                className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                Automation Jobs
              </button>
              <button 
                className={`tab-button ${activeTab === 'failures' ? 'active' : ''}`}
                onClick={() => setActiveTab('failures')}
              >
                Failure Logs
              </button>
              <button 
                className={`tab-button ${activeTab === 'warnings' ? 'active' : ''}`}
                onClick={() => setActiveTab('warnings')}
              >
                Warnings
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'jobs' && renderJobsTab()}
              {activeTab === 'failures' && renderFailureLogsTab()}
              {activeTab === 'warnings' && renderWarningsTab()}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};