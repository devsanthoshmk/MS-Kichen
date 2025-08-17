import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  // Connect to Socket.IO server
  connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.connected = false;
    });

    // Set up event listeners for order updates
    this.setupOrderListeners();
    this.setupMenuListeners();

    return this.socket;
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  // Set up order-related event listeners
  setupOrderListeners() {
    if (!this.socket) return;

    // New order received
    this.socket.on('newOrder', (order) => {
      console.log('📦 New order received:', order);
      this.emit('newOrder', order);
    });

    // Order updated
    this.socket.on('orderUpdated', (order) => {
      console.log('📝 Order updated:', order);
      this.emit('orderUpdated', order);
    });

    // Order status updated
    this.socket.on('orderStatusUpdated', (data) => {
      console.log('🔄 Order status updated:', data);
      this.emit('orderStatusUpdated', data);
    });

    // Order deleted
    this.socket.on('orderDeleted', (data) => {
      console.log('🗑️ Order deleted:', data);
      this.emit('orderDeleted', data);
    });
  }

  // Set up menu-related event listeners
  setupMenuListeners() {
    if (!this.socket) return;

    // Menu item created
    this.socket.on('menuItemCreated', (menuItem) => {
      console.log('🍽️ Menu item created:', menuItem);
      this.emit('menuItemCreated', menuItem);
    });

    // Menu item updated
    this.socket.on('menuItemUpdated', (menuItem) => {
      console.log('📝 Menu item updated:', menuItem);
      this.emit('menuItemUpdated', menuItem);
    });

    // Menu item deleted
    this.socket.on('menuItemDeleted', (data) => {
      console.log('🗑️ Menu item deleted:', data);
      this.emit('menuItemDeleted', data);
    });
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Emit event to all listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Check if connected
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;