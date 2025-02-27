import * as THREE from 'three';
import { Vehicles } from './Vehicles';

export class Player {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    vehicles: Vehicles;
    currentVehicle: any | null = null;
    moveSpeed: number = 30;
    turnSpeed: number = 3;
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
    rotation: number = 0;
    playerModel!: THREE.Group;
    keys: { [key: string]: boolean } = {};
    verticalVelocity: number = 0;
    isGrounded: boolean = true;
    mouseSensitivity: number = 0.002;
    mouseSmoothing: number = 0.15;
    positionSmoothing: number = 0.2;
    targetEuler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
    currentEuler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
    velocity: THREE.Vector3 = new THREE.Vector3();
    direction: THREE.Vector3 = new THREE.Vector3();
    isMouseLocked: boolean = false;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, vehicles: Vehicles) {
        this.scene = scene;
        this.camera = camera;
        this.vehicles = vehicles;
        this.position = new THREE.Vector3(0, 1.7, 200);
        this.targetPosition = this.position.clone();
        this.createPlayerModel();
        this.setupControls();
    }

    createPlayerModel() {
        // Create a simple player model
        this.playerModel = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        this.playerModel.add(body);

        // Update position
        this.playerModel.position.copy(this.position);
        this.scene.add(this.playerModel);
    }

    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        // Mouse movement
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => {
            this.isMouseLocked = document.pointerLockElement !== null;
        });

        // Vehicle selection
        const dinoButton = document.getElementById('select-dinosaur');
        const shipButton = document.getElementById('select-spaceship');
        const noneButton = document.getElementById('select-none');

        if (dinoButton) dinoButton.addEventListener('click', () => this.selectVehicle('dinosaur'));
        if (shipButton) shipButton.addEventListener('click', () => this.selectVehicle('spaceship'));
        if (noneButton) noneButton.addEventListener('click', () => this.selectVehicle('none'));
    }

    onMouseMove(event: MouseEvent) {
        if (!this.isMouseLocked) return;

        // Update target euler angles with mouse movement
        this.targetEuler.y -= event.movementX * this.mouseSensitivity;
        this.targetEuler.x -= event.movementY * this.mouseSensitivity;
        
        // Clamp vertical rotation
        this.targetEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetEuler.x));
    }

    selectVehicle(type: 'dinosaur' | 'spaceship' | 'none') {
        if (type === 'none') {
            if (this.currentVehicle) {
                this.dismountVehicle();
            }
            return;
        }

        const nearestVehicle = this.vehicles.getNearestVehicle(this.position, type as 'dinosaur' | 'spaceship');
        if (nearestVehicle) {
            this.mountVehicle(nearestVehicle);
        }
    }

    mountVehicle(vehicle: any) {
        this.currentVehicle = vehicle;
        this.moveSpeed = vehicle.type === 'spaceship' ? 60 : 40;
        this.turnSpeed = vehicle.type === 'spaceship' ? 3 : 2;
        this.playerModel.visible = false;
        
        this.position.copy(vehicle.object.position);
        this.targetPosition.copy(this.position);
    }

    dismountVehicle() {
        this.currentVehicle = null;
        this.moveSpeed = 30;
        this.turnSpeed = 2.5;
        this.playerModel.visible = true;
        this.playerModel.position.copy(this.position);
        this.targetPosition.copy(this.position);
    }

    update(delta: number) {
        // Smooth camera rotation
        this.currentEuler.x += (this.targetEuler.x - this.currentEuler.x) * this.mouseSmoothing;
        this.currentEuler.y += (this.targetEuler.y - this.currentEuler.y) * this.mouseSmoothing;
        
        // Apply smoothed rotation to camera
        this.camera.quaternion.setFromEuler(this.currentEuler);
        
        // Update player model rotation to match camera
        this.playerModel.rotation.y = this.currentEuler.y;

        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;

        // Get forward and right directions from camera
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();

        // Calculate movement direction
        this.direction.set(0, 0, 0);
        
        if (this.keys['w']) this.direction.sub(forward);
        if (this.keys['s']) this.direction.add(forward);
        if (this.keys['a']) this.direction.add(right);
        if (this.keys['d']) this.direction.sub(right);
        
        if (this.direction.length() > 0) {
            this.direction.normalize();
        }

        // Apply movement with smooth acceleration
        const speed = this.currentVehicle ? 
            (this.currentVehicle.type === 'spaceship' ? 60 : 40) : 
            this.moveSpeed;
        
        const acceleration = this.keys['shift'] ? speed * 2.5 : speed;
        
        this.velocity.add(this.direction.multiplyScalar(acceleration * delta));
        
        // Apply movement with momentum
        const damping = 0.95;
        this.velocity.multiplyScalar(damping);
        
        // Update target position
        this.targetPosition.add(this.velocity);

        // Handle vertical movement for spaceships
        if (this.currentVehicle && this.currentVehicle.type === 'spaceship') {
            if (this.keys[' ']) {
                this.targetPosition.y += speed * delta;
            }
            if (this.keys['control']) {
                this.targetPosition.y -= speed * delta;
            }
            this.targetPosition.y = Math.max(5, Math.min(100, this.targetPosition.y));
        } else {
            this.targetPosition.y = this.currentVehicle ? 2 : 1.7;
        }

        // Smooth position update
        this.position.lerp(this.targetPosition, this.positionSmoothing);

        // Update vehicle or player model with smoothed position
        if (this.currentVehicle) {
            this.currentVehicle.object.position.copy(this.position);
            this.currentVehicle.object.rotation.y = this.currentEuler.y;
        } else {
            this.playerModel.position.copy(this.position);
        }

        // Update camera position for third-person view with improved smoothing
        const cameraOffset = new THREE.Vector3(
            -Math.sin(this.currentEuler.y) * 10,
            this.currentVehicle ? 8 : 5,
            -Math.cos(this.currentEuler.y) * 10
        );
        
        const targetCameraPos = this.position.clone().add(cameraOffset);
        this.camera.position.lerp(targetCameraPos, 0.15);
        
        // Make camera look at player with smoothed position
        const lookAtPos = this.position.clone();
        lookAtPos.y += this.currentVehicle ? 4 : 2;
        this.camera.lookAt(lookAtPos);
    }
} 