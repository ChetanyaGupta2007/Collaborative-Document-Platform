import { useState } from 'react'
import './login.jsx'
import { useNavigate,Link } from 'react-router-dom';

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
      const response = await fetch('http://localhost:4000/api/register', {
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
    <>
      <div> <form onSubmit={handleSubmit}>
        <input type = "text" placeholder = "Username" value={username} onChange={handleInputChangeUsername} required></input>
        <input type = "text" placeholder = "Email" value={email} onChange={handleInputChangeEmail} required></input>
        <input type = "text" placeholder = "Password" value={password} onChange={handleInputChangePassword} required></input>
        <button type="submit">Submit</button>
        </form>
        </div>
        <div>
          <Link to="/login">Login</Link>
        </div>

      
    </>
  )
}