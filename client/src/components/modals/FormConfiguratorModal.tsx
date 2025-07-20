import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

interface FormConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
  weight: number;
  logic?: {
    condition: string;
    value: string;
    action: string;
  }[];
}

interface FormTemplate {
  id: string;
  name: string;
  industry: string;
  type: 'call' | 'lead' | 'survey';
  questions: FormQuestion[];
  status: 'draft' | 'published';
  lastModified: string;
}

export const FormConfiguratorModal = ({ isOpen, onClose }: FormConfiguratorModalProps) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');

  useEffect(() => {
    const fetchFormTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/forms/templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching form templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchFormTemplates();
    }
  }, [isOpen]);

  const industries = ['all', ...new Set(templates.map(t => t.industry))];
  const formTypes = ['all', 'call', 'lead', 'survey'];
  
  const filteredTemplates = templates.filter(template => {
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesIndustry = filterIndustry === 'all' || template.industry === filterIndustry;
    return matchesType && matchesIndustry;
  });

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await fetch(`/api/forms/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTemplate),
      });
      
      // Refresh templates
      const response = await fetch('/api/forms/templates');
      const data = await response.json();
      setTemplates(data);
      
      setEditMode(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handlePublishTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await fetch(`/api/forms/templates/${selectedTemplate.id}/publish`, {
        method: 'POST',
      });
      
      // Refresh templates
      const response = await fetch('/api/forms/templates');
      const data = await response.json();
      setTemplates(data);
      
      // Update selected template
      const updated = data.find(t => t.id === selectedTemplate.id);
      if (updated) {
        setSelectedTemplate(updated);
      }
    } catch (error) {
      console.error('Error publishing template:', error);
    }
  };

  const handleAddQuestion = () => {
    if (!selectedTemplate || !editMode) return;
    
    const newQuestion: FormQuestion = {
      id: `q${Date.now()}`,
      text: 'New Question',
      type: 'text',
      required: false,
      weight: 1,
    };
    
    setSelectedTemplate({
      ...selectedTemplate,
      questions: [...selectedTemplate.questions, newQuestion],
    });
  };

  const handleUpdateQuestion = (questionId: string, updates: Partial<FormQuestion>) => {
    if (!selectedTemplate || !editMode) return;
    
    const updatedQuestions = selectedTemplate.questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    
    setSelectedTemplate({
      ...selectedTemplate,
      questions: updatedQuestions,
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedTemplate || !editMode) return;
    
    const updatedQuestions = selectedTemplate.questions.filter(q => q.id !== questionId);
    
    setSelectedTemplate({
      ...selectedTemplate,
      questions: updatedQuestions,
    });
  };

  const renderTemplatesList = () => (
    <div className="templates-list">
      <div className="filter-controls">
        <div className="filter-group">
          <label>Type:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="type-filter"
          >
            {formTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Industry:</label>
          <select 
            value={filterIndustry} 
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="industry-filter"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? 'All Industries' : industry}
              </option>
            ))}
          </select>
        </div>
        
        <button className="btn-new-template">New Template</button>
      </div>
      
      <div className="templates-table-container">
        <table className="templates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Industry</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Last Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map(template => (
              <tr 
                key={template.id} 
                className={`template-row status-${template.status}`}
                onClick={() => setSelectedTemplate(template)}
              >
                <td>{template.name}</td>
                <td>{template.type.charAt(0).toUpperCase() + template.type.slice(1)}</td>
                <td>{template.industry}</td>
                <td>{template.questions.length}</td>
                <td>
                  <span className={`status-badge status-${template.status}`}>
                    {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                  </span>
                </td>
                <td>{template.lastModified}</td>
                <td>
                  <button 
                    className="btn-edit" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                      setEditMode(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuestionEditor = (question: FormQuestion, index: number) => (
    <div key={question.id} className="question-editor">
      <div className="question-header">
        <h4>Question {index + 1}</h4>
        <button 
          className="btn-delete-question" 
          onClick={() => handleDeleteQuestion(question.id)}
        >
          Delete
        </button>
      </div>
      
      <div className="form-group">
        <label>Question Text:</label>
        <input 
          type="text" 
          value={question.text} 
          onChange={(e) => handleUpdateQuestion(question.id, { text: e.target.value })}
          className="question-text-input"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Type:</label>
          <select 
            value={question.type} 
            onChange={(e) => handleUpdateQuestion(question.id, { type: e.target.value as any })}
            className="question-type-select"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
            <option value="boolean">Yes/No</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Required:</label>
          <input 
            type="checkbox" 
            checked={question.required} 
            onChange={(e) => handleUpdateQuestion(question.id, { required: e.target.checked })}
            className="question-required-checkbox"
          />
        </div>
        
        <div className="form-group">
          <label>Weight:</label>
          <input 
            type="number" 
            value={question.weight} 
            onChange={(e) => handleUpdateQuestion(question.id, { weight: parseInt(e.target.value) })}
            min="1"
            max="10"
            className="question-weight-input"
          />
        </div>
      </div>
      
      {question.type === 'select' && (
        <div className="form-group">
          <label>Options (comma separated):</label>
          <input 
            type="text" 
            value={question.options?.join(', ') || ''} 
            onChange={(e) => handleUpdateQuestion(question.id, { 
              options: e.target.value.split(',').map(opt => opt.trim()) 
            })}
            className="question-options-input"
          />
        </div>
      )}
      
      <div className="form-group">
        <label>Logic Rules:</label>
        <button className="btn-add-logic">Add Logic Rule</button>
        
        {question.logic && question.logic.length > 0 && (
          <div className="logic-rules">
            {question.logic.map((rule, ruleIndex) => (
              <div key={ruleIndex} className="logic-rule">
                <span>If answer {rule.condition} {rule.value}, then {rule.action}</span>
                <button className="btn-remove-rule">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplateEditor = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="template-editor">
        <div className="editor-header">
          <h3>{editMode ? 'Edit Template' : 'View Template'}</h3>
          <div className="editor-actions">
            {editMode ? (
              <>
                <button className="btn-cancel" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleSaveTemplate}>
                  Save as Draft
                </button>
              </>
            ) : (
              <>
                <button className="btn-edit" onClick={() => setEditMode(true)}>
                  Edit
                </button>
                <button className="btn-preview" onClick={() => setPreviewMode(true)}>
                  Preview
                </button>
                {selectedTemplate.status === 'draft' && (
                  <button className="btn-publish" onClick={handlePublishTemplate}>
                    Publish
                  </button>
                )}
                <button className="btn-back" onClick={() => setSelectedTemplate(null)}>
                  Back to List
                </button>
              </>
            )}
          </div>
        </div>
        
        {editMode && (
          <div className="template-details">
            <div className="form-row">
              <div className="form-group">
                <label>Template Name:</label>
                <input 
                  type="text" 
                  value={selectedTemplate.name} 
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                  className="template-name-input"
                />
              </div>
              
              <div className="form-group">
                <label>Industry:</label>
                <select 
                  value={selectedTemplate.industry} 
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, industry: e.target.value})}
                  className="template-industry-select"
                >
                  {industries.filter(i => i !== 'all').map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Type:</label>
                <select 
                  value={selectedTemplate.type} 
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, type: e.target.value as any})}
                  className="template-type-select"
                >
                  <option value="call">Call Scoring</option>
                  <option value="lead">Lead Handling</option>
                  <option value="survey">Survey</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="questions-container">
          <h4>Questions</h4>
          
          {editMode && (
            <button className="btn-add-question" onClick={handleAddQuestion}>
              Add Question
            </button>
          )}
          
          <div className="questions-list">
            {selectedTemplate.questions.map((question, index) => (
              editMode ? 
                renderQuestionEditor(question, index) :
                <div key={question.id} className="question-item">
                  <div className="question-number">{index + 1}</div>
                  <div className="question-content">
                    <div className="question-text">{question.text}</div>
                    <div className="question-meta">
                      <span className="question-type">{question.type}</span>
                      {question.required && <span className="question-required">Required</span>}
                      <span className="question-weight">Weight: {question.weight}</span>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="template-preview">
        <div className="preview-header">
          <h3>Preview: {selectedTemplate.name}</h3>
          <button className="btn-close-preview" onClick={() => setPreviewMode(false)}>
            Close Preview
          </button>
        </div>
        
        <div className="preview-form">
          <div className="preview-form-header">
            <h4>{selectedTemplate.name}</h4>
            <p>Industry: {selectedTemplate.industry}</p>
            <p>Type: {selectedTemplate.type.charAt(0).toUpperCase() + selectedTemplate.type.slice(1)}</p>
          </div>
          
          <div className="preview-questions">
            {selectedTemplate.questions.map((question, index) => (
              <div key={question.id} className="preview-question">
                <div className="preview-question-text">
                  {index + 1}. {question.text} {question.required && <span className="required-indicator">*</span>}
                </div>
                
                <div className="preview-question-input">
                  {question.type === 'text' && (
                    <input type="text" placeholder="Enter text..." className="preview-text-input" />
                  )}
                  
                  {question.type === 'number' && (
                    <input type="number" placeholder="0" className="preview-number-input" />
                  )}
                  
                  {question.type === 'select' && (
                    <select className="preview-select">
                      <option value="">Select an option</option>
                      {question.options?.map((option, optIndex) => (
                        <option key={optIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {question.type === 'boolean' && (
                    <div className="preview-boolean">
                      <label>
                        <input type="radio" name={`q-${question.id}`} value="yes" />
                        Yes
                      </label>
                      <label>
                        <input type="radio" name={`q-${question.id}`} value="no" />
                        No
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="preview-form-footer">
            <button className="btn-submit-preview">Submit</button>
          </div>
        </div>
        
        <div className="preview-logic">
          <h4>Scoring Logic Preview</h4>
          <pre className="logic-code">
            {`// This is how the form would be processed
function scoreForm(answers) {
  let score = 0;
  let maxScore = 0;
  
  // Process each question
  ${selectedTemplate.questions.map(q => `
  // Question: ${q.text}
  maxScore += ${q.weight};
  if (answers["${q.id}"] ${q.type === 'boolean' ? '=== "yes"' : '!== ""'}) {
    score += ${q.weight};
  }
  ${q.logic ? q.logic.map(rule => `
  // Logic rule
  if (answers["${q.id}"] ${rule.condition} "${rule.value}") {
    // ${rule.action}
  }`).join('\n') : ''}
  `).join('\n')}
  
  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100)
  };
}`}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📝 Form & Question Configurator"
      size="xl"
    >
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading form templates...</div>
        </div>
      ) : previewMode ? (
        renderTemplatePreview()
      ) : selectedTemplate ? (
        renderTemplateEditor()
      ) : (
        renderTemplatesList()
      )}
    </Modal>
  );
};