import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class Vehicles {
    scene: THREE.Scene;
    loadingManager: THREE.LoadingManager;
    dinosaurs: any[] = [];
    spaceships: any[] = [];
    loader: GLTFLoader;

    constructor(scene: THREE.Scene, loadingManager: THREE.LoadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.loader = new GLTFLoader(this.loadingManager);
        
        // Setup DRACO loader for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        this.loader.setDRACOLoader(dracoLoader);
        
        this.init();
    }

    init() {
        // Create dinosaurs and spaceships
        this.createDinosaurs();
        this.createSpaceships();
    }

    createDinosaurs() {
        // Create more dinosaurs around the pyramids
        const dinosaurPositions = [
            new THREE.Vector3(200, 0, 100),     // T-Rex
            new THREE.Vector3(-200, 0, -150),   // Triceratops
            new THREE.Vector3(150, 0, -200),    // Raptor
            new THREE.Vector3(-150, 0, 200),    // Spinosaurus
            new THREE.Vector3(300, 0, -100),    // Stegosaurus
            new THREE.Vector3(-300, 0, 100),    // Brachiosaurus
            new THREE.Vector3(250, 0, -250),    // Pterodactyl
            new THREE.Vector3(-250, 0, -250)    // Ankylosaurus
        ];
        
        const dinosaurTypes = [
            { name: 'T-Rex', model: '/models/trex.glb', scale: 2.0 },
            { name: 'Triceratops', model: '/models/triceratops.glb', scale: 1.8 },
            { name: 'Raptor', model: '/models/raptor.glb', scale: 1.5 },
            { name: 'Spinosaurus', model: '/models/spinosaurus.glb', scale: 2.0 },
            { name: 'Stegosaurus', model: '/models/stegosaurus.glb', scale: 1.8 },
            { name: 'Brachiosaurus', model: '/models/brachiosaurus.glb', scale: 2.5 },
            { name: 'Pterodactyl', model: '/models/pterodactyl.glb', scale: 1.5 },
            { name: 'Ankylosaurus', model: '/models/ankylosaurus.glb', scale: 1.8 }
        ];
        
        dinosaurPositions.forEach((position, i) => {
            const dinoType = dinosaurTypes[i];
            
            // Load GLTF model
            this.loader.load(dinoType.model, (gltf) => {
                const model = gltf.scene;
                
                // Apply scale
                model.scale.setScalar(dinoType.scale);
                
                // Position dinosaur
                model.position.copy(position);
                
                // Enable shadows
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Improve material quality
                        if (child.material) {
                            child.material.roughness = 0.8;
                            child.material.metalness = 0.2;
                            child.material.envMapIntensity = 1.0;
                        }
                    }
                });
                
                this.scene.add(model);
                
                // Add to dinosaurs array with specific speeds
                const speed = dinoType.name === 'Raptor' ? 35 :
                             dinoType.name === 'T-Rex' ? 30 :
                             dinoType.name === 'Pterodactyl' ? 40 : 25;
                
                this.dinosaurs.push({
                    object: model,
                    type: 'dinosaur',
                    name: dinoType.name,
                    speed: speed,
                    turnSpeed: dinoType.name === 'Raptor' ? 3 : 2,
                    animations: gltf.animations
                });
            });
        });
    }

    createSpaceships() {
        // Create spaceships hovering around the pyramids (not inside)
        const shipPositions = [
            new THREE.Vector3(200, 40, -200),   // Far right high
            new THREE.Vector3(-200, 50, -150),  // Far left high
            new THREE.Vector3(0, 60, -300),     // Far back high
            new THREE.Vector3(-250, 45, 200),   // Far front left
            new THREE.Vector3(250, 55, 150)     // Far front right
        ];
        
        const shipColors = [0x808080, 0x4682B4, 0x9370DB, 0x808080, 0x4682B4];
        const shipTypes = ['Scout', 'Fighter', 'Cruiser', 'Scout', 'Fighter'];
        
        shipPositions.forEach((position, i) => {
            // Create larger spaceship model
            const scale = 2; // Make spaceships larger
            const bodyGeometry = new THREE.CylinderGeometry(0, 3 * scale, 2 * scale, 8);
            const cockpitGeometry = new THREE.SphereGeometry(1.5 * scale, 16, 16);
            const wingGeometry = new THREE.BoxGeometry(6 * scale, 0.2 * scale, 2 * scale);
            const engineGeometry = new THREE.CylinderGeometry(0.5 * scale, 0.8 * scale, 1 * scale, 8);
            
            const shipMaterial = new THREE.MeshStandardMaterial({ 
                color: shipColors[i],
                metalness: 0.7,
                roughness: 0.3
            });
            
            const glowMaterial = new THREE.MeshStandardMaterial({
                color: 0x00FFFF,
                emissive: 0x00FFFF,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.7
            });
            
            // Create spaceship parts
            const body = new THREE.Mesh(bodyGeometry, shipMaterial);
            const cockpit = new THREE.Mesh(cockpitGeometry, new THREE.MeshStandardMaterial({
                color: 0x87CEFA,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.7
            }));
            cockpit.position.set(0, 1 * scale, 0);
            
            const wingL = new THREE.Mesh(wingGeometry, shipMaterial);
            wingL.position.set(-3 * scale, 0, 0);
            
            const wingR = new THREE.Mesh(wingGeometry, shipMaterial);
            wingR.position.set(3 * scale, 0, 0);
            
            const engineL = new THREE.Mesh(engineGeometry, shipMaterial);
            engineL.position.set(-2 * scale, -0.5 * scale, 1 * scale);
            
            const engineR = new THREE.Mesh(engineGeometry, shipMaterial);
            engineR.position.set(2 * scale, -0.5 * scale, 1 * scale);
            
            const engineGlowL = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 0.5 * scale, 8),
                glowMaterial
            );
            engineGlowL.position.set(-2 * scale, -1 * scale, 1 * scale);
            
            const engineGlowR = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 0.5 * scale, 8),
                glowMaterial
            );
            engineGlowR.position.set(2 * scale, -1 * scale, 1 * scale);
            
            // Create spaceship group
            const spaceship = new THREE.Group();
            spaceship.add(body, cockpit, wingL, wingR, engineL, engineR, engineGlowL, engineGlowR);
            
            // Position spaceship
            spaceship.position.copy(position);
            spaceship.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.scene.add(spaceship);
            
            // Add to spaceships array
            this.spaceships.push({
                object: spaceship,
                type: 'spaceship',
                name: shipTypes[i],
                speed: 30,
                turnSpeed: 3
            });
        });
    }

    update(delta: number) {
        // Animate dinosaurs with more natural movement
        this.dinosaurs.forEach((dino, index) => {
            // Basic position animation if no loaded animations
            if (!dino.animations || dino.animations.length === 0) {
                // Bobbing movement
                dino.object.position.y = 0.2 * Math.sin(Date.now() * 0.002 + index) + 0.2;
                
                // Swaying movement
                dino.object.rotation.y += 0.01 * Math.sin(Date.now() * 0.001);
            }
        });
        
        // Animate spaceships (hovering)
        this.spaceships.forEach((ship, index) => {
            ship.object.position.y = 5 + 0.5 * Math.sin(Date.now() * 0.001 + index);
            ship.object.rotation.y += 0.005;
            
            // Animate engine glow
            const engineGlowL = ship.object.children[6];
            const engineGlowR = ship.object.children[7];
            
            const glowIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01 + index);
            engineGlowL.material.emissiveIntensity = glowIntensity;
            engineGlowR.material.emissiveIntensity = glowIntensity;
        });
    }

    getNearestVehicle(playerPosition: THREE.Vector3, type: 'dinosaur' | 'spaceship') {
        const vehicles = type === 'dinosaur' ? this.dinosaurs : this.spaceships;
        let nearestVehicle = null;
        let minDistance = 20; // Increased interaction distance
        
        vehicles.forEach(vehicle => {
            const distance = playerPosition.distanceTo(vehicle.object.position);
            if (distance < minDistance) {
                nearestVehicle = vehicle;
                minDistance = distance;
            }
        });
        
        return nearestVehicle;
    }
} 