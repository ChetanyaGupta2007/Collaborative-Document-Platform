import { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchwithAuth from '../src/api/fetchwithAuth';
const API_URL = import.meta.env.VITE_API_URL;


export default function Login(){
    
        const [username, setUsername] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const navigate = useNavigate();

        useEffect(() => {
            async function checkSession() {
                const res = await fetchwithAuth(`${API_URL}/api/accessToken`, { method: 'POST' });
                if (res.ok) {
                    navigate('/dashboard');
                }
            }
            checkSession();
        }, []);

        
    
        const handleInputChangeUsername = (e) => {
          setUsername(e.target.value);
        };
    
        const handleInputChangeEmail = (e) => {
          setEmail(e.target.value);
        };
    
        const handleInputChangePassword = (e) => {
          setPassword(e.target.value);
        };
        
        const handleSubmit = async (e) => {
                e.preventDefault();
                console.log('Form login initiated(f)', { username, email, password });
                const responseLogin = await fetch(`${API_URL}/api/login`, {
                    method : 'POST',
                    headers : {
                        'Content-Type' : 'application/json'
                    }, 
                    body : JSON.stringify({username,email,password})
                })
                const serverResponse = await responseLogin.json();
                if (responseLogin.ok){
                    localStorage.setItem('existingAccessToken', serverResponse.accessToken);
                    localStorage.setItem('existingRefreshToken', serverResponse.refreshToken);
                    navigate('/dashboard')
                }
                console.log(serverResponse);
            }

    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm bg-surface border border-line rounded-lg p-8 shadow-sm">
          <h1 className="font-serif text-3xl text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-ink-muted mb-6">Log in to keep editing where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="login-username" className="block text-sm text-ink-muted">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleInputChangeUsername}
                required
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="login-email" className="block text-sm text-ink-muted">Email</label>
              <input
                id="login-email"
                type="text"
                placeholder="Email"
                value={email}
                onChange={handleInputChangeEmail}
                required
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="login-password" className="block text-sm text-ink-muted">Password</label>
              <input
                id="login-password"
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
        </div>
      </div>
    )
}
