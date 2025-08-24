import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

interface StudyStats {
  totalStudyTime: number;
  totalSessions: number;
  averageSessionLength: number;
  longestStreak: number;
  currentStreak: number;
}

interface Task {
  _id: string;
  title: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

interface StudySession {
  _id: string;
  subject: string;
  startTime: string;
  duration: number;
  status: 'active' | 'paused' | 'completed';
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format study time from minutes to "Xh Ym" format
  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getFullName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        // Fetch user stats
        const statsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch recent tasks
        const tasksResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/tasks?limit=5&sort=dueDate`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setRecentTasks(tasksData.tasks || []);
        }

        // Fetch recent study sessions
        const sessionsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/study-sessions?limit=5&sort=startTime`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setRecentSessions(sessionsData.sessions || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user ? getFullName(user.firstName, user.lastName) : 'Student'}! 👋</h1>
        <p>Let's make today productive with your smart study schedule. Track your progress and stay motivated!</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Study Time</h3>
            <p className="stat-value">{formatStudyTime(stats?.totalStudyTime || 0)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Sessions</h3>
            <p className="stat-value">{stats?.totalSessions || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Avg Session Length</h3>
            <p className="stat-value">{formatStudyTime(stats?.averageSessionLength || 0)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-value">{stats?.currentStreak || 0} days</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary">
            <span>▶️</span>
            Start Study Session
          </button>
          <button className="action-btn secondary">
            <span>📝</span>
            Create New Task
          </button>
          <button className="action-btn secondary">
            <span>📅</span>
            View Schedule
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="recent-tasks">
          <h2>Recent Tasks</h2>
          {recentTasks.length > 0 ? (
            <div className="task-list">
              {recentTasks.map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p className="task-subject">{task.subject}</p>
                  </div>
                  <div className="task-meta">
                    <span className={`priority ${task.priority}`}>{task.priority}</span>
                    <span className={`status ${task.status}`}>{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent tasks. Create your first task to get started!</p>
          )}
        </div>

        <div className="recent-sessions">
          <h2>Recent Study Sessions</h2>
          {recentSessions.length > 0 ? (
            <div className="session-list">
              {recentSessions.map((session) => (
                <div key={session._id} className="session-item">
                  <div className="session-info">
                    <h4>{session.subject}</h4>
                    <p className="session-time">{new Date(session.startTime).toLocaleDateString()}</p>
                  </div>
                  <div className="session-meta">
                    <span className="duration">{formatStudyTime(session.duration)}</span>
                    <span className={`status ${session.status}`}>{session.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent study sessions. Start your first session to track your progress!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
