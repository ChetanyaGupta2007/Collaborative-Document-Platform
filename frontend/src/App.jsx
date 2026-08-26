import Register from './register.jsx'
import Login from './login.jsx'
import Dashboard from './Dashboard.jsx'
import { Routes, Route } from 'react-router-dom'
import SpecificDoc from './specificDoc.jsx'


function App() {
    return (
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/document/:id" element={<SpecificDoc />}></Route>
      </Routes>
    )
}

export default App
