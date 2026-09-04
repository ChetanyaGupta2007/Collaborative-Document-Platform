import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import fetchwithAuth from '../src/api/fetchwithAuth';
import { io } from 'socket.io-client';

export default function SpecificDoc() {
    const accessToken = localStorage.getItem('existingAccessToken');
    const [title, settitle] = useState("");
    const [documentContent, setDocumentContent] = useState(null);
    const [usersonline,setusersonline]= useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    const [, forceRerender] = useState(0);

    const socketRef = useRef(null);
    const Timeout = useRef(null);
    const pendingUpdateRef = useRef(null);
    const isApplyingRemote = useRef(false);
    const editorRef = useRef(null);
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);
    const [email, setEmail] = useState('');
    const handleInputChangeEmail = (e) => {
          setEmail(e.target.value);
        };
    const [role, setRole] = useState("");
    const handleSubmit = async (e) => {
            e.preventDefault();
            console.log("share request")
            const responseAccess = await fetchwithAuth('http://localhost:4000/api/document/collaborator', {
                    method : 'POST',
                    headers : {
                        'Content-Type' : 'application/json'
                    }, 
                    body : JSON.stringify({email,role,id})
                })
            if(responseAccess.ok){
                console.log("Shared To another user")
            }    
            }

    const editor = useEditor({
        extensions: [StarterKit],
        content: "",

        onSelectionUpdate: () => {
            forceRerender(n => n + 1);
        },

        onTransaction: () => {
            forceRerender(n => n + 1);

            if (isApplyingRemote.current) return;
            socketRef.current?.emit('typing', { id });

            clearTimeout(Timeout.current);

            Timeout.current = setTimeout(() => {
                const content = editor.getJSON();
                socketRef.current?.emit('send_changes', { id, content });
            }, 300);
        },

        onBlur: () => {
            if (pendingUpdateRef.current) {
                isApplyingRemote.current = true;
                editor.commands.setContent(pendingUpdateRef.current);
                isApplyingRemote.current = false;
                pendingUpdateRef.current = null;
            }
        },
    });

    // CHANGE 1: dedicated, single-purpose sync — editorRef always mirrors editor
    useEffect(() => {
        editorRef.current = editor;
    }, [editor]);

    useEffect(() => {
        const socket = io("http://localhost:4000",{ auth: { token: accessToken } });
        socketRef.current = socket;

        async function checkSession() {
            const res = await fetchwithAuth('http://localhost:4000/api/accessToken', {
                method: 'POST'
            });
            if (!res.ok) {
                window.location.href = '/login';
            }
        }

        checkSession();

        socket.emit('join_document', { id });
        socket.on('user_joined',(data) => {
            alert(`${data.username} joined`)
            setusersonline(prev =>
    prev.includes(data.username) ? prev : [...prev, data.username]
);
        })
        socket.on('current_viewers' ,(data) => {
            setusersonline(data.usernames);

        })
        socket.on('typing', (data) => {
            setTypingUser(data.username);

            clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(() => {
                setTypingUser(null);
            }, 2000);
        });

        socket.on('user_left', (data) => {
    setusersonline(prev => prev.filter(name => name !== data.username));
});
        socket.on('receive_messages', (data) => {
            // CHANGE 3: optional chaining added on every editorRef.current access
            if (editorRef.current?.isFocused) {
                pendingUpdateRef.current = data;
            } else {
                isApplyingRemote.current = true;
                editorRef.current?.commands.setContent(data);
                isApplyingRemote.current = false;
            }
        });
        socket.on("error", (data) => {
    console.log(data.message);
});

        return () => {
            socket.emit("leave_document", { id });
        };
    }, []);

    useEffect(() => {
        async function GetDocument() {
            const response = await fetchwithAuth(
                `http://localhost:4000/api/document/${id}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            const data = await response.json();
            if (response.ok) {
                settitle(data.doc.title);
                setDocumentContent(data.doc.content);
            }
            if (response.status === 404) {
                console.log(data.message);
                navigate('/dashboard');
            }
        }
        GetDocument();
    }, [id]);

            useEffect(() => {
            if (editor && documentContent !== null) {
                isApplyingRemote.current = true;

                editor.commands.setContent(documentContent);

                isApplyingRemote.current = false;
            }
        }, [editor, documentContent]);

    async function SendNewElements(id) {
        const content = editor.getJSON();
        const response = await fetchwithAuth(`http://localhost:4000/api/document/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, title })
        });
        if (response.ok) {
            console.log("Document Saved");
        }
    }

    async function DeleteDoc(id) {
        const response = await fetchwithAuth(`http://localhost:4000/api/document/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            console.log("Document Deleted");
            settitle("");
            setDocumentContent(null);
            if (editor) {
                editor.commands.setContent("");
            }
            navigate('/dashboard');
        }
    }
    

    return <>
        <h1>YOUR DOCUMENT</h1>
        <textarea id="title" value={title} onChange={(e) => settitle(e.target.value)}></textarea>
        <EditorContent editor={editor} />
        {editor && (
            <div>
                <button style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal' }}
                    onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
                <button style={{ fontStyle: editor.isActive('italic') ? 'italic' : 'normal' }}
                    onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
            </div>
        )}
        <button onClick={() => { SendNewElements(id); }}>Save</button>
        <button onClick={() => { DeleteDoc(id); }}>Delete</button>
        <ul style={{color : "black"}}> 
            {usersonline.map((users) => (
                <li key={users}>{users}</li>
            ))}
            </ul>
        {typingUser && (
    <p>{typingUser} is typing...</p>
    
)}    
    <div>
        <br /> <h1> SHARE </h1>
    <form onSubmit={handleSubmit}>
    <input type = "text" placeholder="email" value={email} onChange={handleInputChangeEmail} required></input>
    <select name="role" id="role" onChange={(e)=>{setRole(e.target.value)}}>
        <option value="viewer">Viewer</option>
        <option value="editor">editor</option>
    </select>
    <button type="submit">Share</button>
    
    </form>

    </div>
    </>;
}