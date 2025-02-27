import * as THREE from 'three';
import { Vehicles } from './Vehicles';

export class Player {
    limbs: {
        leftArm: THREE.Mesh;
        rightArm: THREE.Mesh;
        leftLeg: THREE.Mesh;
        rightLeg: THREE.Mesh;
    } = {
            leftArm: new THREE.Mesh(),
            rightArm: new THREE.Mesh(),
            leftLeg: new THREE.Mesh(),
            rightLeg: new THREE.Mesh()
        };
    animationTime: number = 0;
    isMoving: boolean = false;
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
    minZoom: number = 5;  // Minimum distance (most zoomed in)
    maxZoom: number = 20; // Maximum distance (most zoomed out)
    currentZoom: number = 10; // Starting zoom level
    targetZoom: number = 10;  // For smooth zooming
    zoomSpeed: number = 0.5;  // How fast to zoom
    zoomSmoothing: number = 0.1; // How smooth the zoom transition should be

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
        this.isMoving = this.direction.length() > 0;
        
        if (this.isMoving) {
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
            if (this.limbs[limb].rotation.x !== 0) {
                this.limbs[limb].rotation.x *= 0.85;
            }
            if (this.limbs[limb].rotation.z !== 0) {
                this.limbs[limb].rotation.z *= 0.85;
            }
        });
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

        // Add mouse wheel zoom control
        window.addEventListener('wheel', (e) => {
            // Zoom in/out based on wheel direction
            this.targetZoom += e.deltaY * this.zoomSpeed * 0.01;
            
            // Clamp zoom level between min and max
            this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom));
        });
    }

    onMouseMove(event: MouseEvent) {
        if (!this.isMouseLocked) return;

        // Update target euler angles with mouse movement
        this.targetEuler.y -= event.movementX * this.mouseSensitivity;
        this.targetEuler.x -= event.movementY * this.mouseSensitivity;

        // Increase vertical rotation range to about 80 degrees up and down
        // (changed from Math.PI/2 which was 90 degrees)
        const maxVerticalRotation = (Math.PI * 0.85);
        this.targetEuler.x = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, this.targetEuler.x));
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

        // After updating player position, add this:
        if (!this.currentVehicle) {
            this.animateCharacter(delta);
        }

        // Apply smoothed rotation to camera
        this.camera.quaternion.setFromEuler(this.currentEuler);

        // Update player model rotation to match camera
        this.playerModel.rotation.y = this.currentEuler.y;

        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;

        // Get forward and right directions from camera, but ignore vertical rotation for movement
        const movementEuler = new THREE.Euler(0, this.currentEuler.y, 0, 'YXZ');
        const movementQuat = new THREE.Quaternion().setFromEuler(movementEuler);
        
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(movementQuat);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(movementQuat);

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

        // Smooth zoom interpolation
        this.currentZoom += (this.targetZoom - this.currentZoom) * this.zoomSmoothing;

        // Update camera position for third-person view with zoom and improved vertical rotation
        const verticalOffset = Math.sin(this.currentEuler.x) * this.currentZoom;
        const horizontalDistance = Math.cos(Math.abs(this.currentEuler.x)) * this.currentZoom;

        const cameraOffset = new THREE.Vector3(
            -Math.sin(this.currentEuler.y) * horizontalDistance,
            (this.currentVehicle ? 8 : 5) + verticalOffset, // Keep base height constant
            -Math.cos(this.currentEuler.y) * horizontalDistance
        );

        const targetCameraPos = this.position.clone().add(cameraOffset);
        this.camera.position.lerp(targetCameraPos, 0.15);

        // Make camera look at player with smoothed position
        const lookAtPos = this.position.clone();
        lookAtPos.y += this.currentVehicle ? 4 : 2;
        this.camera.lookAt(lookAtPos);
    }
} 