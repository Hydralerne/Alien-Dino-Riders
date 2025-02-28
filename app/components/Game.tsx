'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Environment } from './Environment';
import { Vehicles } from './Vehicles';
import { Player } from './Player';

export default function Game() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const loadingManagerRef = useRef<THREE.LoadingManager | null>(null);
    const playerRef = useRef<Player | null>(null);
    const vehiclesRef = useRef<Vehicles | null>(null);
    const environmentRef = useRef<Environment | null>(null);
    const lastTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!containerRef.current) return;
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
            }, 500);
        }
        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        sceneRef.current = scene;

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        camera.position.set(0, 100, 200);
        cameraRef.current = camera;

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Initialize loading manager with proper callbacks
        const loadingManager = new THREE.LoadingManager();
        loadingManagerRef.current = loadingManager;
        
        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progressBar = document.querySelector('.progress-bar-fill');
            if (progressBar) {
                const progress = (itemsLoaded / itemsTotal) * 100;
                progressBar.setAttribute('style', `width: ${progress}%`);
            }
        };

        loadingManager.onError = (url) => {
            console.error('Error loading:', url);
        };

        // Setup pointer lock handling
        const onPointerLockChange = () => {
            if (document.pointerLockElement === containerRef.current) {
                console.log('Pointer locked');
            } else {
                console.log('Pointer unlocked');
                // Re-request pointer lock when user clicks again
                const onClick = () => {
                    containerRef.current?.requestPointerLock();
                };
                containerRef.current?.addEventListener('click', onClick, { once: true });
            }
        };

        document.addEventListener('pointerlockchange', onPointerLockChange);
        
        // Initial pointer lock request
        containerRef.current.addEventListener('click', () => {
            containerRef.current?.requestPointerLock();
        });

        // Add lights with better intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        scene.add(directionalLight);

        // Initialize environment
        const environment = new Environment(scene, loadingManager);
        environmentRef.current = environment;

        // Initialize vehicles
        const vehicles = new Vehicles(scene, loadingManager);
        vehiclesRef.current = vehicles;

        // Initialize player with better controls
        const player = new Player(scene, camera, vehicles, environment);
        playerRef.current = player;

        // Animation loop
        const animate = (time: number) => {
            if (!playerRef.current) return;
            
            animationFrameRef.current = requestAnimationFrame(animate);

            const delta = Math.min((time - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = time;

            if (playerRef.current) {
                playerRef.current.update(delta);
            }

            if (vehiclesRef.current) {
                vehiclesRef.current.update(delta);
            }

            renderer.render(scene, camera);
        };

        // Start animation loop
        animate(0);

        // Handle window resize
        const handleResize = () => {
            if (!cameraRef.current || !rendererRef.current) return;
            
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div>
            <div id="loading-screen" className="loading-screen">
                <div className="loading-content">
                    <h1>Pyramids of Egypt: Aliens & Dinosaurs</h1>
                    <div className="progress-bar">
                        <div className="progress-bar-fill"></div>
                    </div>
                    <p className="loading-text">Loading game assets...</p>
                </div>
            </div>
            <div id="game-ui">
                <div id="vehicle-selection">
                    <button id="select-dinosaur">Ride Dinosaur</button>
                    <button id="select-spaceship">Pilot Spaceship</button>
                    <button id="select-none">Walk</button>
                </div>
            </div>
            <div ref={containerRef} id="game-container" />
            <style jsx>{`
                .loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    transition: opacity 0.5s;
                }
                .loading-screen.fade-out {
                    opacity: 0;
                }
                .loading-content {
                    text-align: center;
                    color: white;
                }
                .progress-bar {
                    width: 300px;
                    height: 20px;
                    background: #333;
                    border-radius: 10px;
                    overflow: hidden;
                    margin: 20px auto;
                }
                .progress-bar-fill {
                    width: 0%;
                    height: 100%;
                    background: #4CAF50;
                    transition: width 0.3s;
                }
                #game-ui {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 100;
                }
                #vehicle-selection button {
                    margin: 0 10px;
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: 1px solid white;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                #vehicle-selection button:hover {
                    background: rgba(0, 0, 0, 0.9);
                }
            `}</style>
        </div>
    );
} 