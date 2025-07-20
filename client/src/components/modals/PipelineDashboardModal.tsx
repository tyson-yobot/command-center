import { useState } from 'react';
import { PipelineDashboard } from '@/components/dashboards/PipelineDashboard';
import { Modal } from '@/components/ui/Modal';

interface PipelineDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PipelineDashboardModal = ({ isOpen, onClose }: PipelineDashboardModalProps) => {
  const [activeTab, setActiveTab] = useState('pipeline');

  const tabs = [
    { id: 'pipeline', label: '📊 Pipeline View' },
    { id: 'leads', label: '🎯 Lead Status' },
    { id: 'calls', label: '📞 Call Metrics' },
    { id: 'analytics', label: '📈 Analytics' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📞 Pipeline Dashboard"
      size="xl"
      className="pipeline-dashboard-modal"
    >
      <div className="tabs-container">
        <div className="tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          <PipelineDashboard activeTab={activeTab} />
        </div>
      </div>
      
      <div className="modal-footer">
        <button className="btn-blue" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};