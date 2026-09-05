import { useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fetchwithAuth from '../src/api/fetchwithAuth';
export default function VersionHistory(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [versionHistory, setVersionHistory] = useState([]);
    useEffect(( ) =>{
        const fetchVersionHistory = async ()=>{
            const response = await fetchwithAuth(`http://localhost:4000/api/document/${id}/version`,{
                method : 'GET',
                headers : {'Content-Type' : 'application/json'}
            });
            const data = await response.json();
            setVersionHistory(data);
        }
        fetchVersionHistory();
    }, [id]);
    const handleRestore = async (version) => {
        const response = await fetchwithAuth(`http://localhost:4000/api/version/restore/${id}/${version}`, {
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
        <div>
            <h1>Version History</h1>
            <ul>
                {versionHistory.map((version) => (
                    <li key={version.version}>
                        <strong>{version.createdBy}</strong> - {version.createdAt} - Version {version.version}
                        <button onClick={() => handleRestore(version.version)}>restore</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}