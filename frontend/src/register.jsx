import { useState } from 'react'
import './login.jsx'
import { useNavigate,Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
export default function Register(){
    const navigate = useNavigate();
//  const [count, setCount] = useState(0)
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleInputChangeUsername = (e) => {
      setUsername(e.target.value);
      
    };

    const handleInputChangeEmail = (e) => {
      setEmail( e.target.value);
      
    };

    const handleInputChangePassword = (e) => {
      setPassword(e.target.value);
      
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      // Handle form submission logic here
      console.log('Form submit initiated', { username, email, password });
      try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'

        },
        body: JSON.stringify({ username, email, password })
      })
      const serverResponse = await response.json();
      console.log(serverResponse);
      if (response.ok) {
        // Registration successful, handle accordingly
        console.log('Registration successful');
        setUsername('');
        setEmail('');
        setPassword('');
        navigate('/login');
      } else {
        // Registration failed, handle error
        console.error('Registration failed:', serverResponse.message);
      }}
      catch (error) {
        console.error('Error:', error);
      }

    };


  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm bg-surface border border-line rounded-lg p-8 shadow-sm">
        <h1 className="font-serif text-3xl text-ink mb-1">Create your account</h1>
        <p className="text-sm text-ink-muted mb-6">Start writing and collaborating in seconds.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="reg-username" className="block text-sm text-ink-muted">Username</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleInputChangeUsername}
              required
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-email" className="block text-sm text-ink-muted">Email</label>
            <input
              id="reg-email"
              type="text"
              placeholder="Email"
              value={email}
              onChange={handleInputChangeEmail}
              required
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-password" className="block text-sm text-ink-muted">Password</label>
            <input
              id="reg-password"
              type="text"
              placeholder="Password"
              value={password}
              onChange={handleInputChangePassword}
              required
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-brand text-white py-2 font-medium hover:bg-brand-hover transition-colors"
          >
            Submit
          </button>
        </form>

        <div className="mt-6 text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:text-brand-hover font-medium">Login</Link>
        </div>
      </div>
    </div>
  )
}
