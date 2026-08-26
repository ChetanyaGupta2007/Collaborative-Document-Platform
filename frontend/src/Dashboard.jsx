import fetchwithAuth from '../src/api/fetchwithAuth';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);

    function SelectedDocument(id) {
        navigate(`/document/${id}`)
    }

    useEffect(() => {
        async function checkSession() {
            const res = await fetchwithAuth('http://localhost:4000/api/accessToken', { method: 'POST' });
            if (!res.ok) {
                window.location.href = '/login';
            }
        }
        checkSession();

        async function FetchList() {
            const response = await fetchwithAuth('http://localhost:4000/api/document', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (response.ok) {
                const lists = await response.json();
                setDocuments(lists.documents);
            }
        }
        FetchList();
    }, [])

    async function createDoc() {
        const content = document.getElementById("content").value;
        const response = await fetchwithAuth('http://localhost:4000/api/document', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content })
        })
        if (response.status === 201) {
            const serverResponse = await response.json();
            navigate(`/document/${serverResponse._id}`)
        }
    };

    async function handleLogout() {
        const response = await fetch('http://localhost:4000/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${localStorage.getItem('existingAccessToken')}`
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
            <div style={{ position: "fixed", left: 0, top: 0, width: "250px", height: "10vh" }}>Panel</div>

            <button onClick={createDoc}>Create</button>
            <textarea name="description" rows="5" cols="30" id='content'></textarea>

            <ul style={{color : "black"}}> 
                {documents.map((doc) => (
                    <li key={doc._id}>
                        <button onClick={() => SelectedDocument(doc._id)}>{doc.title}</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}