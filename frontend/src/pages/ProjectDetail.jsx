import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TaskModal from '../components/TaskModal'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { api, user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberError, setMemberError] = useState('')

  const fetchData = async () => {
    try {
      const res = await api.get(`/projects/${id}`)
      setProject(res.data.project)
      setTasks(res.data.tasks)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const handleCreateTask = async (taskData) => {
    await api.post('/tasks', taskData)
    fetchData()
  }

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status })
    fetchData()
  }

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`)
    fetchData()
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setMemberError('')
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail })
      setMemberEmail('')
      fetchData()
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleDeleteProject = async () => {
    if (window.confirm('Delete this project and all its tasks?')) {
      await api.delete(`/projects/${id}`)
      navigate('/projects')
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div><p>Loading project...</p></div>
  }

  if (!project) {
    return <div className="page-container"><div className="empty-state"><h3>Project not found</h3></div></div>
  }

  const isOwner = project.owner?._id === user._id
  const isAdmin = user.role === 'admin'
  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
  const doneTasks = tasks.filter(t => t.status === 'done')

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const isOverdue = (d, s) => s !== 'done' && new Date(d) < new Date()

  const renderTaskCard = (task) => (
    <div className="task-card" key={task._id}>
      <div className="task-card-header">
        <div>
          <div className="task-title">{task.title}</div>
          {task.description && <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:4}}>{task.description}</div>}
        </div>
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
      </div>
      <div className="task-card-footer">
        <div className="task-assignee">
          <div className="task-assignee-avatar">{task.assignedTo?.name?.charAt(0) || '?'}</div>
          <span>{task.assignedTo?.name}</span>
        </div>
        <div className={isOverdue(task.dueDate, task.status) ? 'task-due overdue' : 'task-due'}>
          📅 {formatDate(task.dueDate)}
        </div>
      </div>
      <div style={{display:'flex',gap:8,width:'100%',alignItems:'center',marginTop:4}}>
        <select className="status-select" value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
          disabled={!isAdmin && task.assignedTo?._id !== user._id}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {isAdmin && (
          <button className="btn-icon" style={{width:28,height:28,fontSize:'0.7rem'}} onClick={() => handleDeleteTask(task._id)}>✕</button>
        )}
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <button className="back-link" onClick={() => navigate('/projects')}>← Back to Projects</button>

      <div className="project-detail-header">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <h1>{project.name}</h1>
            <p>{project.description || 'No description'}</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Task</button>
            )}
            {isOwner && (
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete Project</button>
            )}
          </div>
        </div>
      </div>

      <div className="project-detail-grid">
        <div>
          <div className="task-board">
            <div className="task-column">
              <div className="task-column-header">
                <div className="task-column-title">📝 To Do <span className="task-column-count">{todoTasks.length}</span></div>
              </div>
              {todoTasks.map(renderTaskCard)}
            </div>
            <div className="task-column">
              <div className="task-column-header">
                <div className="task-column-title">⚡ In Progress <span className="task-column-count">{inProgressTasks.length}</span></div>
              </div>
              {inProgressTasks.map(renderTaskCard)}
            </div>
            <div className="task-column">
              <div className="task-column-header">
                <div className="task-column-title">✅ Done <span className="task-column-count">{doneTasks.length}</span></div>
              </div>
              {doneTasks.map(renderTaskCard)}
            </div>
          </div>
        </div>

        <div className="members-panel">
          <h3>👥 Members ({project.members?.length || 0})</h3>
          {project.members?.map(member => (
            <div className="member-item" key={member._id}>
              <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
              <div className="member-info">
                <div className="member-name">{member.name} {member._id === project.owner._id ? '(Owner)' : ''}</div>
                <div className="member-email">{member.email}</div>
              </div>
              {isOwner && member._id !== project.owner._id && (
                <button className="btn-icon" style={{width:28,height:28,fontSize:'0.7rem'}} onClick={() => handleRemoveMember(member._id)}>✕</button>
              )}
            </div>
          ))}
          {isOwner && (
            <>
              {memberError && <div className="error-msg" style={{marginTop:8,fontSize:'0.8rem'}}>{memberError}</div>}
              <form className="add-member-form" onSubmit={handleAddMember}>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="member@email.com" required />
                <button type="submit" className="btn btn-primary btn-sm">Add</button>
              </form>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTask}
          members={project.members || []}
          projectId={project._id}
        />
      )}
    </div>
  )
}

export default ProjectDetail
