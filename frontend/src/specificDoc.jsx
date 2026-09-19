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

    const [shareStatus, setShareStatus] = useState("");

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

        const serverResponse = await responseAccess.json().catch(() => null);

        if (responseAccess.ok) {
            console.log("Shared To another user");
            setShareStatus(`Shared with ${email}`);
            setEmail('');
        } else {
            setShareStatus(serverResponse?.message || "Failed to share document");
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

            await SaveVersion(id);

        }
    }


    // SAVE VERSION (checkpoint snapshot)
    async function SaveVersion(id) {

        const content = editor.getJSON();

        const response = await fetchwithAuth(
            `${API_URL}/api/document/${id}/version`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content
                })
            }
        );

        if (response.ok) {

            console.log("Version Saved");

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
        <div className="min-h-screen bg-paper">
            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-surface border-b border-line px-6 py-3 flex items-center justify-between">
                <input
                    id="title"
                    value={title}
                    onChange={(e) => settitle(e.target.value)}
                    placeholder="Untitled document"
                    className="font-serif text-xl text-ink bg-transparent focus:outline-none focus:border-b focus:border-brand px-1"
                />

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { SendNewElements(id); }}
                        className="rounded-md bg-brand text-white px-4 py-1.5 text-sm font-medium hover:bg-brand-hover transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => { SaveVersion(id); }}
                        className="rounded-md border border-line px-4 py-1.5 text-sm text-ink hover:bg-brand-soft transition-colors"
                    >
                        Save Version
                    </button>
                    <button
                        onClick={() => { navigate(`/version/${id}`); }}
                        className="rounded-md border border-line px-4 py-1.5 text-sm text-ink hover:bg-brand-soft transition-colors"
                    >
                        View versions
                    </button>
                    <button
                        onClick={() => { DeleteDoc(id); }}
                        className="rounded-md border border-red-200 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
                {/* Editor column */}
                <div>
                    {editor && (
                        <div className="flex gap-1 mb-3 border border-line bg-surface rounded-md p-1 w-fit">
                            <button
                                className={`px-3 py-1.5 rounded text-sm ${editor.isActive('bold') ? 'bg-brand-soft text-brand font-semibold' : 'text-ink hover:bg-brand-soft'}`}
                                onClick={() => editor.chain().focus().toggleBold().run()}
                            >
                                Bold
                            </button>

                            <button
                                className={`px-3 py-1.5 rounded text-sm italic ${editor.isActive('italic') ? 'bg-brand-soft text-brand font-semibold' : 'text-ink hover:bg-brand-soft'}`}
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                            >
                                Italic
                            </button>

                            <button
                                className="px-3 py-1.5 rounded text-sm text-ink hover:bg-brand-soft"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            >
                                H1
                            </button>
                        </div>
                    )}

                    <div className="bg-surface border border-line rounded-lg min-h-[60vh] px-8 py-6 font-serif text-ink text-lg leading-relaxed [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:mb-3 focus-within:ring-2 focus-within:ring-brand">
                        <EditorContent editor={editor} />
                    </div>

                    {typingUser && (
                        <p className="mt-2 text-sm text-ink-muted italic">{typingUser} is typing...</p>
                    )}
                </div>

                {/* Sidebar: presence + share */}
                <div className="space-y-6">
                    <div className="bg-surface border border-line rounded-lg p-4">
                        <h2 className="text-sm font-medium text-ink-muted uppercase tracking-wide mb-3">Online now</h2>
                        <ul className="space-y-1">
                            {usersonline.map((users) => (
                                <li key={users} className="flex items-center gap-2 text-sm text-ink">
                                    <span className="w-2 h-2 rounded-full bg-brand" />
                                    {users}
                                </li>
                            ))}
                            {usersonline.length === 0 && (
                                <li className="text-sm text-ink-muted">No one else here yet.</li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-surface border border-line rounded-lg p-4">
                        <h2 className="font-serif text-lg text-ink mb-3">Share</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="email"
                                value={email}
                                onChange={handleInputChangeEmail}
                                required
                                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                            />

                            <select
                                name="role"
                                id="role"
                                onChange={(e) => { setRole(e.target.value); }}
                                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                            </select>

                            <button
                                type="submit"
                                className="w-full rounded-md bg-brand text-white py-2 text-sm font-medium hover:bg-brand-hover transition-colors"
                            >
                                Share
                            </button>

                            {shareStatus && (
                                <p className="text-sm text-ink-muted">{shareStatus}</p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}