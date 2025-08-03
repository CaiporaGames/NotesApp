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
  const navigate = useNavigate();

  useEffect(() => {
    async function loadNotes() {
      const { data: user, error } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        navigate('/');
        return;
      }

      const res = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'x-user-id': user.user.id,
        },
      });

      const json = await res.json();
      setNotes(json);
      setLoading(false);
    }

    loadNotes();
  }, [navigate]);

  return (
    <div className="notes-page">
      <h1>Your Notes</h1>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
