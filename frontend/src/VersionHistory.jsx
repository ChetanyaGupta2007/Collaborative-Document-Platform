import { useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fetchwithAuth from '../src/api/fetchwithAuth';
const API_URL = import.meta.env.VITE_API_URL;
export default function VersionHistory(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [versionHistory, setVersionHistory] = useState([]);
    useEffect(( ) =>{
        const fetchVersionHistory = async ()=>{
            const response = await fetchwithAuth(`${API_URL}/api/document/${id}/version`,{
                method : 'GET',
                headers : {'Content-Type' : 'application/json'}
            });
            const data = await response.json();
            setVersionHistory(data);
        }
        fetchVersionHistory();
    }, [id]);
    const handleRestore = async (version) => {
        const response = await fetchwithAuth(`${API_URL}/api/version/restore/${id}/${version}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        if (response.ok){
            console.log("Version restored successfully");
            navigate(`/document/${id}`);
        }
        
        // Handle the response, e.g., update the UI or show a success message
    };

    return (
        <div className="min-h-screen bg-paper px-10 py-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(`/document/${id}`)}
                    className="text-sm text-ink-muted hover:text-ink mb-4"
                >
                    &larr; Back to document
                </button>
                <h1 className="font-serif text-3xl text-ink mb-6">Version history</h1>

                <ul className="divide-y divide-line border border-line rounded-lg bg-surface overflow-hidden">
                    {versionHistory.map((version) => (
                        <li key={version.version} className="flex items-center justify-between px-4 py-3">
                            <div>
                                <p className="text-ink">
                                    <span className="font-medium">{version.createdBy}</span>
                                    <span className="text-ink-muted"> &middot; {version.createdAt} &middot; Version {version.version}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleRestore(version.version)}
                                className="text-sm rounded-md border border-line px-3 py-1.5 text-ink hover:bg-brand-soft hover:border-brand transition-colors"
                            >
                                Restore
                            </button>
                        </li>
                    ))}
                    {versionHistory.length === 0 && (
                        <li className="px-4 py-6 text-sm text-ink-muted text-center">No versions yet.</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
