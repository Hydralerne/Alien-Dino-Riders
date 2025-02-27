class Environment {
    constructor(scene, loadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.textureGenerator = new TextureGenerator();
        this.init();
    }

    init() {
        // Create ground
        this.createGround();
        
        // Create pyramids
        this.createPyramids();
        
        // Create skybox
        this.createSkybox();
    }

    createGround() {
        // Create a large desert ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xdeb887,  // Sandy color
            roughness: 1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createPyramids() {
        // Create pyramids
        this.createPyramid(-10, 0, -20);
        this.createPyramid(10, 0, -30);
        this.createPyramid(0, 0, -40);
    }

    createPyramid(x, y, z) {
        const pyramidGeometry = new THREE.ConeGeometry(8, 12, 4);
        const pyramidMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe6c699,  // Sandy limestone color
            roughness: 0.8
        });
        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramid.position.set(x, y + 6, z);  // y + 6 to place it on the ground
        pyramid.castShadow = true;
        pyramid.receiveShadow = true;
        this.scene.add(pyramid);
    }

    createSkybox() {
        // Simple sky color is already set in the main class
        // For a more advanced skybox, we would load cube textures here
    }
}