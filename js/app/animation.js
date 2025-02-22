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