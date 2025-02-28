import * as THREE from 'three';

export class EnvironmentEnhancements {
    private scene: THREE.Scene;
    private loadingManager: THREE.LoadingManager;

    constructor(scene: THREE.Scene, loadingManager: THREE.LoadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.init();
    }

    private init() {
        this.createPalmTrees();
        this.createOasis();
        this.createDunes();
        this.createDecorations();
    }

    private createPalmTrees() {
        const treePositions = [
            new THREE.Vector3(300, 0, 200),
            new THREE.Vector3(350, 0, 180),
            new THREE.Vector3(320, 0, 250),
            new THREE.Vector3(-200, 0, 300),
            new THREE.Vector3(-250, 0, 280),
        ];

        treePositions.forEach(position => {
            const palmTree = this.createSinglePalmTree();
            palmTree.position.copy(position);
            this.scene.add(palmTree);
        });
    }

    private createSinglePalmTree() {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(5, 8, 60, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1,
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Leaves
        const leavesGeometry = new THREE.ConeGeometry(30, 40, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({
            color: 0x2F4F2F,
            roughness: 0.8,
            metalness: 0.1,
        });

        // Create multiple leaf layers
        for (let i = 0; i < 3; i++) {
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 40 + (i * 10);
            leaves.scale.y = 0.5;
            leaves.rotation.x = 0.2 * i;
            leaves.castShadow = true;
            treeGroup.add(leaves);
        }

        return treeGroup;
    }

    private createOasis() {
        // Water pool
        const waterGeometry = new THREE.CircleGeometry(80, 32);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4FA4C8,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.5,
        });
        const waterPool = new THREE.Mesh(waterGeometry, waterMaterial);
        waterPool.rotation.x = -Math.PI / 2;
        waterPool.position.set(300, 0.5, 200);
        this.scene.add(waterPool);

        // Add rocks around the oasis
        this.createOasisRocks(300, 200, 80);
    }

    private createOasisRocks(centerX: number, centerZ: number, radius: number) {
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1,
        });

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const z = centerZ + Math.sin(angle) * radius;

            const rockGeometry = new THREE.DodecahedronGeometry(
                5 + Math.random() * 5,
                0
            );
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, 2, z);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }

    private createDunes() {
        const duneGeometry = new THREE.SphereGeometry(100, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const duneMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C,
            roughness: 1,
            metalness: 0,
        });

        const dunePositions = [
            new THREE.Vector3(500, -20, -200),
            new THREE.Vector3(-400, -20, 400),
            new THREE.Vector3(200, -20, -500),
        ];

        dunePositions.forEach(position => {
            const dune = new THREE.Mesh(duneGeometry, duneMaterial);
            dune.position.copy(position);
            dune.scale.set(1 + Math.random() * 0.5, 0.3, 1 + Math.random() * 0.5);
            dune.rotation.y = Math.random() * Math.PI;
            dune.receiveShadow = true;
            this.scene.add(dune);
        });
    }

    private createDecorations() {
        // Add some ancient Egyptian decorative elements
        this.createObelisk(100, 150);
        this.createObelisk(-100, 150);
        this.createAncientPillars();
    }

    private createObelisk(x: number, z: number) {
        const obeliskGroup = new THREE.Group();

        // Base
        const baseGeometry = new THREE.BoxGeometry(10, 5, 10);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C,
            roughness: 0.8,
            metalness: 0.2,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        obeliskGroup.add(base);

        // Shaft
        const shaftGeometry = new THREE.BoxGeometry(6, 50, 6);
        const shaft = new THREE.Mesh(shaftGeometry, baseMaterial);
        shaft.position.y = 27.5;
        obeliskGroup.add(shaft);

        // Pyramidion (top)
        const pyramidionGeometry = new THREE.ConeGeometry(4, 8, 4);
        const pyramidion = new THREE.Mesh(pyramidionGeometry, baseMaterial);
        pyramidion.position.y = 56;
        obeliskGroup.add(pyramidion);

        obeliskGroup.position.set(x, 0, z);
        obeliskGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene.add(obeliskGroup);
    }

    private createAncientPillars() {
        const pillarPositions = [
            new THREE.Vector3(50, 0, 100),
            new THREE.Vector3(-50, 0, 100),
            new THREE.Vector3(50, 0, -100),
            new THREE.Vector3(-50, 0, -100),
        ];

        pillarPositions.forEach(position => {
            const pillar = this.createSinglePillar();
            pillar.position.copy(position);
            this.scene.add(pillar);
        });
    }

    private createSinglePillar() {
        const pillarGroup = new THREE.Group();

        // Base
        const baseGeometry = new THREE.BoxGeometry(12, 4, 12);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xDCDCDC,
            roughness: 0.7,
            metalness: 0.1,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        pillarGroup.add(base);

        // Column
        const columnGeometry = new THREE.CylinderGeometry(4, 4, 40, 16);
        const column = new THREE.Mesh(columnGeometry, baseMaterial);
        column.position.y = 22;
        pillarGroup.add(column);

        // Capital (top)
        const capitalGeometry = new THREE.BoxGeometry(10, 6, 10);
        const capital = new THREE.Mesh(capitalGeometry, baseMaterial);
        capital.position.y = 45;
        pillarGroup.add(capital);

        pillarGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return pillarGroup;
    }
} 