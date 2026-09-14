import fetchwithAuth from '../src/api/fetchwithAuth';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);

    function SelectedDocument(id) {
        navigate(`/document/${id}`)
    }

    useEffect(() => {
        async function checkSession() {
            const res = await fetchwithAuth(`${API_URL}/api/accessToken`, { method: 'POST' });
            if (!res.ok) {
                window.location.href = '/login';
            }
        }
        checkSession();

        async function FetchList() {
            const response = await fetchwithAuth(`${API_URL}/api/document`, {
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
        const response = await fetchwithAuth(`${API_URL}/api/document`, {
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
        const response = await fetch(`${API_URL}/api/logout`, {
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
        <div className="min-h-screen bg-paper">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 w-64 h-screen bg-surface border-r border-line px-5 py-6 flex flex-col">
                <span className="font-serif text-xl text-ink mb-8">Panel</span>
                <button
                    onClick={handleLogout}
                    className="mt-auto text-sm text-ink-muted hover:text-ink border border-line rounded-md px-3 py-2 transition-colors"
                >
                    Logout
                </button>
            </div>

            {/* Main content */}
            <div className="ml-64 px-10 py-8 max-w-3xl">
                <h1 className="font-serif text-3xl text-ink mb-6">Dashboard</h1>

                <div className="bg-surface border border-line rounded-lg p-5 mb-8">
                    <label htmlFor="content" className="block text-sm text-ink-muted mb-2">New document</label>
                    <textarea
                        name="description"
                        rows="5"
                        cols="30"
                        id="content"
                        placeholder="Start typing..."
                        className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                    ></textarea>
                    <button
                        onClick={createDoc}
                        className="mt-3 rounded-md bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors"
                    >
                        Create
                    </button>
                </div>

                <h2 className="text-sm font-medium text-ink-muted uppercase tracking-wide mb-3">Your documents</h2>
                <ul className="divide-y divide-line border border-line rounded-lg bg-surface overflow-hidden">
                    {documents.map((doc) => (
                        <li key={doc._id}>
                            <button
                                onClick={() => SelectedDocument(doc._id)}
                                className="w-full text-left px-4 py-3 text-ink hover:bg-brand-soft transition-colors"
                            >
                                {doc.title}
                            </button>
                        </li>
                    ))}
                    {documents.length === 0 && (
                        <li className="px-4 py-6 text-sm text-ink-muted text-center">No documents yet.</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
