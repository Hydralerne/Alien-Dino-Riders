import * as THREE from 'three';
import { Vehicles } from './Vehicles';

export class Player {
    limbs: {
        leftArm: THREE.Group | THREE.Mesh;
        rightArm: THREE.Group | THREE.Mesh;
        leftLeg: THREE.Group | THREE.Mesh;
        rightLeg: THREE.Group | THREE.Mesh;
    } = {
            leftArm: new THREE.Mesh(),
            rightArm: new THREE.Mesh(),
            leftLeg: new THREE.Mesh(),
            rightLeg: new THREE.Mesh()
        };
    animationTime: number = 0;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    vehicles: Vehicles;
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
    jumpForce: number = 5;
    gravity: number = 9.8;
    mouseSensitivity: number = 0.002;
    mouseSmoothing: number = 0.1;    // Adjusted for smoother camera
    horizontalAngle: number = 0;
    verticalAngle: number = 0;
    targetVerticalAngle: number = 0;  // New: for smooth vertical movement
    cameraDistance: number = 10; // Reduced from 15 for closer view
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
    minZoom: number = 3;  // Reduced minimum zoom distance
    maxZoom: number = 12; // Reduced maximum zoom distance
    currentZoom: number = 8; // Reduced starting zoom level
    targetZoom: number = 8;  // Reduced target zoom
    zoomSpeed: number = 0.5;  // How fast to zoom
    zoomSmoothing: number = 0.1; // How smooth the zoom transition should be
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

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, vehicles: Vehicles) {
        this.scene = scene;
        this.camera = camera;
        this.vehicles = vehicles;
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
        
        this.createPlayerModel();
        this.setupControls();

        // Initialize camera position and rotation
        this.camera.position.set(0, 5, this.cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.cameraRotation.copy(this.camera.quaternion);
    }

    createPlayerModel() {
        this.playerModel = new THREE.Group();

        // Colors
        const skinColor = 0xffdbac;
        const shirtColor = 0x2244ff;
        const pantsColor = 0x1a1a1a;

        // Head
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;  // Adjusted height
        this.playerModel.add(head);

        // Torso
        const torsoGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.25);  // Slimmer torso
        const torsoMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 1.25;  // Adjusted to connect with head
        this.playerModel.add(torso);
        
        // Create arm groups for better rotation
        const leftArmGroup = new THREE.Group();
        const rightArmGroup = new THREE.Group();
        leftArmGroup.position.set(-0.3, 1.6, 0);  // Shoulder position
        rightArmGroup.position.set(0.3, 1.6, 0);   // Shoulder position

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);  // Slimmer arms
        const armMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        const rightArm = new THREE.Mesh(armGeometry.clone(), armMaterial);
        
        // Position arms relative to their groups
        leftArm.position.y = -0.25;
        rightArm.position.y = -0.25;
        
        leftArmGroup.add(leftArm);
        rightArmGroup.add(rightArm);
        
        this.playerModel.add(leftArmGroup);
        this.playerModel.add(rightArmGroup);
        
        this.limbs.leftArm = leftArmGroup;
        this.limbs.rightArm = rightArmGroup;

        // Create leg groups for better rotation
        const leftLegGroup = new THREE.Group();
        const rightLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.2, 0.9, 0);   // Hip position
        rightLegGroup.position.set(0.2, 0.9, 0);    // Hip position

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);  // Slimmer legs
        const legMaterial = new THREE.MeshStandardMaterial({ color: pantsColor });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        const rightLeg = new THREE.Mesh(legGeometry.clone(), legMaterial);
        
        // Position legs relative to their groups
        leftLeg.position.y = -0.3;
        rightLeg.position.y = -0.3;
        
        leftLegGroup.add(leftLeg);
        rightLegGroup.add(rightLeg);
        
        this.playerModel.add(leftLegGroup);
        this.playerModel.add(rightLegGroup);
        
        this.limbs.leftLeg = leftLegGroup;
        this.limbs.rightLeg = rightLegGroup;

        // Update position
        this.playerModel.position.copy(this.position);
        this.scene.add(this.playerModel);
    }

    animateCharacter(delta: number) {
        if (this.isMoving()) {
            // Faster animation when running
            const animationSpeed = this.keys['shift'] ? 8 : 5;
            this.animationTime += delta * animationSpeed;
            
            // Calculate swing angles with better range of motion
            const swingAngle = Math.sin(this.animationTime) * 0.7; // About 40 degrees max
            
            // Animate limbs with proper phase offset for natural walking
            this.limbs.leftArm.rotation.x = -swingAngle;
            this.limbs.rightArm.rotation.x = swingAngle;
            this.limbs.leftLeg.rotation.x = swingAngle;
            this.limbs.rightLeg.rotation.x = -swingAngle;
            
            // Add slight side-to-side rotation for more natural movement
            const sideAngle = Math.sin(this.animationTime * 2) * 0.1;
            this.limbs.leftArm.rotation.z = sideAngle;
            this.limbs.rightArm.rotation.z = -sideAngle;
            
            // Add slight torso bob but keep it at a fixed height
            const baseHeight = this.currentVehicle ? 2 : 1.7;
            const bobHeight = Math.abs(Math.sin(this.animationTime * 2)) * 0.1;
            this.playerModel.position.y = baseHeight + bobHeight;
        } else {
            // Smoothly return to idle pose
            this.animationTime = 0;
            this.resetLimbPositions();
            // Reset to base height when not moving
            this.playerModel.position.y = this.currentVehicle ? 2 : 1.7;
        }
    }

    resetLimbPositions() {
        // Smoothly interpolate back to neutral position
        ['leftArm', 'rightArm', 'leftLeg', 'rightLeg'].forEach(limb => {
            if (this.limbs[limb as keyof typeof this.limbs].rotation.x !== 0) {
                this.limbs[limb as keyof typeof this.limbs].rotation.x *= 0.85;
            }
            if (this.limbs[limb as keyof typeof this.limbs].rotation.z !== 0) {
                this.limbs[limb as keyof typeof this.limbs].rotation.z *= 0.85;
            }
        });
    }

    setupControls() {
        // Mouse controls
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => {
            this.isMouseLocked = document.pointerLockElement !== null;
        });

        // Keyboard controls
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        // Vehicle selection
        const dinoButton = document.getElementById('select-dinosaur');
        const shipButton = document.getElementById('select-spaceship');
        const noneButton = document.getElementById('select-none');

        if (dinoButton) dinoButton.addEventListener('click', () => this.selectVehicle('dinosaur'));
        if (shipButton) shipButton.addEventListener('click', () => this.selectVehicle('spaceship'));
        if (noneButton) noneButton.addEventListener('click', () => this.selectVehicle('none'));

        // Add mouse wheel zoom control
        window.addEventListener('wheel', (e) => {
            // Zoom in/out based on wheel direction
            this.targetZoom += e.deltaY * this.zoomSpeed * 0.01;
            
            // Clamp zoom level between min and max
            this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom));
        });
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
            const speed = this.keys['shift'] ? this.moveSpeed * 3 : this.moveSpeed;
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

        // Always animate character when moving
        this.animateCharacter(delta);
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
        const positionSmoothing = 0.1;
        this.position.lerp(this.targetPosition, positionSmoothing);
        this.currentVehicle.object.position.copy(this.position);
        this.currentVehicle.object.rotation.y = this.currentEuler.y;
    }

    isMoving(): boolean {
        return this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'];
    }
} 