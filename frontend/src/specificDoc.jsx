//write here
import { useEffect,useState } from 'react'
import { useParams,useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import fetchwithAuth from '../src/api/fetchwithAuth';
export default function SpecificDoc(){
    const [title,settitle] = useState("");
    
    
    const {id} = useParams();
    const navigate = useNavigate();
    const [, forceRerender] = useState(0);

const editor = useEditor({
    extensions: [StarterKit],
    content: "",

    onSelectionUpdate: () => {
        forceRerender(n => n + 1);
    },

    onTransaction: () => {
        forceRerender(n => n + 1);
    },
});
    
    
    useEffect(() => {
            async function checkSession() {
                const res = await fetchwithAuth('http://localhost:4000/api/accessToken', { method: 'POST' });
                if (!res.ok) {
                    window.location.href = '/login';
                }
            }
            checkSession();
            async function GetDocument(id) {
             
            const response = await fetchwithAuth(`http://localhost:4000/api/document/${id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                        const data = await response.json();
                        if (response.ok) {
                            settitle(data.doc.title);
                            if (editor) {
                                editor.commands.setContent(data.doc.content);
                            }
                        }
                        
                        if (response.status === 404) {
                            console.log(data.message);
                            navigate('/dashboard');
                        }
        }

        GetDocument(id);
        },[])

        async function SendNewElements(id){
            const content = editor.getJSON()
            const response = await fetchwithAuth(`http://localhost:4000/api/document/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(
                                {content,title})
                        })
            if(response.ok){
                console.log("Document Saved");

            }    
        };
        async function DeleteDoc(id){
            const response = await fetchwithAuth(`http://localhost:4000/api/document/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            
                        })
                        if (response.ok) {
                            console.log("Document Deleted")
                            settitle("");
                            if (editor) {
                                editor.commands.setContent("");
                            }
                            navigate('/dashboard')
                        }
        }

        
return <>
                            <h1>YOUR DOCUMENT</h1>
                            <textarea
                                id="title"
                                value={title}
                                onChange={(e) => settitle(e.target.value)}
                            ></textarea>
                            <EditorContent editor={editor} />
                            {editor && ( 
                                <div> 
                                    <button style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal' }} onClick={() => editor.chain().focus().toggleBold().run() } > Bold 
                                    </button> 
                                    <button style={{ fontStyle: editor.isActive('italic') ? 'italic' : 'normal' }} onClick={() => editor.chain().focus().toggleItalic().run() } > Italic 
                                    </button> 
                                    <button onClick={() => editor .chain() .focus() .toggleHeading({ level: 1 }) .run() } > H1 </button> 
                                    </div> )} 

                            
                            <button onClick={()=>{SendNewElements(id)}}>Save</button>
                            <button onClick={()=>{DeleteDoc(id)}}>Delete</button>
                            
                            </>
};
