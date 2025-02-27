import * as THREE from 'three';
import { Vehicles } from './Vehicles';

export class Player {
    limbs: {
        head: THREE.Group;
        torso: THREE.Group;
        leftArm: THREE.Group;
        rightArm: THREE.Group;
        leftLeg: THREE.Group;
        rightLeg: THREE.Group;
    } = {
            head: new THREE.Group(),
            torso: new THREE.Group(),
            leftArm: new THREE.Group(),
            rightArm: new THREE.Group(),
            leftLeg: new THREE.Group(),
            rightLeg: new THREE.Group()
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
    jumpForce: number = 15;
    gravity: number = 30;
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

        // Colors - more vibrant and appealing
        const skinColor = 0xffdbac;
        const shirtColor = 0x3366ff;
        const pantsColor = 0x292929;
        const bootColor = 0x4d2600;
        const hairColor = 0x3d2314;
        const beltColor = 0xc27400;

        // Create the main player group
        const playerGroup = new THREE.Group();
        this.playerModel.add(playerGroup);

        // Head - create a group for head components
        const headGroup = new THREE.Group();
        headGroup.position.y = 1.8;

        // Base head - slightly rounded
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        headGroup.add(head);

        // Hair - simple stylized hair
        const hairGeometry = new THREE.SphereGeometry(0.26, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: hairColor });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.05;
        hair.rotation.x = Math.PI * 0.1;
        headGroup.add(hair);

