import * as THREE from 'three';

export class Environment {
    scene: THREE.Scene;
    loadingManager: THREE.LoadingManager;

    constructor(scene: THREE.Scene, loadingManager: THREE.LoadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.init();
    }

    init() {
        this.createGround();
        this.createPyramids();
        this.createSphinx();
    }

    createGround() {
        // Create a larger desert ground
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xDEB887,  // Desert sand color
            roughness: 1,
            metalness: 0
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createPyramids() {
        // Create the three main pyramids of Giza
        const pyramidPositions = [
            new THREE.Vector3(0, 0, 0),          // Great Pyramid of Giza (centered)
            new THREE.Vector3(-150, 0, 100),     // Pyramid of Khafre (moved further)
            new THREE.Vector3(-300, 0, 200)      // Pyramid of Menkaure (moved further)
        ];
        
        const pyramidSizes = [200, 180, 100];  // Increased sizes for more prominence
        
        pyramidPositions.forEach((position, index) => {
            const height = pyramidSizes[index];
            const base = height * 1.7;  // Approximate base to height ratio
            
            const pyramidGeometry = new THREE.ConeGeometry(base, height, 4);
            const pyramidMaterial = new THREE.MeshStandardMaterial({
                color: 0xF4E6CC,  // Light limestone color
                roughness: 0.8,
                metalness: 0.1
            });
            
            const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
            pyramid.position.copy(position);
            pyramid.castShadow = true;
            pyramid.receiveShadow = true;
            
            // Rotate to align with cardinal directions
            pyramid.rotation.y = Math.PI / 4;
            
            this.scene.add(pyramid);
        });
    }

    createSphinx() {
        // Create a simplified Sphinx using primitive shapes
        const sphinxGroup = new THREE.Group();
        
        const sphinxMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8D5B7,  // Sandstone color
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Body (elongated box)
        const bodyGeometry = new THREE.BoxGeometry(20, 8, 40);
        const body = new THREE.Mesh(bodyGeometry, sphinxMaterial);
        sphinxGroup.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(10, 15, 12);
        const head = new THREE.Mesh(headGeometry, sphinxMaterial);
        head.position.set(0, 8, 15);
        sphinxGroup.add(head);
        
        // Face details (simplified)
        const faceGeometry = new THREE.BoxGeometry(8, 12, 2);
        const face = new THREE.Mesh(faceGeometry, sphinxMaterial);
        face.position.set(0, 8, 22);
        sphinxGroup.add(face);
        
        // Position the entire Sphinx
        sphinxGroup.position.set(100, 4, -100);  // Moved further from pyramids
        sphinxGroup.rotation.y = -Math.PI / 6;
        
        // Add shadows
        sphinxGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        this.scene.add(sphinxGroup);
    }
} 