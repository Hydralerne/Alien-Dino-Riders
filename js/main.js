// Initialize Three.js components
let scene, camera, renderer;
let loadingManager;
let loadingScreen = document.getElementById('loading-screen');
let progressBar = document.querySelector('.progress-bar-fill');
let loadingText = document.querySelector('.loading-text');
let game;

class PyramidsGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.player = null;
        this.environment = null;
        this.vehicles = null;
        this.loadingManager = null;
        this.clock = new THREE.Clock();
        this.gameState = {
            isLoading: true,
            currentVehicle: null
        };
        this.init();
    }

    init() {
        // Create loading manager first
        this.loadingManager = new THREE.LoadingManager();
        this.setupLoadingManager();

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000
        );
        this.camera.position.set(0, 10, 30);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Add lights
        this.setupLights();
        
        // Initialize game components
        this.environment = new Environment(this.scene, this.loadingManager);
        this.vehicles = new Vehicles(this.scene, this.loadingManager);
        this.player = new Player(this.scene, this.camera, this.loadingManager);
        this.controls = new Controls(this.player, this.vehicles);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Start animation loop
        this.animate();
    }

    setupLoadingManager() {
        const progressBar = document.querySelector('.progress-bar-fill');
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = document.querySelector('.loading-text');
        
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            progressBar.style.width = progress + '%';
            loadingText.textContent = `Loading: ${Math.round(progress)}%`;
        };
        
        this.loadingManager.onLoad = () => {
            console.log('All resources loaded');
            this.gameState.isLoading = false;
            loadingScreen.style.display = 'none';
        };

        this.loadingManager.onError = (url) => {
            console.error('Error loading:', url);
        };
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (!this.gameState.isLoading) {
            this.updateGame(delta);
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    updateGame(delta) {
        if (this.player) {
            this.player.update(delta);
        }
        
        if (this.vehicles) {
            this.vehicles.update(delta);
        }
        
        if (this.controls) {
            this.controls.update(delta);
        }
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    game = new PyramidsGame();
});