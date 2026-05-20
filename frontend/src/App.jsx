import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'

const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Loading TaskFlow...</p>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/create-project" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
      </Routes>
    </>
  )
}

export default App
