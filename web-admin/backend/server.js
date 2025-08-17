import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { initializeDatabase } from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import orderRoutes from './src/routes/orders.js';
import menuRoutes from './src/routes/menu.js';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Initialize database
await initializeDatabase();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Admin client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Admin client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:5173`);
  console.log(`⚡ API Base URL: http://localhost:${PORT}/api`);
});