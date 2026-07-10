import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type ConversationResponse, type UserSummary } from '../lib/api';

function conversationLabel(conversation: ConversationResponse, currentUserId: string): string {
  if (conversation.type === 'GROUP') return conversation.name ?? 'Grupa';
  const other = conversation.participants.find((p) => p.id !== currentUserId);
  return other?.username ?? 'Nieznany rozmówca';
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [type, setType] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [name, setName] = useState('');
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getConversations().then(setConversations).catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    api.getAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
  }, []);

  function handleTypeChange(nextType: 'DIRECT' | 'GROUP') {
    setType(nextType);
    setSelected([]);
  }

  function addParticipant(candidate: UserSummary) {
    setSelected((prev) => {
      if (prev.some((p) => p.id === candidate.id)) return prev;
      return type === 'DIRECT' ? [candidate] : [...prev, candidate];
    });
    setSearch('');
  }

  function removeParticipant(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  const searchResults =
    search.trim().length === 0
      ? []
      : allUsers
          .filter((u) => u.id !== user?.id)
          .filter((u) => !selected.some((s) => s.id === u.id))
          .filter((u) => u.username.toLowerCase().includes(search.trim().toLowerCase()))
          .slice(0, 8);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      if (selected.length === 0) {
        throw new Error('Wybierz co najmniej jednego rozmówcę');
      }
      if (type === 'DIRECT' && selected.length !== 1) {
        throw new Error('Konwersacja prywatna wymaga dokładnie jednego rozmówcy');
      }

      const conversation = await api.createConversation({
        type,
        name: type === 'GROUP' ? name : undefined,
        participantsIds: selected.map((p) => p.id),
      });

      navigate(`/chat/${conversation.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Cześć, {user?.username}</h1>
        <button onClick={() => void logout()}>Wyloguj</button>
      </header>

      <section className="panel">
        <h2>Nowa konwersacja</h2>
        <form onSubmit={handleCreate} className="create-form">
          <label>
            Typ
            <select value={type} onChange={(e) => handleTypeChange(e.target.value as 'DIRECT' | 'GROUP')}>
              <option value="DIRECT">Prywatna (1 na 1)</option>
              <option value="GROUP">Grupowa</option>
            </select>
          </label>
          {type === 'GROUP' && (
            <label>
              Nazwa grupy
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          )}

          <label>
            {type === 'DIRECT' ? 'Znajdź rozmówcę' : 'Znajdź uczestników'}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Wpisz nazwę użytkownika…"
            />
          </label>

          {searchResults.length > 0 && (
            <ul className="user-result-list">
              {searchResults.map((u) => (
                <li key={u.id} className="user-result-item">
                  <span>{u.username}</span>
                  <button type="button" onClick={() => addParticipant(u)}>
                    Dodaj
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected.length > 0 && (
            <ul className="chip-list">
              {selected.map((p) => (
                <li key={p.id} className="chip">
                  {p.username}
                  <button type="button" className="chip-remove" onClick={() => removeParticipant(p.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Tworzenie…' : 'Utwórz konwersację'}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Twoje konwersacje</h2>
        {conversations.length === 0 && <p className="hint">Nie masz jeszcze żadnych konwersacji.</p>}
        <ul className="conversation-list">
          {conversations.map((c) => (
            <li key={c.id}>
              <button className="conversation-link" onClick={() => navigate(`/chat/${c.id}`)}>
                <span className="badge">{c.type === 'GROUP' ? 'Grupa' : 'Prywatna'}</span>{' '}
                {user ? conversationLabel(c, user.id) : c.id}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
