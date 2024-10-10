import { Server, type Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { StringMap } from 'src/types';

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('socket');

const users: StringMap = {};
// This will store the `io` instance
let ioInstance: Server | null = null;

// Function to initialize Socket.IO
export function initializeSocket(httpServer: HttpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:8080',
    },
  });

  ioInstance.on('connection', (socket: Socket) => {
    logDebug(`Client connected: ${socket.id}`);

    // Handle registering the user with socket
    socket.on('register', ({ guid }) => {
      // Store the socket ID for the user (in-memory or DB)
      logDebug(`User ${JSON.stringify(guid)} is connected with socket ID: ${socket.id}`);
      users[guid] = socket.id;
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      logDebug(`Client disconnected: ${socket.id}`);
      // Clean up resources or socket associations if needed
    });
  });

  return ioInstance;
}

// Function to get the current Socket.IO instance
export function getIOInstance() : { io: Server, users: StringMap } {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized!');
  }
  return { io: ioInstance, users };
}
