import * as THREE from 'three';
import { EnvironmentEnhancements } from './EnvironmentEnhancements';

export class Environment {
    scene: THREE.Scene;
    loadingManager: THREE.LoadingManager;
    pyramids: THREE.Mesh[] = [];
    enhancements!: EnvironmentEnhancements;

    constructor(scene: THREE.Scene, loadingManager: THREE.LoadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.init();
    }

    init() {
        this.createGround();
        this.createPyramids();
        this.createSphinx();
        // Initialize the environment enhancements
        this.enhancements = new EnvironmentEnhancements(this.scene, this.loadingManager);
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
        const pyramidPositions = [
            new THREE.Vector3(0, 0, 0),          // Great Pyramid
            new THREE.Vector3(-400, 0, -250),    // Khafre
            new THREE.Vector3(-800, 0, -500)     // Menkaure
        ];
        
        const pyramidSizes = [
            { height: 280, baseWidth: 440 },     // Great Pyramid
            { height: 260, baseWidth: 410 },     // Khafre
            { height: 140, baseWidth: 220 }      // Menkaure
        ];
        
        pyramidPositions.forEach((position, index) => {
            const { height, baseWidth } = pyramidSizes[index];
            
            const pyramidGeometry = new THREE.ConeGeometry(
                baseWidth / 2,    // radius
                height,           // height
                4,               // sides
                24              // heightSegments
            );
            
            const pyramidMaterial = new THREE.MeshStandardMaterial({
                color: 0xE8DCC5,   // Limestone color
                roughness: 0.75,
                metalness: 0.1,
            });
            
            const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
            
            // Only horizontal block lines
            const blockHeight = height / 24;
            for(let i = 0; i <= 24; i++) {
                const y = (i * blockHeight) - (height / 2);
                const lineGeometry = new THREE.CircleGeometry(
                    baseWidth/2 * (1 - (i/24)),
                    4
                );
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: 0x8B7355,
                    linewidth: 1
                });
                const line = new THREE.LineLoop(lineGeometry, lineMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.y = y;
                pyramid.add(line);
            }
            
            pyramid.position.copy(position);
            pyramid.castShadow = true;
            pyramid.receiveShadow = true;
            pyramid.rotation.y = Math.PI / 4;
            
            this.pyramids.push(pyramid);
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
        
        // Position the Sphinx outside and beside the pyramids
        sphinxGroup.position.set(200, 4, 50);  // Moved to the right side of the pyramids
        sphinxGroup.rotation.y = -Math.PI / 4;  // Facing towards the pyramids
        
        // Add shadows
        sphinxGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        this.scene.add(sphinxGroup);
    }

    // Method to check collision with pyramids using the actual pyramid meshes
    checkPyramidCollision(position: THREE.Vector3): { collides: boolean; surfaceY: number } {
        // No collision detection - player can walk freely
        return {
            collides: false,
            surfaceY: 0
        };
    }
} 