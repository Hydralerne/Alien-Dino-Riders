import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? false
            : ["http://localhost:3000"]
    }
});

interface GameState {
    players: {
        [id: string]: {
            position: { x: number; y: number; z: number };
            rotation: number;
        };
    };
}

const gameState: GameState = {
    players: {}
};

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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
}); 