        // Face features
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry.clone(), eyeMaterial);

        leftEye.position.set(-0.1, 0.05, 0.22);
        rightEye.position.set(0.1, 0.05, 0.22);

        // Pupils
        const pupilGeometry = new THREE.SphereGeometry(0.025, 6, 6);
        const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        const rightPupil = new THREE.Mesh(pupilGeometry.clone(), pupilMaterial);

        leftPupil.position.set(0, 0, 0.03);
        rightPupil.position.set(0, 0, 0.03);

        leftEye.add(leftPupil);
        rightEye.add(rightPupil);
        headGroup.add(leftEye);
        headGroup.add(rightEye);

        // Mouth - simple curved line
        const mouthGeometry = new THREE.TorusGeometry(0.08, 0.015, 8, 6, Math.PI);
        const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x992222 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.1, 0.22);
        mouth.rotation.x = Math.PI / 2;
        headGroup.add(mouth);

        playerGroup.add(headGroup);
        this.limbs.head = headGroup;

        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8);
        const neckMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = 1.65;
        playerGroup.add(neck);

        // Torso - more tapered and stylized
        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.3;

        // Upper body
        const upperTorsoGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.4, 8);
        const torsoMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
        const upperTorso = new THREE.Mesh(upperTorsoGeometry, torsoMaterial);
        upperTorso.position.y = 0.15;
        torsoGroup.add(upperTorso);

        // Lower body
        const lowerTorsoGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.3, 8);
        const lowerTorso = new THREE.Mesh(lowerTorsoGeometry, torsoMaterial);
        lowerTorso.position.y = -0.2;
        torsoGroup.add(lowerTorso);

        // Belt
        const beltGeometry = new THREE.CylinderGeometry(0.26, 0.26, 0.06, 8);
        const beltMaterial = new THREE.MeshStandardMaterial({ color: beltColor });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = -0.33;
        torsoGroup.add(belt);

        playerGroup.add(torsoGroup);
        this.limbs.torso = torsoGroup;

        // Arms - create arm groups with shoulder, elbow joints
        // Left Arm
        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(-0.35, 1.5, 0);

        // Upper arm
        const upperArmGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.35, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
        const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        leftUpperArm.position.y = -0.175;
        leftUpperArm.rotation.z = Math.PI * 0.1;
        leftArmGroup.add(leftUpperArm);

        // Elbow joint
        const elbowGeometry = new THREE.SphereGeometry(0.07, 8, 8);
        const leftElbow = new THREE.Mesh(elbowGeometry, armMaterial);
        leftElbow.position.y = -0.35;
        leftArmGroup.add(leftElbow);

        // Lower arm
        const lowerArmGeometry = new THREE.CylinderGeometry(0.07, 0.06, 0.35, 8);
        const leftLowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial);
        leftLowerArm.position.y = -0.525;
        leftArmGroup.add(leftLowerArm);

        // Hand
        const handGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.y = -0.7;
        leftArmGroup.add(leftHand);

        playerGroup.add(leftArmGroup);
        this.limbs.leftArm = leftArmGroup;

        // Right Arm - mirror of left
        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set(0.35, 1.5, 0);

        const rightUpperArm = new THREE.Mesh(upperArmGeometry.clone(), armMaterial);
        rightUpperArm.position.y = -0.175;
        rightUpperArm.rotation.z = -Math.PI * 0.1;
        rightArmGroup.add(rightUpperArm);

        const rightElbow = new THREE.Mesh(elbowGeometry.clone(), armMaterial);
        rightElbow.position.y = -0.35;
        rightArmGroup.add(rightElbow);

        const rightLowerArm = new THREE.Mesh(lowerArmGeometry.clone(), armMaterial);
        rightLowerArm.position.y = -0.525;
        rightArmGroup.add(rightLowerArm);

        const rightHand = new THREE.Mesh(handGeometry.clone(), handMaterial);
        rightHand.position.y = -0.7;
        rightArmGroup.add(rightHand);

        playerGroup.add(rightArmGroup);
        this.limbs.rightArm = rightArmGroup;

        // Legs
        // Left Leg
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.15, 0.9, 0);

        // Upper leg
        const upperLegGeometry = new THREE.CylinderGeometry(0.09, 0.08, 0.4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: pantsColor });
        const leftUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
        leftUpperLeg.position.y = -0.2;
        leftLegGroup.add(leftUpperLeg);

        // Knee joint
        const kneeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const leftKnee = new THREE.Mesh(kneeGeometry, legMaterial);
        leftKnee.position.y = -0.4;
        leftLegGroup.add(leftKnee);

        // Lower leg
        const lowerLegGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.4, 8);
        const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        leftLowerLeg.position.y = -0.6;
        leftLegGroup.add(leftLowerLeg);

        // Boot
        const bootGeometry = new THREE.BoxGeometry(0.14, 0.12, 0.25);
        const bootMaterial = new THREE.MeshStandardMaterial({ color: bootColor });
        const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        leftBoot.position.set(0, -0.82, 0.04);
        leftLegGroup.add(leftBoot);

        playerGroup.add(leftLegGroup);
        this.limbs.leftLeg = leftLegGroup;

        // Right Leg - mirror of left
        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.15, 0.9, 0);

        const rightUpperLeg = new THREE.Mesh(upperLegGeometry.clone(), legMaterial);
        rightUpperLeg.position.y = -0.2;
        rightLegGroup.add(rightUpperLeg);

        const rightKnee = new THREE.Mesh(kneeGeometry.clone(), legMaterial);
        rightKnee.position.y = -0.4;
        rightLegGroup.add(rightKnee);

        const rightLowerLeg = new THREE.Mesh(lowerLegGeometry.clone(), legMaterial);
        rightLowerLeg.position.y = -0.6;
        rightLegGroup.add(rightLowerLeg);

        const rightBoot = new THREE.Mesh(bootGeometry.clone(), bootMaterial);
        rightBoot.position.set(0, -0.82, 0.04);
        rightLegGroup.add(rightBoot);

        playerGroup.add(rightLegGroup);
        this.limbs.rightLeg = rightLegGroup;

        // Add cast shadows for all body parts
        this.playerModel.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

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

            // Head and torso subtle movement
            this.limbs.head.rotation.y = Math.sin(this.animationTime * 0.5) * 0.2;
            this.limbs.torso.rotation.y = Math.sin(this.animationTime * 0.5) * 0.1;

            // Add slight side-to-side rotation for more natural movement
            const sideAngle = Math.sin(this.animationTime * 2) * 0.1;
            this.limbs.leftArm.rotation.z = 0.1 + sideAngle;  // Add base angle plus animation
            this.limbs.rightArm.rotation.z = -0.1 - sideAngle;

            // Add slight torso bob but keep it at a fixed height
            const baseHeight = this.currentVehicle ? 2 : 1.7;
            const bobHeight = Math.abs(Math.sin(this.animationTime * 2)) * 0.1;
            this.playerModel.position.y = baseHeight + bobHeight;
        } else {
            // Smoothly return to idle pose
            this.limbs.head.rotation.y *= 0.9;
            this.limbs.torso.rotation.y *= 0.9;

            // Idle breathing animation
            const breathingRate = 1.5;
            const breathingDepth = 0.03;
            this.animationTime += delta * breathingRate;
            const breathingMotion = Math.sin(this.animationTime) * breathingDepth;

            this.limbs.torso.position.y = breathingMotion;
            this.limbs.leftArm.rotation.x = breathingMotion * 0.2;
            this.limbs.rightArm.rotation.x = breathingMotion * 0.2;

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
                // Keep base pose angles
                const baseAngle = limb.includes('left') ? 0.1 : -0.1;
                this.limbs[limb].rotation.z = baseAngle + (this.limbs[limb].rotation.z - baseAngle) * 0.85;
            }
        });
    }

    // Rest of the class remains the same
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

        // Handle jumping and gravity when not in a vehicle
        if (!this.currentVehicle) {
            // Apply gravity
            this.verticalVelocity -= this.gravity * delta;

            // Handle jumping
            if (this.isGrounded && this.keys[' ']) {
                this.verticalVelocity = this.jumpForce;
                this.isGrounded = false;
            }

            // Update vertical position
            this.targetPosition.y += this.verticalVelocity * delta;

            // Ground check (assuming ground is at y = 1.7)
            if (this.targetPosition.y <= 1.7) {
                this.targetPosition.y = 1.7;
                this.verticalVelocity = 0;
                this.isGrounded = true;
            }
        }
        // Handle vertical movement for spaceships
        else if (this.currentVehicle.type === 'spaceship') {
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