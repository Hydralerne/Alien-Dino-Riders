class Controls {
    constructor(player, vehicles) {
        this.player = player;
        this.vehicles = vehicles;
        this.init();
    }

    init() {
        // Set up UI controls
        this.setupUIControls();
        
        // Set up keyboard controls for vehicle interaction
        this.setupVehicleControls();

        // Initialize control variables
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        // Add keyboard event listeners
        this.initControls();
    }

    setupUIControls() {
        const dinosaurBtn = document.getElementById('select-dinosaur');
        const spaceshipBtn = document.getElementById('select-spaceship');
        const noneBtn = document.getElementById('select-none');
        
        dinosaurBtn.addEventListener('click', () => {
            const nearestDino = this.vehicles.getNearestVehicle(this.player.playerObject.position, 'dinosaur');
            if (nearestDino) {
                this.player.mountVehicle(nearestDino);
            } else {
                alert('No dinosaur nearby. Get closer to a dinosaur to ride it.');
            }
        });
        
        spaceshipBtn.addEventListener('click', () => {
            const nearestShip = this.vehicles.getNearestVehicle(this.player.playerObject.position, 'spaceship');
            if (nearestShip) {
                this.player.mountVehicle(nearestShip);
            } else {
                alert('No spaceship nearby. Get closer to a spaceship to pilot it.');
            }
        });
        
        noneBtn.addEventListener('click', () => {
            this.player.dismountVehicle();
        });
    }

    setupVehicleControls() {
        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyE') {
                // Try to find nearest vehicle
                const nearestDino = this.vehicles.getNearestVehicle(this.player.playerObject.position, 'dinosaur');
                const nearestShip = this.vehicles.getNearestVehicle(this.player.playerObject.position, 'spaceship');
                
                // Determine which is closer
                let nearestVehicle = null;
                if (nearestDino && nearestShip) {
                    const dinoDist = this.player.playerObject.position.distanceTo(nearestDino.object.position);
                    const shipDist = this.player.playerObject.position.distanceTo(nearestShip.object.position);
                    nearestVehicle = dinoDist < shipDist ? nearestDino : nearestShip;
                } else {
                    nearestVehicle = nearestDino || nearestShip;
                }
                
                if (nearestVehicle) {
                    this.player.mountVehicle(nearestVehicle);
                }
            } else if (event.code === 'KeyQ') {
                this.player.dismountVehicle();
            }
        });
    }

    initControls() {
        // Add keyboard event listeners
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
                this.controls.forward = true;
                break;
            case 's':
                this.controls.backward = true;
                break;
            case 'a':
                this.controls.left = true;
                break;
            case 'd':
                this.controls.right = true;
                break;
        }
    }

    onKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
                this.controls.forward = false;
                break;
            case 's':
                this.controls.backward = false;
                break;
            case 'a':
                this.controls.left = false;
                break;
            case 'd':
                this.controls.right = false;
                break;
        }
    }

    updateControls() {
        // This function will be called in the game loop
        // Add any additional control updates here
    }
}