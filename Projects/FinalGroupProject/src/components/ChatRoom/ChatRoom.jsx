import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { connectSocket, disconnectSocket, joinRoom, leaveRoom, sendMessage, onMessage, offMessage, onRoomUsers, offRoomUsers } from '../../services/chatService.js';
import { formatRelativeTime } from '../../utils/formatters.js';
import './ChatRoom.css';

/**
 * Parse a plain-text message and render URLs as clickable links.
 * If the URL points to an image file, also renders an inline preview.
 * This runs on already-sanitised text from the server (no HTML injection risk).
 * @param {string} text
 * @returns {React.ReactNode[]}
 */
function renderMessage(text) {
  // Split on http(s) URLs — capturing group keeps the URLs in the parts array
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  const imageExt = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      if (imageExt.test(part)) {
        // Render image URL as a link + inline preview
        return (
          <span key={i} className="msg-media">
            <a href={part} target="_blank" rel="noopener noreferrer" className="msg-link">{part}</a>
            <img src={part} alt="Shared image" className="msg-image" />
          </span>
        );
      }
      // Render non-image URL as a clickable link
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="msg-link">
          {part}
        </a>
      );
    }
    return part;
  });
}

/**
 * Real-time chat room component powered by Socket.io.
 * @param {{ roomId: string, roomTitle?: string }} props
 */
export default function ChatRoom({ roomId, roomTitle }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket(user.username);

    socket.on('connect', () => {
      setConnected(true);
      joinRoom(roomId);
    });

    socket.on('disconnect', () => setConnected(false));

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUsers = (userList) => setUsers(userList);

    onMessage(handleMessage);
    onRoomUsers(handleUsers);

    return () => {
      offMessage(handleMessage);
      offRoomUsers(handleUsers);
      leaveRoom(roomId);
      disconnectSocket();
    };
  }, [user, roomId]);

  // Scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !user) return;

    sendMessage(roomId, text, user.username);
    setInput('');
    inputRef.current?.focus();
  }

  if (!user) {
    return (
      <div className="chat-room chat-locked">
        <p>Please <a href="/login">sign in</a> to join the chat.</p>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3 className="chat-title">{roomTitle ?? `#${roomId}`}</h3>
        <div className="chat-status">
          <span className={`status-dot${connected ? ' online' : ''}`} aria-hidden="true" />
          <span className="status-label">{connected ? `${users.length} online` : 'Connecting…'}</span>
        </div>
      </div>

      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet. Be the first to say something!</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message${msg.username === user.username ? ' own' : ''}`}
          >
            <span className="msg-avatar" aria-hidden="true">
              {msg.username.charAt(0).toUpperCase()}
            </span>
            <div className="msg-body">
              <div className="msg-meta">
                <span className="msg-username">{msg.username}</span>
                <time className="msg-time" dateTime={msg.timestamp}>
                  {formatRelativeTime(msg.timestamp)}
                </time>
              </div>
              {/* Message was sanitised server-side; URLs become clickable links/image previews */}
              <p className="msg-text">{renderMessage(msg.message)}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message #${roomId}…`}
          maxLength={500}
          aria-label="Chat message input"
          disabled={!connected}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!connected || !input.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}
