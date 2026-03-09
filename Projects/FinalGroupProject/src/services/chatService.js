import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

/** Return (or lazily create) the singleton socket instance. */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1_000,
    });
  }
  return socket;
}

/**
 * Connect the socket with the given username sent as auth payload.
 * @param {string} username
 * @returns {Socket}
 */
export function connectSocket(username) {
  const s = getSocket();
  s.auth = { username };
  s.connect();
  return s;
}

/** Disconnect and destroy the socket singleton. */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(roomId) {
  getSocket().emit('join_room', { roomId });
}

export function leaveRoom(roomId) {
  getSocket().emit('leave_room', { roomId });
}

/**
 * Send a chat message.
 * The message text is sanitised before transmission to prevent XSS.
 * @param {string} roomId
 * @param {string} message
 * @param {string} username
 */
export function sendMessage(roomId, message, username) {
  getSocket().emit('send_message', {
    roomId,
    message: sanitize(message),
    username,
    timestamp: new Date().toISOString(),
  });
}

/** Register a handler for incoming messages. */
export function onMessage(callback) {
  getSocket().on('receive_message', callback);
}

export function offMessage(callback) {
  getSocket().off('receive_message', callback);
}

/** Register a handler for room-user-list updates. */
export function onRoomUsers(callback) {
  getSocket().on('room_users', callback);
}

export function offRoomUsers(callback) {
  getSocket().off('room_users', callback);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS in chat messages.
 * @param {string} text
 * @returns {string}
 */
function sanitize(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
