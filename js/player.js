class Player {
    constructor(scene, camera, loadingManager) {
        this.scene = scene;
        this.camera = camera;
        this.loadingManager = loadingManager;
        this.playerObject = null;
        this.moveSpeed = 15;
        this.turnSpeed = 2;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = true;
        this.currentVehicle = null;
        
        this.init();
    }

    init() {
        // Create a simple player model (will be replaced with a proper character model)
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        this.playerObject = new THREE.Mesh(geometry, material);
        this.playerObject.position.set(0, 1, 20);
        this.scene.add(this.playerObject);
        
        // Position camera behind player
        this.updateCameraPosition();
        
        // Set up keyboard controls
        this.setupKeyControls();
    }

    setupKeyControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'Space':
                    if (this.canJump) {
                        this.velocity.y = 10;
                        this.canJump = false;
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        });
    }

    update(delta) {
        // Handle movement
        const speed = this.currentVehicle ? this.currentVehicle.speed : this.moveSpeed;
        const turnSpeed = this.currentVehicle ? this.currentVehicle.turnSpeed : this.turnSpeed;
        
        // Calculate movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        
        // Apply movement
        if (this.moveForward || this.moveBackward) {
            this.velocity.z = -this.direction.z * speed * delta;
        } else {
            this.velocity.z = 0;
        }
        
        if (this.moveLeft || this.moveRight) {
            this.velocity.x = -this.direction.x * speed * delta;
        } else {
            this.velocity.x = 0;
        }
        
        // Apply gravity if not on vehicle
        if (!this.currentVehicle) {
            this.velocity.y -= 9.8 * delta; // Apply gravity
            
            // Check if player is on ground
            if (this.playerObject.position.y <= 1) {
                this.velocity.y = 0;
                this.playerObject.position.y = 1;
                this.canJump = true;
            }
            
            // Update player position
            this.playerObject.position.x += this.velocity.x;
            this.playerObject.position.z += this.velocity.z;
            this.playerObject.position.y += this.velocity.y * delta;
        } else {
            // When on a vehicle, move the vehicle instead
            const vehicleObj = this.currentVehicle.object;
            
            // Rotate vehicle based on left/right movement
            if (this.moveLeft) {
                vehicleObj.rotation.y += turnSpeed * delta;
            }
            if (this.moveRight) {
                vehicleObj.rotation.y -= turnSpeed * delta;
            }
            
            // Move vehicle forward/backward in the direction it's facing
            if (this.moveForward || this.moveBackward) {
                // Calculate forward direction based on vehicle's rotation
                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicleObj.rotation.y);
                
                // Apply movement in that direction
                const moveDistance = (this.moveForward ? 1 : -1) * speed * delta;
                vehicleObj.position.x += direction.x * moveDistance;
                vehicleObj.position.z += direction.z * moveDistance;
            }
            
            // Special handling for spaceship - can move up/down
            if (this.currentVehicle.type === 'spaceship') {
                if (this.canJump && this.velocity.y === 0) { // Space pressed
                    vehicleObj.position.y += 2 * delta;
                } else if (this.moveBackward && this.moveForward) { // S+W pressed together
                    vehicleObj.position.y -= 2 * delta;
                    // Don't go below minimum height
                    if (vehicleObj.position.y < 5) {
                        vehicleObj.position.y = 5;
                    }
                }
            }
            
            // Update player position to match vehicle
            if (this.currentVehicle.type === 'dinosaur') {
                // Position player on dinosaur's back
                this.playerObject.position.copy(vehicleObj.position);
                this.playerObject.position.y += 4; // Sit on dinosaur's back
            } else if (this.currentVehicle.type === 'spaceship') {
                // Position player in spaceship cockpit
                this.playerObject.position.copy(vehicleObj.position);
                this.playerObject.position.y += 1; // Sit in cockpit
            }
        }
        
        // Update camera position
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        // Position camera behind player
        const offset = new THREE.Vector3(0, 5, 10);
        const cameraPosition = this.playerObject.position.clone().add(offset);
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(this.playerObject.position);
    }
    
    mountVehicle(vehicle) {
        if (this.currentVehicle) {
            this.dismountVehicle();
        }
        
        this.currentVehicle = vehicle;
        
        // Position player on the vehicle
        if (vehicle.type === 'dinosaur') {
            // Position player on dinosaur's back
            this.playerObject.position.copy(vehicle.object.position);
            this.playerObject.position.y += 4; // Sit on dinosaur's back
            
            // Make player visible but smaller to show rider
            this.playerObject.scale.set(0.7, 0.7, 0.7);
            this.playerObject.visible = true;
            
            // Adjust camera for dinosaur riding
            this.camera.position.y += 3;
            this.camera.position.z += 2;
        } else if (vehicle.type === 'spaceship') {
            // Position player inside spaceship (cockpit)
            this.playerObject.position.copy(vehicle.object.position);
            this.playerObject.position.y += 1; // Sit in cockpit
            
            // Hide player as they're inside the spaceship
            this.playerObject.visible = false;
            
            // Adjust camera for spaceship piloting
            this.camera.position.y += 5;
            this.camera.position.z -= 3; // Move camera closer for better view
        }
        
        console.log(`Mounted ${vehicle.type} (${vehicle.name})`); // Show vehicle name too
    }
    
    dismountVehicle() {
        if (!this.currentVehicle) return;
        
        // Place player next to vehicle
        this.playerObject.position.copy(this.currentVehicle.object.position);
        this.playerObject.position.x += 3;
        this.playerObject.position.y = 1; // Reset to ground level
        
        // Reset player appearance
        this.playerObject.scale.set(1, 1, 1);
        this.playerObject.visible = true;
        
        this.currentVehicle = null;
        console.log('Dismounted vehicle');
    }
}

let player;
let playerSpeed = 0.1;

function initPlayer() {
    // Create a simple player representation (red box)
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 1, 0);
    player.castShadow = true;
    scene.add(player);
}

function updatePlayer() {
    // Update player position based on controls
    if (controls) {
        if (controls.forward) player.position.z -= playerSpeed;
        if (controls.backward) player.position.z += playerSpeed;
        if (controls.left) player.position.x -= playerSpeed;
        if (controls.right) player.position.x += playerSpeed;

        // Update camera to follow player
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 10;
        camera.lookAt(player.position);
    }
}