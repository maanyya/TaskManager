import { useState } from 'react'

const TaskModal = ({ onClose, onSubmit, members, projectId }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !assignedTo || !dueDate) {
      setError('Title, assignee and due date are required')
      return
    }
    try {
      await onSubmit({ title, description, assignedTo, priority, dueDate, project: projectId })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Create New Task</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Task description (optional)" />
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Select member</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
