import * as THREE from 'three';
import { Vehicles } from './Vehicles';

export class Player {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    vehicles: Vehicles;
    currentVehicle: any | null = null;
    moveSpeed: number = 15;
    turnSpeed: number = 2.5;
    position: THREE.Vector3;
    rotation: number = 0;
    playerModel!: THREE.Group;
    keys: { [key: string]: boolean } = {};

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, vehicles: Vehicles) {
        this.scene = scene;
        this.camera = camera;
        this.vehicles = vehicles;
        this.position = new THREE.Vector3(0, 1.7, 200);
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

        // Vehicle selection
        const dinoButton = document.getElementById('select-dinosaur');
        const shipButton = document.getElementById('select-spaceship');
        const noneButton = document.getElementById('select-none');

        if (dinoButton) dinoButton.addEventListener('click', () => this.selectVehicle('dinosaur'));
        if (shipButton) shipButton.addEventListener('click', () => this.selectVehicle('spaceship'));
        if (noneButton) noneButton.addEventListener('click', () => this.selectVehicle('none'));
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
        this.moveSpeed = vehicle.type === 'spaceship' ? 40 : 25;
        this.turnSpeed = vehicle.type === 'spaceship' ? 3 : 2;
        this.playerModel.visible = false;
        
        this.position.copy(vehicle.object.position);
    }

    dismountVehicle() {
        this.currentVehicle = null;
        this.moveSpeed = 15;
        this.turnSpeed = 2.5;
        this.playerModel.visible = true;
        this.playerModel.position.copy(this.position);
    }

    update(delta: number) {
        // Handle movement
        const moveDir = new THREE.Vector3();
        const rotateAmount = new THREE.Vector3();

        if (this.keys['w']) moveDir.z -= 1;
        if (this.keys['s']) moveDir.z += 1;
        if (this.keys['a']) rotateAmount.y += 1;
        if (this.keys['d']) rotateAmount.y -= 1;
        if (this.keys['shift']) {
            moveDir.multiplyScalar(2);
        }

        // Apply rotation with smooth interpolation
        this.rotation += rotateAmount.y * this.turnSpeed * delta;

        // Apply movement in the direction we're facing
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        this.position.addScaledVector(forward, moveDir.z * this.moveSpeed * delta);

        // Update player or vehicle position
        if (this.currentVehicle) {
            this.currentVehicle.object.position.copy(this.position);
            this.currentVehicle.object.rotation.y = this.rotation;
            
            const cameraHeight = this.currentVehicle.type === 'spaceship' ? 15 : 8;
            const cameraDistance = this.currentVehicle.type === 'spaceship' ? 20 : 15;
            
            const cameraOffset = new THREE.Vector3(0, cameraHeight, cameraDistance);
            cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
            this.camera.position.copy(this.position).add(cameraOffset);
        } else {
            this.playerModel.position.copy(this.position);
            this.playerModel.rotation.y = this.rotation;
            
            const cameraOffset = new THREE.Vector3(0, 5, 15);
            cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
            this.camera.position.copy(this.position).add(cameraOffset);
        }

        const lookTarget = this.position.clone().add(forward.multiplyScalar(10));
        this.camera.lookAt(lookTarget);
    }
} 