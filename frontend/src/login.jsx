import { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchwithAuth from '../src/api/fetchwithAuth';


export default function Login(){
    
        const [username, setUsername] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const navigate = useNavigate();

        useEffect(() => {
            async function checkSession() {
                const res = await fetchwithAuth('http://localhost:4000/api/accessToken', { method: 'POST' });
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
                const responseLogin = await fetch('http://localhost:4000/api/login', {
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

    return (<>
    <div>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
            <input type = "text" placeholder = "Username" value={username} onChange={handleInputChangeUsername} required></input>
        <input type = "text" placeholder = "Email" value={email} onChange={handleInputChangeEmail} required></input>
        <input type = "text" placeholder = "Password" value={password} onChange={handleInputChangePassword} required></input>
        <button type="submit">Submit</button>
        </form>
        </div>

        </>
    )
}
