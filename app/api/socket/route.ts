import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { headers } from 'next/headers';

// Store the Socket.IO server instance
let io: SocketIOServer;

// Game state interface
interface GameState {
  players: {
    [id: string]: {
      position: { x: number; y: number; z: number };
      rotation: number;
    };
  };
}

// Global game state
const gameState: GameState = {
  players: {}
};

// Initialize Socket.IO server
function initSocketIO(res: NextApiResponse) {
  if (!io) {
    // @ts-ignore - Next.js server type mismatch
    io = new SocketIOServer(res.socket.server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Player connected:', socket.id);
      
      // Add player to game state
      gameState.players[socket.id] = {
        position: { x: 0, y: 0, z: 0 },
        rotation: 0
      };

      // Broadcast to all other players that a new player joined
      socket.broadcast.emit('playerJoined', {
        id: socket.id,
        ...gameState.players[socket.id]
      });

      // Send existing players to the new player
      socket.emit('currentPlayers', gameState.players);

      // Handle player movement
      socket.on('playerMove', (data) => {
        if (gameState.players[socket.id]) {
          gameState.players[socket.id] = {
            ...gameState.players[socket.id],
            ...data
          };
          // Broadcast player movement to all other players
          socket.broadcast.emit('playerMoved', {
            id: socket.id,
            ...gameState.players[socket.id]
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete gameState.players[socket.id];
        io.emit('playerLeft', socket.id);
      });
    });
  }
  return io;
}

export async function GET(req: Request) {
  const headersList = headers();
  const upgrade = headersList.get('upgrade');
  
  if (upgrade?.toLowerCase() !== 'websocket') {
    return new Response('Expected Upgrade: WebSocket', { status: 426 });
  }

  try {
    // @ts-ignore - res is available in Next.js runtime
    const res: NextApiResponse = req.socket.server.res;
    const io = initSocketIO(res);
    
    // Return empty response - socket.io will handle the upgrade
    return new Response(null);
  } catch (e) {
    console.error('WebSocket server error:', e);
    return new Response('WebSocket server error', { status: 500 });
  }
}