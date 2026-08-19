
//import { Link } from 'react-router-dom';

export default function Dashboard() {
    async function handleLogout() {
        const response = await fetch('http://localhost:4000/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization : `Bearer ${localStorage.getItem('existingAccessToken')}`
            },
        });
        const serverResponse = await response.json();
        console.log(serverResponse);
        localStorage.removeItem('existingAccessToken');
        localStorage.removeItem('existingRefreshToken');
        window.location.href = '/login';
    }



    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
            
        </div>
        
    )
}
