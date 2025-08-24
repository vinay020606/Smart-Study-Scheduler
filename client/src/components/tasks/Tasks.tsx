import React, { useState } from 'react';
import './Tasks.css';

const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const tabs = [
    { id: 'all', label: 'All Tasks', count: 12 },
    { id: 'pending', label: 'Pending', count: 5 },
    { id: 'in-progress', label: 'In Progress', count: 4 },
    { id: 'completed', label: 'Completed', count: 3 }
  ];

  const mockTasks = [
    {
      id: 1,
      title: 'Complete React Assignment',
      subject: 'Computer Science',
      priority: 'high' as const,
      status: 'in-progress' as const,
      dueDate: '2024-01-15',
      estimatedDuration: 120,
      tags: ['React', 'Frontend']
    },
    {
      id: 2,
      title: 'Read Chapter 5 - Data Structures',
      subject: 'Algorithms',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: '2024-01-18',
      estimatedDuration: 90,
      tags: ['Algorithms', 'Theory']
    },
    {
      id: 3,
      title: 'Practice Calculus Problems',
      subject: 'Mathematics',
      priority: 'high' as const,
      status: 'pending' as const,
      dueDate: '2024-01-16',
      estimatedDuration: 150,
      tags: ['Calculus', 'Practice']
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="tasks-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Task Management</h1>
        <p className="page-subtitle">Organize and track your study tasks efficiently</p>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search tasks..."
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-secondary">
            <span>📁</span>
            Filter
          </button>
          <button className="btn btn-primary">
            <span>➕</span>
            Create Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {mockTasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                {task.priority}
              </div>
              <div className="task-status" style={{ backgroundColor: getStatusColor(task.status) }}>
                {task.status}
              </div>
            </div>
            
            <div className="task-content">
              <h3 className="task-title">{task.title}</h3>
              <p className="task-subject">{task.subject}</p>
              
              <div className="task-meta">
                <div className="meta-item">
                  <span className="meta-label">Due:</span>
                  <span className="meta-value">{formatDate(task.dueDate)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Duration:</span>
                  <span className="meta-value">{formatDuration(task.estimatedDuration)}</span>
                </div>
              </div>
              
              <div className="task-tags">
                {task.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="task-actions">
              <button className="action-btn edit">
                <span>✏️</span>
                Edit
              </button>
              <button className="action-btn start">
                <span>▶️</span>
                Start
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (when no tasks) */}
      {mockTasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No tasks yet</h3>
          <p>Create your first task to get started with your study journey!</p>
          <button className="btn btn-primary">
            <span>➕</span>
            Create Your First Task
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;
