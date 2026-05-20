import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { api } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading"><div className="spinner"></div><p>Loading dashboard...</p></div>
  }

  const stats = data?.stats || { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 }
  const tasks = data?.recentTasks || []

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const isOverdue = (d, s) => s !== 'done' && new Date(d) < new Date()

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-card-icon">📋</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Tasks</div>
        </div>
        <div className="stat-card todo">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-value">{stats.todo}</div>
          <div className="stat-card-label">To Do</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-card-icon">⚡</div>
          <div className="stat-card-value">{stats.inProgress}</div>
          <div className="stat-card-label">In Progress</div>
        </div>
        <div className="stat-card done">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{stats.done}</div>
          <div className="stat-card-label">Completed</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-card-icon">🔥</div>
          <div className="stat-card-value">{stats.overdue}</div>
          <div className="stat-card-label">Overdue</div>
        </div>
      </div>

      <h2 className="section-title">Recent Tasks</h2>
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No tasks yet</h3>
          <p>Create a project and start adding tasks</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <div className="task-card" key={task._id}>
              <div className={`task-priority-bar ${task.priority}`}></div>
              <div className="task-info">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span>📁 {task.project?.name || 'Unknown'}</span>
                  <span>👤 {task.assignedTo?.name || 'Unassigned'}</span>
                  <span className={isOverdue(task.dueDate, task.status) ? 'task-due overdue' : 'task-due'}>
                    📅 {formatDate(task.dueDate)}
                    {isOverdue(task.dueDate, task.status) && ' (overdue)'}
                  </span>
                </div>
              </div>
              <span className={`status-badge ${task.status}`}>
                {task.status === 'in-progress' ? 'In Progress' : task.status}
              </span>
              <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
