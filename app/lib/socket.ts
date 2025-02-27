import { io, Socket } from 'socket.io-client';

class GameSocket {
    private socket: Socket | null = null;
    private onUpdateCallbacks: ((gameState: any) => void)[] = [];

    connect() {
        // Get the server URL from environment variable or use a default
        const serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
        
        this.socket = io(serverUrl, {
            transports: ['websocket'],
            // Add reconnection logic
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
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