import { io, Socket } from 'socket.io-client';

class GameSocket {
    private socket: Socket | null = null;
    private onUpdateCallbacks: ((gameState: any) => void)[] = [];

    connect() {
        // Connect to the WebSocket server on the same domain
        this.socket = io({
            path: '/api/socket/io',
            addTrailingSlash: false
        });

        this.socket.on('connect', () => {
            console.log('Connected to game server with ID:', this.socket?.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        // Add debug logging for all events
        this.socket.onAny((event, ...args) => {
            console.log('Received event:', event, 'with data:', args);
        });

        this.socket.on('currentPlayers', (players) => {
            this.notifyListeners({ type: 'currentPlayers', players });
        });

        this.socket.on('playerJoined', (player) => {
            this.notifyListeners({ type: 'playerJoined', player });
        });

        this.socket.on('playerMoved', (player) => {
            this.notifyListeners({ type: 'playerMoved', player });
        });

        this.socket.on('playerLeft', (playerId) => {
            this.notifyListeners({ type: 'playerLeft', playerId });
        });
    }

    sendMovement(data: { position: { x: number; y: number; z: number }; rotation: number }) {
        if (this.socket) {
            this.socket.emit('playerMove', data);
        }
    }

    onUpdate(callback: (gameState: any) => void) {
        this.onUpdateCallbacks.push(callback);
    }

    private notifyListeners(update: any) {
        this.onUpdateCallbacks.forEach(callback => callback(update));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Add method to check connection status
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Add method to get player ID
    getPlayerId(): string | null {
        return this.socket?.id || null;
    }
}

// Create a singleton instance
export const gameSocket = new GameSocket(); 