import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import '../styles/NotesPage.css';

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
    
  useEffect(() => {
    async function loadNotes() {
      const { data: user, error } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        navigate('/');
        return;
      }
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('http://localhost:5000/api/notes', {
    headers: {
        'Authorization': `Bearer ${session?.access_token}`
    },
    });

      const json = await res.json();
      setNotes(json);
      setLoading(false);
    }

    loadNotes();
  }, [navigate]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return;
 const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('http://localhost:5000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ title, content }),
    });

    const newNote = await res.json();
    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
  }

  async function handleDeleteNote(id: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return;
 const { data: { session } } = await supabase.auth.getSession();
    await fetch(`http://localhost:5000/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
         'Authorization': `Bearer ${session?.access_token}`
      },
    });

    setNotes(notes.filter((note) => note.id !== id));
  }

  return (
    <div className="notes-page">
      <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
        Logout
      </button>
      <h1>Your Notes</h1>
      <form onSubmit={handleAddNote} className="note-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        ></textarea>
        <button type="submit">Add Note</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <small>{new Date(note.created_at).toLocaleString()}</small>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
