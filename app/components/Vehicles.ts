import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
            new THREE.Vector3(-50, 0, 50),
            new THREE.Vector3(50, 0, 50),
            new THREE.Vector3(-150, 0, 100),
            new THREE.Vector3(150, 0, 100),
            new THREE.Vector3(0, 0, 150)
        ];
        
        const dinosaurColors = [0x8B4513, 0x556B2F, 0x800000, 0x8B4513, 0x556B2F];
        const dinosaurTypes = ['T-Rex', 'Triceratops', 'Raptor', 'T-Rex', 'Triceratops'];
        
        dinosaurPositions.forEach((position, i) => {
            // Create simple dinosaur model
            const dinoGeometry = new THREE.ConeGeometry(2, 6, 4);
            const bodyGeometry = new THREE.BoxGeometry(3, 2, 5);
            const legGeometry = new THREE.BoxGeometry(0.5, 3, 0.5);
            const tailGeometry = new THREE.CylinderGeometry(0.5, 0.1, 4, 8);
            
            const dinoMaterial = new THREE.MeshStandardMaterial({ 
                color: dinosaurColors[i],
                roughness: 0.7,
                metalness: 0.2
            });
            
            // Create dinosaur parts
            const head = new THREE.Mesh(dinoGeometry, dinoMaterial);
            head.rotation.x = Math.PI / 2;
            head.position.set(0, 3, -3);
            
            const body = new THREE.Mesh(bodyGeometry, dinoMaterial);
            body.position.set(0, 2.5, 0);
            
            const tail = new THREE.Mesh(tailGeometry, dinoMaterial);
            tail.position.set(0, 2.5, 3);
            tail.rotation.x = Math.PI / 2;
            
            const legFL = new THREE.Mesh(legGeometry, dinoMaterial);
            legFL.position.set(-1, 0.5, -1.5);
            
            const legFR = new THREE.Mesh(legGeometry, dinoMaterial);
            legFR.position.set(1, 0.5, -1.5);
            
            const legBL = new THREE.Mesh(legGeometry, dinoMaterial);
            legBL.position.set(-1, 0.5, 1.5);
            
            const legBR = new THREE.Mesh(legGeometry, dinoMaterial);
            legBR.position.set(1, 0.5, 1.5);
            
            // Create dinosaur group
            const dinosaur = new THREE.Group();
            dinosaur.add(head, body, tail, legFL, legFR, legBL, legBR);
            
            // Position dinosaur
            dinosaur.position.copy(position);
            dinosaur.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.scene.add(dinosaur);
            
            // Add to dinosaurs array
            this.dinosaurs.push({
                object: dinosaur,
                type: 'dinosaur',
                name: dinosaurTypes[i],
                speed: 20,
                turnSpeed: 2
            });
        });
    }

    createSpaceships() {
        // Create spaceships hovering around the pyramids
        const shipPositions = [
            new THREE.Vector3(0, 20, -50),
            new THREE.Vector3(-100, 30, 0),
            new THREE.Vector3(100, 25, 0),
            new THREE.Vector3(-50, 35, 100),
            new THREE.Vector3(50, 40, 100)
        ];
        
        const shipColors = [0x808080, 0x4682B4, 0x9370DB, 0x808080, 0x4682B4];
        const shipTypes = ['Scout', 'Fighter', 'Cruiser', 'Scout', 'Fighter'];
        
        shipPositions.forEach((position, i) => {
            // Create simple spaceship model
            const bodyGeometry = new THREE.CylinderGeometry(0, 3, 2, 8);
            const cockpitGeometry = new THREE.SphereGeometry(1.5, 16, 16);
            const wingGeometry = new THREE.BoxGeometry(6, 0.2, 2);
            const engineGeometry = new THREE.CylinderGeometry(0.5, 0.8, 1, 8);
            
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
            cockpit.position.set(0, 1, 0);
            
            const wingL = new THREE.Mesh(wingGeometry, shipMaterial);
            wingL.position.set(-3, 0, 0);
            
            const wingR = new THREE.Mesh(wingGeometry, shipMaterial);
            wingR.position.set(3, 0, 0);
            
            const engineL = new THREE.Mesh(engineGeometry, shipMaterial);
            engineL.position.set(-2, -0.5, 1);
            
            const engineR = new THREE.Mesh(engineGeometry, shipMaterial);
            engineR.position.set(2, -0.5, 1);
            
            const engineGlowL = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.5, 0.5, 8),
                glowMaterial
            );
            engineGlowL.position.set(-2, -1, 1);
            
            const engineGlowR = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.5, 0.5, 8),
                glowMaterial
            );
            engineGlowR.position.set(2, -1, 1);
            
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
        // Animate dinosaurs (simple idle animation)
        this.dinosaurs.forEach((dino, index) => {
            dino.object.position.y = 0.2 * Math.sin(Date.now() * 0.001 + index) + 0.2;
            dino.object.rotation.y += 0.01 * Math.sin(Date.now() * 0.0005);
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