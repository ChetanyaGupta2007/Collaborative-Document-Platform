import Register from './register.jsx'
import Login from './login.jsx'
import Dashboard from './Dashboard.jsx'
import { Routes, Route } from 'react-router-dom'


function App() {
    return (
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    )
}

export default App
