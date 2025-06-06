import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

const AIRTABLE_API_KEY = process.env.AIRTABLE_VALID_TOKEN || process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_COMMAND_CENTER_BASE_TOKEN;
const COMMAND_CENTER_BASE = "appRt8V3tH4g5Z51f";

let metrics = {
  activeCalls: 0,
  aiResponsesToday: 0,
  queuedVoiceJobs: 0,
  uptime: '100%',
  systemHealth: 100,
  responseTime: '180ms',
  connectedClients: 0,
  processingTasks: 0,
};

// Fetch real metrics from Airtable
async function fetchRealMetrics() {
  if (!AIRTABLE_API_KEY) {
    return metrics; // Return current if no API key
  }

  try {
    const baseUrl = `https://api.airtable.com/v0/${COMMAND_CENTER_BASE}`;
    const headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    };

    // Fetch real data from multiple tables
    const [callsRes, ticketsRes, escalationsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/tblCCFd3TrNvLKqV4?maxRecords=100`, { headers }), // Call Recordings
      fetch(`${baseUrl}/tblbU2C2F6YPMgLjx?maxRecords=100`, { headers }), // Support Tickets
      fetch(`${baseUrl}/tblJKwK8zXEhVrfSh?maxRecords=100`, { headers })  // NLP Keywords
    ]);

    let activeCalls = 0;
    let supportTickets = 0;
    let queuedJobs = 0;

    // Process call recordings
    if (callsRes.status === 'fulfilled' && callsRes.value.ok) {
      const callData = await callsRes.value.json();
      activeCalls = callData.records?.length || 0;
    }

    // Process support tickets
    if (ticketsRes.status === 'fulfilled' && ticketsRes.value.ok) {
      const ticketData = await ticketsRes.value.json();
      supportTickets = ticketData.records?.length || 0;
    }

    // Process NLP/queued jobs
    if (escalationsRes.status === 'fulfilled' && escalationsRes.value.ok) {
      const escalationData = await escalationsRes.value.json();
      queuedJobs = escalationData.records?.length || 0;
    }

    // Update metrics with real data
    metrics.activeCalls = activeCalls;
    metrics.aiResponsesToday = supportTickets;
    metrics.queuedVoiceJobs = queuedJobs;
    metrics.processingTasks = Math.floor(activeCalls * 0.3); // Estimate processing tasks

    return metrics;
  } catch (error) {
    console.error('Error fetching real metrics:', error);
    return metrics; // Return current if error
  }
}

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

    // Set up periodic metrics broadcast with real data
    const interval = setInterval(async () => {
      // Fetch real metrics from Airtable
      const realMetrics = await fetchRealMetrics();
      
      socket.emit('metrics', realMetrics);
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

// Broadcast general updates to all clients
export const broadcastUpdate = (data: any) => {
  if (io) {
    io.emit('update', data);
  }
};