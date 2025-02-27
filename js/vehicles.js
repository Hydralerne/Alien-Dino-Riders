import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Vehicles {
    constructor(scene, loadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.dinosaurs = [];
        this.spaceships = [];
        this.loader = new GLTFLoader(this.loadingManager);
        this.init();
    }

    init() {
        // Create dinosaurs
        this.createDinosaurs();
        
        // Create spaceships
        this.createSpaceships();
    }

    createDinosaurs() {
        // Create 3 different dinosaurs
        const dinosaurPositions = [
            new THREE.Vector3(-50, 0, -30),
            new THREE.Vector3(30, 0, -60),
            new THREE.Vector3(70, 0, 20)
        ];
        
        const dinosaurColors = [0x8B4513, 0x556B2F, 0x800000];
        const dinosaurTypes = ['T-Rex', 'Triceratops', 'Raptor'];
        
        for (let i = 0; i < 3; i++) {
            // Create simple dinosaur model (will be replaced with proper models)
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
            dinosaur.position.copy(dinosaurPositions[i]);
            dinosaur.castShadow = true;
            dinosaur.receiveShadow = true;
            
            this.scene.add(dinosaur);
            
            // Add to dinosaurs array
            this.dinosaurs.push({
                object: dinosaur,
                type: 'dinosaur',
                name: dinosaurTypes[i],
                speed: 20,
                turnSpeed: 2
            });
        }
    }

    createSpaceships() {
        // Create 3 different spaceships
        const shipPositions = [
            new THREE.Vector3(-80, 5, 40),
            new THREE.Vector3(50, 5, -90),
            new THREE.Vector3(120, 5, -20)
        ];
        
        const shipColors = [0x808080, 0x4682B4, 0x9370DB];
        const shipTypes = ['Scout', 'Fighter', 'Cruiser'];
        
        for (let i = 0; i < 3; i++) {
            // Create simple spaceship model (will be replaced with proper models)
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
            spaceship.position.copy(shipPositions[i]);
            spaceship.castShadow = true;
            spaceship.receiveShadow = true;
            
            this.scene.add(spaceship);
            
            // Add to spaceships array
            this.spaceships.push({
                object: spaceship,
                type: 'spaceship',
                name: shipTypes[i],
                speed: 30,
                turnSpeed: 3
            });
        }
    }

    update(delta) {
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

    getNearestVehicle(playerPosition, type) {
        let vehicles = type === 'dinosaur' ? this.dinosaurs : this.spaceships;
        let nearestVehicle = null;
        let minDistance = 10; // Minimum distance to interact
        
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

let dinosaur, spaceship;

function initVehicles() {
    // Create temporary vehicles (boxes) until models are loaded
    createTemporaryVehicles();
    
    // Set up vehicle selection buttons
    setupVehicleControls();
}

function createTemporaryVehicles() {
    // Temporary dinosaur (green box)
    const dinoGeometry = new THREE.BoxGeometry(2, 2, 4);
    const dinoMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    dinosaur = new THREE.Mesh(dinoGeometry, dinoMaterial);
    dinosaur.position.set(-5, 1, 0);
    scene.add(dinosaur);

    // Temporary spaceship (blue box)
    const shipGeometry = new THREE.BoxGeometry(3, 1, 3);
    const shipMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    spaceship = new THREE.Mesh(shipGeometry, shipMaterial);
    spaceship.position.set(5, 3, 0);
    scene.add(spaceship);
}

function setupVehicleControls() {
    const dinoButton = document.getElementById('select-dinosaur');
    const shipButton = document.getElementById('select-spaceship');
    const noneButton = document.getElementById('select-none');

    dinoButton.addEventListener('click', () => selectVehicle('dinosaur'));
    shipButton.addEventListener('click', () => selectVehicle('spaceship'));
    noneButton.addEventListener('click', () => selectVehicle('none'));
}

function selectVehicle(type) {
    gameState.currentVehicle = type;
    updateVehiclePosition();
}

function updateVehicles() {
    if (gameState.currentVehicle) {
        updateVehiclePosition();
    }
}

function updateVehiclePosition() {
    // Update vehicle positions based on player position
    // This will be implemented when player movement is added
}