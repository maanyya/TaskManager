import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CreateProject = () => {
  const { api } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    setLoading(true)
    try {
      await api.post('/projects', { name, description })
      navigate('/projects')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    }
    setLoading(false)
  }

  return (
    <div className="page-container">
      <button className="back-link" onClick={() => navigate('/projects')}>← Back to Projects</button>
      <div className="create-form">
        <h2>Create New Project</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website Redesign" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this project about?" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProject
