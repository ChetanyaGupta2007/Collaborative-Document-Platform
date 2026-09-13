
import { useEffect, useState, useRef } from 'react';

import * as Y from 'yjs';
import { useParams, useNavigate } from 'react-router-dom';

import { useEditor, EditorContent } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';

import fetchwithAuth from '../src/api/fetchwithAuth';
import Collaboration from '@tiptap/extension-collaboration';

import { io } from 'socket.io-client';
const INCOMING_UPDATE = "incoming";
const API_URL = import.meta.env.VITE_API_URL;
export default function SpecificDoc() {

    const accessToken = localStorage.getItem('existingAccessToken');

    const [title, settitle] = useState("");

    

    const [usersonline, setusersonline] = useState([]);

    const { id } = useParams();

    const navigate = useNavigate();

    const [, forceRerender] = useState(0);

    const socketRef = useRef(null);



    const isRemoteTransaction = useRef(false);

    const editorRef = useRef(null);

    const [typingUser, setTypingUser] = useState(null);

    const typingTimeoutRef = useRef(null);

    const [email, setEmail] = useState('');
    const [ydoc] = useState(() => new Y.Doc());
    const handleInputChangeEmail = (e) => {
        setEmail(e.target.value);
    };

    const [role, setRole] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("share request");

        const responseAccess = await fetchwithAuth(
            `${API_URL}/api/document/collaborator`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, role, id })
            }
        );

        if (responseAccess.ok) {
            console.log("Shared To another user");
        }
    };

    const editor = useEditor({
        extensions: [StarterKit.configure({
            history: false,
        }), Collaboration.configure({document: ydoc})],


        onSelectionUpdate: () => {
            forceRerender(n => n + 1);
        },

        onTransaction: () => {
            forceRerender(n => n + 1);

            if (isRemoteTransaction.current) return;
             // Don't treat initialization/early local changes as edits
        // until the real document has been loaded into the editor.
            socketRef.current?.emit('typing', { id });
        },

            
        
    });

    // editorRef always mirrors editor
    useEffect(() => {
        editorRef.current = editor;
    }, [editor]);


    // SOCKET CONNECTION
    useEffect(() => {

        // Frontend 5173 → Backend 4000
        // Frontend 5174 → Backend 4001

        

        const socket = io(API_URL, {
            auth: {
                token: accessToken
            }
        });

        socketRef.current = socket;


        // HTTP API REMAINS ON 4000
        async function checkSession() {

            const res = await fetchwithAuth(
                `${API_URL}/api/accessToken`,
                {
                    method: 'POST'
                }
            );

            if (!res.ok) {
                window.location.href = '/login';
            }
        }

        checkSession();


        // JOIN DOCUMENT
        socket.emit('join_document', { id },(response)=> {
            if(!response.ok){
                console.log(response.error);
                return navigate('/dashboard');
            }
            isRemoteTransaction.current = true;

            Y.applyUpdate(
                ydoc,
                response.data,
                INCOMING_UPDATE
            );

            isRemoteTransaction.current = false;
        });


        // USER JOINED
        socket.on('user_joined', (data) => {

            alert(`${data.username} joined`);

            setusersonline(prev =>
                prev.includes(data.username)
                    ? prev
                    : [...prev, data.username]
            );
        });


        // CURRENT VIEWERS
        socket.on('current_viewers', (data) => {

            setusersonline(data.usernames);

        });


        // TYPING
        socket.on('typing', (data) => {

            setTypingUser(data.username);

            clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(() => {
                setTypingUser(null);
            }, 2000);
        });

        socket.on('yjs-update', (update) => {
            // Handle yjs-update event
            isRemoteTransaction.current = true ; 
            Y.applyUpdate(ydoc, update, INCOMING_UPDATE) ; 
            isRemoteTransaction.current = false;
        });
        ydoc.on("update", (update, origin) => {
    // send update through Socket.IO
    if (origin === INCOMING_UPDATE) return; 
    socketRef.current?.emit('yjs-update', update); 
});

        // USER LEFT
        socket.on('user_left', (data) => {

            setusersonline(prev =>
                prev.filter(name => name !== data.username)
            );
        });


        // VERSION RESTORED
        socket.on('version-restored', (data) => {

            isRemoteTransaction.current = true;

             Y.applyUpdate(
                ydoc,
                data.update,
                INCOMING_UPDATE
            );

            isRemoteTransaction.current = false;
        });


        // RECEIVE CHANGES
        


        // SOCKET ERROR
        socket.on("error", (data) => {

            console.log(data.message);

        });


        // CLEANUP
        return () => {

            socket.emit("leave_document", { id });

        };

    }, []);


    // GET DOCUMENT
    useEffect(() => {
        async function GetDocument() {

            const response = await fetchwithAuth(
                `${API_URL}/api/document/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {

                settitle(data.doc.title);

                
            }

            if (response.status === 404) {

                console.log(data.message);

                navigate('/dashboard');
            }
        }

        GetDocument();

    }, [id]);


    


    // SAVE DOCUMENT
    async function SendNewElements(id) {

        const content = editor.getJSON();

        const response = await fetchwithAuth(
            `${API_URL}/api/document/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    title
                })
            }
        );

        if (response.ok) {

            console.log("Document Saved");

        }
    }


    // DELETE DOCUMENT
    async function DeleteDoc(id) {

        const response = await fetchwithAuth(
            `${API_URL}/api/document/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        );

        if (response.ok) {

            console.log("Document Deleted");

            settitle("");


            

            navigate('/dashboard');
        }
    }


    return (
        <>
            <h1>YOUR DOCUMENT</h1>

            <textarea
                id="title"
                value={title}
                onChange={(e) => settitle(e.target.value)}
            />

            <EditorContent editor={editor} />

            {editor && (
                <div>

                    <button
                        style={{
                            fontWeight: editor.isActive('bold')
                                ? 'bold'
                                : 'normal'
                        }}
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                    >
                        Bold
                    </button>

                    <button
                        style={{
                            fontStyle: editor.isActive('italic')
                                ? 'italic'
                                : 'normal'
                        }}
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                    >
                        Italic
                    </button>

                    <button
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                    >
                        H1
                    </button>

                </div>
            )}

            <button onClick={() => {
                SendNewElements(id);
            }}>
                Save
            </button>

            <button onClick={() => {
                navigate(`/version/${id}`);
            }}>
                View Versions
            </button>

            <button onClick={() => {
                DeleteDoc(id);
            }}>
                Delete
            </button>


            <ul style={{ color: "black" }}>

                {usersonline.map((users) => (

                    <li key={users}>
                        {users}
                    </li>

                ))}

            </ul>


            {typingUser && (
                <p>
                    {typingUser} is typing...
                </p>
            )}


            <div>

                <br />

                <h1>SHARE</h1>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="email"
                        value={email}
                        onChange={handleInputChangeEmail}
                        required
                    />

                    <select
                        name="role"
                        id="role"
                        onChange={(e) => {
                            setRole(e.target.value);
                        }}
                    >
                        <option value="viewer">
                            Viewer
                        </option>

                        <option value="editor">
                            editor
                        </option>

                    </select>

                    <button type="submit">
                        Share
                    </button>

                </form>

            </div>

        </>
    );
}
