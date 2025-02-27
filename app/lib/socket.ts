import { io, Socket } from 'socket.io-client';

class GameSocket {
    private socket: Socket | null = null;
    private onUpdateCallbacks: ((gameState: any) => void)[] = [];

    connect() {
        const serverUrl = process.env.NODE_ENV === 'production'
            ? window.location.origin
            : 'http://localhost:3001';

        this.socket = io(serverUrl);

        this.socket.on('connect', () => {
            console.log('Connected to game server');
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
}

// Create a singleton instance
export const gameSocket = new GameSocket(); 