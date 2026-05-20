import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'active' : ''

  if (!user) {
    return (
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c5ce7"/><stop offset="100%" stopColor="#0984e3"/></linearGradient></defs>
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          TaskFlow
        </Link>
        <div className="navbar-links">
          <Link to="/login" className={isActive('/login')}>Login</Link>
          <Link to="/signup" className={isActive('/signup')}>Sign Up</Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c5ce7"/><stop offset="100%" stopColor="#0984e3"/></linearGradient></defs>
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        TaskFlow
      </Link>
      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>Dashboard</Link>
        <Link to="/projects" className={isActive('/projects')}>Projects</Link>
        {user.role === 'admin' && <Link to="/create-project" className={isActive('/create-project')}>New Project</Link>}
        <div className="nav-user-info">
          <div className="nav-user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="nav-user-name">{user.name}</div>
            <div className="nav-user-role">{user.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
