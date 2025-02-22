document.addEventListener('DOMContentLoaded', function() {
    const moveButton = document.getElementById('move-button');
    const chatContainer = document.querySelector('.chat-container');
    let isMoved = false;
    let animationId = null;

    moveButton.addEventListener('click', () => {
        const containerWidth = chatContainer.offsetWidth;
        const targetTranslateX = isMoved ? 0 : containerWidth / 2;
        const startTranslateX = parseFloat(chatContainer.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
        const duration = 300; // 动画持续时间，单位毫秒
        let startTime = null;

        function animate(currentTime) {
            if (!startTime) {
                startTime = currentTime;
            }
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easing = progress => progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            const currentTranslateX = startTranslateX + (targetTranslateX - startTranslateX) * easing(progress);
            chatContainer.style.transform = `translateX(${currentTranslateX}px)`;

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                animationId = null;
            }
        }

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        animationId = requestAnimationFrame(animate);
        isMoved = !isMoved;
    });
});

const canvas = document.getElementById('dynamic-bg');
const ctx = canvas.getContext('2d');
let particles = [];

class Particle {
    constructor() {
        this.reset();
        this.hue = Math.random() * 360;
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.radius = Math.random() * 3;
        this.alpha = Math.random() * 0.5 + 0.3;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0, 
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 50%, ${this.alpha})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
}

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = Array(100).fill().map(() => new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

initCanvas();
window.addEventListener('resize', initCanvas);
animate(); 