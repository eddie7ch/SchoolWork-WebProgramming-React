import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom/ChatRoom.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './ChatPage.css';

const PRESET_ROOMS = [
  { id: 'general', label: '# general', description: 'General market discussion' },
  { id: 'aapl', label: '# AAPL', description: 'Apple Inc.' },
  { id: 'msft', label: '# MSFT', description: 'Microsoft' },
  { id: 'tsla', label: '# TSLA', description: 'Tesla Inc.' },
  { id: 'nvda', label: '# NVDA', description: 'NVIDIA' },
  { id: 'crypto', label: '# crypto', description: 'Crypto & digital assets' },
];

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState('general');
  const [customRoom, setCustomRoom] = useState('');

  const currentRoom = PRESET_ROOMS.find((r) => r.id === activeRoom);

  function handleCustomRoom(e) {
    e.preventDefault();
    const room = customRoom.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!room) return;
    setActiveRoom(room);
    setCustomRoom('');
  }

  if (!user) {
    return (
      <main className="chat-page">
        <h1 className="page-title">Chat Rooms</h1>
        <div className="empty-page">
          <span className="empty-icon" aria-hidden="true">💬</span>
          <p>You need to sign in to join a chat room.</p>
          <button className="btn-primary" onClick={() => navigate('/login', { state: { from: '/chat' } })}>Sign In</button>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-page">
      <h1 className="page-title">Chat Rooms</h1>

      <div className="chat-layout">
        {/* Sidebar */}
        <nav className="rooms-sidebar" aria-label="Chat rooms">
          <div className="rooms-section">
            <h2 className="rooms-heading">Rooms</h2>
            <ul className="rooms-list" role="list">
              {PRESET_ROOMS.map((room) => (
                <li key={room.id}>
                  <button
                    className={`room-btn${activeRoom === room.id ? ' active' : ''}`}
                    onClick={() => setActiveRoom(room.id)}
                    title={room.description}
                  >
                    {room.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rooms-section">
            <h2 className="rooms-heading">Custom Room</h2>
            <form onSubmit={handleCustomRoom} className="custom-room-form">
              <input
                type="text"
                className="custom-room-input"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                placeholder="e.g. amzn"
                maxLength={20}
                aria-label="Custom room name"
              />
              <button type="submit" className="btn-primary btn-sm">Join</button>
            </form>
          </div>
        </nav>

        {/* Main chat */}
        <div className="chat-main">
          <ChatRoom
            roomId={activeRoom}
            roomTitle={currentRoom?.label ?? `#${activeRoom}`}
          />
        </div>
      </div>
    </main>
  );
}
