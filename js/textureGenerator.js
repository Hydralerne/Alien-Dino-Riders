class TextureGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 512;
        this.canvas.height = 512;
    }

    createSandTexture() {
        const ctx = this.ctx;
        ctx.fillStyle = '#D2B48C'; // Base sand color
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some noise/grain
        for (let i = 0; i < 15000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2 + 1;
            const color = Math.random() > 0.5 ? '#C2A478' : '#E5C9A1';
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, size, size);
        }
        
        return new THREE.CanvasTexture(this.canvas);
    }

    createStoneTexture() {
        const ctx = this.ctx;
        ctx.fillStyle = '#A9A9A9'; // Base stone color
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some noise/grain
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3 + 1;
            const color = Math.random() > 0.5 ? '#8A8A8A' : '#C0C0C0';
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add some cracks
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const length = Math.random() * 100 + 50;
            const angle = Math.random() * Math.PI * 2;
            
            ctx.strokeStyle = '#696969';
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.stroke();
        }
        
        return new THREE.CanvasTexture(this.canvas);
    }

    createDinosaurTexture(baseColor) {
        const ctx = this.ctx;
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some scales pattern
        for (let y = 0; y < 512; y += 20) {
            for (let x = 0; x < 512; x += 20) {
                const offsetX = (y % 40 === 0) ? 10 : 0;
                
                ctx.fillStyle = this.darkenColor(baseColor, 0.2);
                ctx.beginPath();
                ctx.arc(x + offsetX, y, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        return new THREE.CanvasTexture(this.canvas);
    }

    createSpaceshipTexture(baseColor) {
        const ctx = this.ctx;
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some panel lines
        ctx.strokeStyle = this.darkenColor(baseColor, 0.3);
        ctx.lineWidth = 2;
        
        // Horizontal lines
        for (let y = 64; y < 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let x = 64; x < 512; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }
        
        // Add some details
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 20 + 10;
            
            ctx.fillStyle = this.lightenColor(baseColor, 0.2);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = this.darkenColor(baseColor, 0.4);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        return new THREE.CanvasTexture(this.canvas);
    }

    darkenColor(hex, amount) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        r = Math.max(0, Math.floor(r * (1 - amount)));
        g = Math.max(0, Math.floor(g * (1 - amount)));
        b = Math.max(0, Math.floor(b * (1 - amount)));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    lightenColor(hex, amount) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        r = Math.min(255, Math.floor(r + (255 - r) * amount));
        g = Math.min(255, Math.floor(g + (255 - g) * amount));
        b = Math.min(255, Math.floor(b + (255 - b) * amount));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}