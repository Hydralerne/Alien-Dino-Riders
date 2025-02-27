'use client';

import { useEffect, useState } from 'react';
import { gameSocket } from './lib/socket';

export default function TestPage() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<{[key: string]: any}>({});
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // Connect to the game server
    gameSocket.connect();

    // Update player ID when connected
    const interval = setInterval(() => {
      const id = gameSocket.getPlayerId();
      if (id) {
        setPlayerId(id);
        clearInterval(interval);
      }
    }, 100);

    // Listen for game state updates
    gameSocket.onUpdate((update) => {
      console.log('Received update:', update);
      
      switch (update.type) {
        case 'currentPlayers':
          setPlayers(update.players);
          break;
        case 'playerJoined':
          setPlayers(prev => ({
            ...prev,
            [update.player.id]: update.player
          }));
          break;
        case 'playerMoved':
          setPlayers(prev => ({
            ...prev,
            [update.player.id]: update.player
          }));
          break;
        case 'playerLeft':
          setPlayers(prev => {
            const newPlayers = { ...prev };
            delete newPlayers[update.playerId];
            return newPlayers;
          });
          break;
      }
    });

    return () => {
      gameSocket.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Send random movement every 2 seconds for testing
  useEffect(() => {
    if (!playerId) return;

    const interval = setInterval(() => {
      const newPosition = {
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5
      };
      setPosition(newPosition);
      gameSocket.sendMovement({
        position: newPosition,
        rotation: Math.random() * Math.PI * 2
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [playerId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Multiplayer Test</h1>
      
      <div className="mb-4">
        <strong>Your ID:</strong> {playerId || 'Connecting...'}
      </div>
      
      <div className="mb-4">
        <strong>Your Position:</strong>
        <pre>{JSON.stringify(position, null, 2)}</pre>
      </div>

      <div>
        <strong>All Players:</strong>
        <pre>{JSON.stringify(players, null, 2)}</pre>
      </div>
    </div>
  );
} 