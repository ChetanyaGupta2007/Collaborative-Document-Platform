
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

    const [usersonline, setusersonline] = useState([]);

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
    const isInitialLoadComplete = useRef(false);

    const [email, setEmail] = useState('');

    const handleInputChangeEmail = (e) => {
        setEmail(e.target.value);
    };

    const [role, setRole] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("share request");

        const responseAccess = await fetchwithAuth(
            'http://localhost:4000/api/document/collaborator',
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
        extensions: [StarterKit],

        content: "",

        onSelectionUpdate: () => {
            forceRerender(n => n + 1);
        },

        onTransaction: () => {
            forceRerender(n => n + 1);

            if (isApplyingRemote.current) return;
             // Don't treat initialization/early local changes as edits
        // until the real document has been loaded into the editor.
            if (!isInitialLoadComplete.current) return;
            socketRef.current?.emit('typing', { id });

            clearTimeout(Timeout.current);

            Timeout.current = setTimeout(() => {
                const content = editor.getJSON();

                socketRef.current?.emit('send_changes', {
                    id,
                    content
                });
            }, 300);
        },

        onBlur: () => {
            if (pendingUpdateRef.current) {

                isApplyingRemote.current = true;

                editor.commands.setContent(
                    pendingUpdateRef.current
                );

                isApplyingRemote.current = false;

                pendingUpdateRef.current = null;
            }
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

        const backendURL =
            window.location.port === "5174"
                ? "http://localhost:4001"
                : "http://localhost:4000";

        const socket = io(backendURL, {
            auth: {
                token: accessToken
            }
        });

        socketRef.current = socket;


        // HTTP API REMAINS ON 4000
        async function checkSession() {

            const res = await fetchwithAuth(
                'http://localhost:4000/api/accessToken',
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
        socket.emit('join_document', { id });


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


        // USER LEFT
        socket.on('user_left', (data) => {

            setusersonline(prev =>
                prev.filter(name => name !== data.username)
            );
        });


        // VERSION RESTORED
        socket.on('version-restored', (data) => {

            isApplyingRemote.current = true;

            editorRef.current?.commands.setContent(data);

            isApplyingRemote.current = false;
        });


        // RECEIVE CHANGES
        socket.on('receive_messages', (data) => {

            if (editorRef.current?.isFocused) {

                pendingUpdateRef.current = data;

            } else {

                isApplyingRemote.current = true;

                editorRef.current?.commands.setContent(data);

                isApplyingRemote.current = false;
            }
        });


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
        isInitialLoadComplete.current = false;
        async function GetDocument() {

            const response = await fetchwithAuth(
                `http://localhost:4000/api/document/${id}`,
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

                setDocumentContent(data.doc.content);
            }

            if (response.status === 404) {

                console.log(data.message);

                navigate('/dashboard');
            }
        }

        GetDocument();

    }, [id]);


    // SET EDITOR CONTENT AFTER FETCH
    useEffect(() => {

        if (editor && documentContent !== null) {

            isApplyingRemote.current = true;

            editor.commands.setContent(documentContent);
            isInitialLoadComplete.current = true;
            isApplyingRemote.current = false;
        }

    }, [editor, documentContent]);


    // SAVE DOCUMENT
    async function SendNewElements(id) {

        const content = editor.getJSON();

        const response = await fetchwithAuth(
            `http://localhost:4000/api/document/${id}`,
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
            `http://localhost:4000/api/document/${id}`,
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

            setDocumentContent(null);

            if (editor) {

                editor.commands.setContent("");

            }

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
