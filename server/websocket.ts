import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let metrics = {
  activeCalls: 0,
  aiResponsesToday: 0,
  queuedVoiceJobs: 0,
  uptime: '100%',
  systemHealth: 97,
  responseTime: '180ms',
  connectedClients: 0,
  processingTasks: 0,
};

let io: Server;

export const setupWebSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { 
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/ws'
  });

  io.on('connection', (socket) => {
    metrics.connectedClients = io.sockets.sockets.size;
    console.log('📡 WebSocket client connected - Total:', metrics.connectedClients);

    // Send initial metrics to new client
    socket.emit('metrics', metrics);

    // Set up periodic metrics broadcast
    const interval = setInterval(() => {
      // Simulate realistic metrics updates
      metrics.activeCalls = Math.floor(Math.random() * 12) + 3;
      metrics.aiResponsesToday += Math.floor(Math.random() * 3);
      metrics.queuedVoiceJobs = Math.floor(Math.random() * 8);
      metrics.processingTasks = Math.floor(Math.random() * 5);
      
      socket.emit('metrics', metrics);
    }, 30000); // Every 30 seconds

    socket.on('disconnect', () => {
      metrics.connectedClients = io.sockets.sockets.size;
      console.log('❌ WebSocket client disconnected - Total:', metrics.connectedClients);
      clearInterval(interval);
    });

    // Handle real-time commands
    socket.on('voice_command', (data) => {
      console.log('🎤 Voice command received:', data.command);
      metrics.processingTasks++;
      
      // Broadcast to all clients
      io.emit('command_processing', {
        command: data.command,
        user: data.user,
        timestamp: new Date().toISOString()
      });
    });

    // Handle live metrics updates from other parts of the system
    socket.on('update_metric', (data) => {
      if (metrics.hasOwnProperty(data.key)) {
        metrics[data.key as keyof typeof metrics] = data.value;
        io.emit('metrics', metrics);
      }
    });
  });

  return io;
};

// Update metrics from other modules
export const updateMetric = (key: keyof typeof metrics, value: number | string) => {
  metrics[key] = value;
  if (io) {
    io.emit('metrics', metrics);
  }
};

// Broadcast voice command updates
export const broadcastVoiceCommand = (command: string, user: string) => {
  if (io) {
    io.emit('voice_command_sent', {
      command,
      user,
      timestamp: new Date().toISOString(),
      status: 'processing'
    });
  }
};

// Get current metrics
export const getCurrentMetrics = () => metrics;