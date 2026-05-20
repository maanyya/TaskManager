import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Projects = () => {
  const { api, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/projects')
      .then(res => { setProjects(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading"><div className="spinner"></div><p>Loading projects...</p></div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Projects</h1>
        {user.role === 'admin' && (
          <Link to="/create-project" className="btn btn-primary">+ New Project</Link>
        )}
      </div>
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3>No projects yet</h3>
          <p>{user.role === 'admin' ? 'Create your first project to get started' : 'Ask an admin to add you to a project'}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const progress = project.taskCount > 0 ? Math.round((project.doneCount / project.taskCount) * 100) : 0
            return (
              <Link to={`/projects/${project._id}`} key={project._id} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description || 'No description'}</p>
                <div className="project-stats">
                  <div className="project-stat">📋 {project.taskCount} tasks</div>
                  <div className="project-stat">👥 {project.members?.length || 0} members</div>
                  <div className="project-stat">✅ {progress}% done</div>
                </div>
                <div className="project-progress">
                  <div className="project-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="project-owner">Created by {project.owner?.name}</div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Projects
