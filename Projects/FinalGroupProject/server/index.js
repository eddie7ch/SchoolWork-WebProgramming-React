import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

// Track users per room: Map<roomId, Set<username>>
const roomUsers = new Map();

// ── Helper ──────────────────────────────────────────────────────────────────

/** Broadcast the current user list for a room to all members of that room. */
function broadcastUsers(roomId) {
  const users = Array.from(roomUsers.get(roomId) ?? []);
  io.to(roomId).emit('room_users', users);
}

/**
 * Escape HTML special characters to prevent stored-XSS if a client bypasses
 * the front-end sanitisation.
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

// ── Socket.io ───────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  const username = sanitize(socket.handshake.auth?.username ?? 'Anonymous');

  socket.on('join_room', ({ roomId }) => {
    const room = sanitize(String(roomId)).substring(0, 50);
    socket.join(room);

    if (!roomUsers.has(room)) roomUsers.set(room, new Set());
    roomUsers.get(room).add(username);

    broadcastUsers(room);
  });

  socket.on('leave_room', ({ roomId }) => {
    const room = sanitize(String(roomId)).substring(0, 50);
    socket.leave(room);
    roomUsers.get(room)?.delete(username);
    broadcastUsers(room);
  });

  socket.on('send_message', ({ roomId, message, timestamp }) => {
    const room = sanitize(String(roomId)).substring(0, 50);

    // Message is already sanitised client-side but we sanitise again
    // server-side (defence-in-depth).
    const safeMessage = sanitize(String(message)).substring(0, 500);

    io.to(room).emit('receive_message', {
      username,
      message: safeMessage,
      timestamp: timestamp ?? new Date().toISOString(),
      roomId: room,
    });
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      roomUsers.get(room)?.delete(username);
      broadcastUsers(room);
    }
  });
});

// ── Health-check endpoint ────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`StockPulse chat server running on http://localhost:${PORT}`);
});
