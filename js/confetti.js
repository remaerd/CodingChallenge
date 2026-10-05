/**
 * Confetti - Lightweight, zero-dependency celebratory particle system
 */

const Confetti = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animationFrameId = null;

    // Palette of vibrant celebratory colors matching the solarized dark theme
    const colors = [
        '#268bd2', // solarized blue
        '#2aa198', // solarized cyan
        '#859900', // solarized green
        '#b58900', // solarized yellow
        '#cb4b16', // solarized orange
        '#dc322f', // solarized red
        '#d33682', // solarized magenta
        '#6c71c4', // solarized violet
        '#ffd700', // gold
        '#ff3366', // vivid coral pink
        '#00e5ff'  // electric cyan
    ];

    const init = () => {
        if (!canvas && typeof document !== 'undefined') {
            canvas = document.createElement('canvas');
            canvas.id = 'confetti-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '99999';
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');
            resize();
            window.addEventListener('resize', resize);
        }
    };

    const resize = () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    };

    const createParticle = (originX, originY, angleSpread, speedBase) => {
        const angle = angleSpread.min + Math.random() * (angleSpread.max - angleSpread.min);
        const speed = speedBase.min + Math.random() * (speedBase.max - speedBase.min);
        const size = Math.random() * 8 + 6;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isCircle = Math.random() < 0.25;

        return {
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            width: size,
            height: isCircle ? size : size * (Math.random() * 0.8 + 0.6),
            color: color,
            isCircle: isCircle,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            tiltAngle: Math.random() * Math.PI * 2,
            tiltSpeed: Math.random() * 0.08 + 0.04,
            gravity: 0.38 + Math.random() * 0.1,
            drag: 0.982,
            opacity: 1,
            fadeRate: Math.random() * 0.008 + 0.004,
            age: 0
        };
    };

    const pop = () => {
        init();
        if (!canvas) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Stage 1: Central explosion popping upwards
        for (let i = 0; i < 90; i++) {
            particles.push(createParticle(
                w * 0.5 + (Math.random() - 0.5) * 100,
                h * 0.75,
                { min: -Math.PI * 0.85, max: -Math.PI * 0.15 },
                { min: 14, max: 26 }
            ));
        }

        // Stage 2: Left and right upward side fountains for rich screen coverage
        for (let i = 0; i < 40; i++) {
            particles.push(createParticle(
                w * 0.2,
                h * 0.8,
                { min: -Math.PI * 0.65, max: -Math.PI * 0.1 },
                { min: 13, max: 24 }
            ));
        }

        for (let i = 0; i < 40; i++) {
            particles.push(createParticle(
                w * 0.8,
                h * 0.8,
                { min: -Math.PI * 0.9, max: -Math.PI * 0.35 },
                { min: 13, max: 24 }
            ));
        }

        if (!animationFrameId) {
            animate();
        }
    };

    const animate = () => {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.age++;

            // Physics updates
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;

            // Rotation & 3D flutter tilt
            p.rotation += p.rotationSpeed;
            p.tiltAngle += p.tiltSpeed;

            // Fade out after ascending phase
            if (p.age > 45) {
                p.opacity -= p.fadeRate;
            }

            // Remove particle if off screen or fully faded
            if (p.opacity <= 0 || p.y > canvas.height + 50) {
                particles.splice(i, 1);
                continue;
            }

            // Render particle
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.scale(1, Math.cos(p.tiltAngle)); // Realistic 3D paper flipping

            ctx.fillStyle = p.color;
            if (p.isCircle) {
                ctx.beginPath();
                ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            }
            ctx.restore();
        }

        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            animationFrameId = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return {
        init,
        pop
    };
})();

if (typeof window !== 'undefined') {
    window.Confetti = Confetti;
}
