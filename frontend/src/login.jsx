
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import {useNavigate} from 'react-router-dom';
export default function Login(){
        const [username, setUsername] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const navigate = useNavigate();
        const existingAccessToken = localStorage.getItem('accessToken');
        const existingRefreshToken = localStorage.getItem('refreshToken');
    
        const handleInputChangeUsername = (e) => {
          setUsername(e.target.value);
          
        };
    
        const handleInputChangeEmail = (e) => {
          setEmail( e.target.value);
          
        };
    
        const handleInputChangePassword = (e) => {
          setPassword(e.target.value);
          
        };
        function handlingSubmit(e){
        if (existingAccessToken && existingRefreshToken) {
            function secondTimeLogin(){
                const handleSubmit = async (e) => {
                e.preventDefault();
                console.log('Form login initiated(s)', { username, email, password });
                const response = await fetch('http://localhost:4000/api/login', {
                    method : 'POST',
                    headers : {
                        'Authorization' : `bearer ${existingAccessToken}`,
                        'Content-Type' : 'application/json'
                    },
                    body : JSON.stringify({username,email,password,existingRefreshToken})
                })
                const serverResponse = await response.json();
                console.log(serverResponse);
                if (serverResponse.accessGrant) {
                    localStorage.setItem('existingAccessToken', serverResponse.accessToken);
                    localStorage.setItem('existingRefreshToken', serverResponse.refreshToken);
                    navigate('/dashboard')
                
            }
        }
handleSubmit(e)    };
      secondTimeLogin()  } 
      
      else {
            function firstTimeLogin(){
                const handleSubmit = async (e) => {
                e.preventDefault();
                console.log('Form login initiated(f)', { username, email, password });
                const response = await fetch('http://localhost:4000/api/login', {
                    method : 'POST',
                    headers : {
                        'Content-Type' : 'application/json'
                    },
                    body : JSON.stringify({username,email,password})
                })
                const serverResponse = await response.json();
                console.log(serverResponse);
                if (serverResponse.accessGrant) {

                    localStorage.setItem('existingAccessToken', serverResponse.accessToken);
                    localStorage.setItem('existingRefreshToken', serverResponse.refreshToken);
                    navigate('/dashboard')
                
            }
        }
handleSubmit(e)  };
      firstTimeLogin()  }
        

    }    

    return (<>
    <div>
        <h1>Login</h1>
        <form onSubmit={handlingSubmit}>
            <input type = "text" placeholder = "Username" value={username} onChange={handleInputChangeUsername} required></input>
        <input type = "text" placeholder = "Email" value={email} onChange={handleInputChangeEmail} required></input>
        <input type = "text" placeholder = "Password" value={password} onChange={handleInputChangePassword} required></input>
        <button type="submit">Submit</button>
        </form>
        </div>

        </>
    )
}
