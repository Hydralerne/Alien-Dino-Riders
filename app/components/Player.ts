import * as THREE from 'three';
import { Vehicles } from './Vehicles';
import { Environment } from './Environment';

export class Player {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    vehicles: Vehicles;
    environment: Environment;
    currentVehicle: any | null = null;
    moveSpeed: number = 70;          // Faster movement speed
    turnSpeed: number = 3;
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
    rotation: number = 0;
    playerModel!: THREE.Group;
    keys: { [key: string]: boolean } = {};
    verticalVelocity: number = 0;
    isGrounded: boolean = true;
    mouseSensitivity: number = 0.002;
    mouseSmoothing: number = 0.1;    // Adjusted for smoother camera
    horizontalAngle: number = 0;
    verticalAngle: number = 0;
    targetVerticalAngle: number = 0;  // New: for smooth vertical movement
    cameraDistance: number = 15;
    cameraMinHeight: number = 2;
    cameraMaxHeight: number = 20;
    minVerticalAngle: number = -Math.PI / 2.1;
    maxVerticalAngle: number = Math.PI / 2.1;
    cameraHeight: number = 5;       // Height above player
    rotationAngle: number = 0;      // Track total rotation
    currentEuler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
    velocity: THREE.Vector3 = new THREE.Vector3();
    direction: THREE.Vector3 = new THREE.Vector3();
    isMouseLocked: boolean = false;
    gravity: number = 9.8;
    jumpForce: number = 5;
    rotationX: number = 0;
    rotationY: number = 0;
    // New camera properties
    cameraRotation: THREE.Quaternion = new THREE.Quaternion();
    targetRotation: THREE.Quaternion = new THREE.Quaternion();
    upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
    tempVector: THREE.Vector3 = new THREE.Vector3();
    tempQuaternion: THREE.Quaternion = new THREE.Quaternion();
    // Add these new properties for improved camera control
    cameraSmoothing: number = 0.08; // Reduced for more direct control
    verticalLookLimit: number = Math.PI * 0.45; // About 80 degrees up/down
    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, vehicles: Vehicles, environment: Environment) {
        this.scene = scene;
        this.camera = camera;
        this.vehicles = vehicles;
        this.environment = environment;
        this.position = new THREE.Vector3(0, 1.7, 200);
        this.targetPosition = this.position.clone();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Remove PointerLockControls as we'll handle camera rotation directly
        document.addEventListener('click', () => {
            if (!this.isMouseLocked) {
                document.body.requestPointerLock();
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
        
        this.createPlayerModel();
        this.setupControls();

        // Initialize camera position and rotation
        this.camera.position.set(0, 5, this.cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.cameraRotation.copy(this.camera.quaternion);
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

    update(delta: number) {
        // Handle player movement based on vehicle state
        if (this.currentVehicle) {
            this.handleVehicleMovement(delta);
        } else {
            this.handleGroundMovement(delta);
        }

        // Update camera position and rotation directly
        const offset = new THREE.Vector3(0, this.cameraHeight, this.cameraDistance);
        offset.applyQuaternion(this.cameraRotation);
        this.camera.position.copy(this.position).add(offset);
        this.camera.quaternion.copy(this.cameraRotation);
    }

    handleGroundMovement(delta: number) {
        const moveDirection = new THREE.Vector3(0, 0, 0);
        
        // Get camera's forward and right vectors for movement (camera-relative movement)
        const forward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(this.cameraRotation)
            .setY(0)  // Keep movement on ground plane
            .normalize();
        
        const right = new THREE.Vector3(1, 0, 0)
            .applyQuaternion(this.cameraRotation)
            .setY(0)  // Keep movement on ground plane
            .normalize();

        // Apply movement based on key presses
        if (this.keys['w']) moveDirection.add(forward);
        if (this.keys['s']) moveDirection.sub(forward);
        if (this.keys['a']) moveDirection.sub(right);
        if (this.keys['d']) moveDirection.add(right);
        
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            const speed = this.keys['shift'] ? this.moveSpeed * 2 : this.moveSpeed;
            moveDirection.multiplyScalar(speed * delta);
            
            // Update player position
            this.position.add(moveDirection);
            this.position.y = 1.7; // Keep player at consistent height
            
            // Update player model
            this.playerModel.position.copy(this.position);
            
            // Rotate player model to face movement direction
            if (moveDirection.length() > 0) {
                const angle = Math.atan2(moveDirection.x, moveDirection.z);
                this.playerModel.rotation.y = THREE.MathUtils.lerp(
                    this.playerModel.rotation.y,
                    angle,
                    0.2
                );
            }
        }
    }

    handleVehicleMovement(delta: number) {
        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;

        // Get forward and right directions from camera
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.cameraRotation);
        forward.y = 0;
        forward.normalize();
        
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.cameraRotation);
        right.y = 0;
        right.normalize();

        // Calculate movement direction
        this.direction.set(0, 0, 0);
        
        if (this.keys['w']) this.direction.add(forward);
        if (this.keys['s']) this.direction.sub(forward);
        if (this.keys['a']) this.direction.sub(right);
        if (this.keys['d']) this.direction.add(right);
        
        if (this.direction.length() > 0) {
            this.direction.normalize();
        }

        // Apply movement with smooth acceleration
        const speed = this.currentVehicle.type === 'spaceship' ? 60 : 40;
        const acceleration = this.keys['shift'] ? speed * 2.5 : speed;
        
        this.velocity.add(this.direction.multiplyScalar(acceleration * delta));
        
        // Update target position
        this.targetPosition.add(this.velocity);

        // Handle vertical movement for spaceships
        if (this.currentVehicle.type === 'spaceship') {
            if (this.keys[' ']) {
                this.targetPosition.y += speed * delta;
            }
            if (this.keys['control']) {
                this.targetPosition.y -= speed * delta;
            }
            this.targetPosition.y = Math.max(5, Math.min(100, this.targetPosition.y));
        } else {
            this.targetPosition.y = 2;
        }

        // Update position with smoothing
        const positionSmoothing = 0.1; // Define a value since this.positionSmoothing is undefined
        this.position.lerp(this.targetPosition, positionSmoothing);
        this.currentVehicle.object.position.copy(this.position);
        this.currentVehicle.object.rotation.y = this.currentEuler.y;
    }

    onMouseMove(event: MouseEvent) {
        if (!document.pointerLockElement) return;
        
        // Accumulate rotation without constraints for horizontal movement
        this.rotationY = (this.rotationY - event.movementX * this.mouseSensitivity) % (Math.PI * 2);
        this.rotationX -= event.movementY * this.mouseSensitivity;
        
        // Only clamp vertical rotation to prevent flipping
        this.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotationX));
        
        // Apply rotations directly
        this.euler.set(this.rotationX, this.rotationY, 0, 'YXZ');
        this.cameraRotation.setFromEuler(this.euler);
    }

    setupControls() {
        // Mouse controls
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => {
            this.isMouseLocked = document.pointerLockElement !== null;
        });
    }

    isMoving(): boolean {
        return this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'];
    }
}