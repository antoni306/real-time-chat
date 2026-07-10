import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { createSocket } from '../lib/socket';
import { api } from '../lib/api';

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<'connecting' | 'joined' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    setMessages([]);
    setStatus('connecting');
    setErrorMsg(null);

    const socket = createSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on('connect', () => {
      socket.emit('joinConversation', { conversationId });
      setStatus('joined');
      setErrorMsg(null);
    });

    socket.on('newMessage', (payload: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === payload.id) ? prev : [...prev, payload]));
    });

    api
      .getMessages(conversationId)
      .then((history) => {
        setMessages((prev) => {
          const merged = [...history, ...prev.filter((m) => !history.some((h) => h.id === m.id))];
          return merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        });
      })
      .catch(() => {});

    socket.on('error', (payload: { message: string }) => {
      setStatus('error');
      setErrorMsg(payload.message);
    });

    socket.on('connect_error', (err: Error) => {
      setStatus('error');
      setErrorMsg(err.message);
    });

    socket.on('disconnect', () => {
      setStatus('connecting');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !socketRef.current || !conversationId) return;
    socketRef.current.emit('sendMessage', { conversationId, message: draft.trim() });
    setDraft('');
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <Link to="/">← Panel</Link>
        <span className={`status status-${status}`}>
          {status === 'joined' && 'Połączono'}
          {status === 'connecting' && 'Łączenie…'}
          {status === 'error' && 'Błąd'}
        </span>
      </header>

      {errorMsg && <p className="error">{errorMsg}</p>}

      <div className="message-list">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.senderId === user?.id ? 'mine' : 'theirs'}`}>
            <span className="sender">{m.senderId === user?.id ? 'Ty' : m.senderId.slice(0, 8)}</span>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      <form className="message-form" onSubmit={handleSend}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Napisz wiadomość…" />
        <button type="submit" disabled={status !== 'joined'}>
          Wyślij
        </button>
      </form>
    </div>
  );
}
