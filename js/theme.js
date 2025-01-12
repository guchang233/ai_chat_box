// js/theme.js
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const chatContainer = document.querySelector('.chat-container');
    const chatHeader = document.querySelector('.chat-header');
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        chatContainer.classList.toggle('dark-mode');
        chatHeader.classList.toggle('dark-mode');
        const userMessages = document.querySelectorAll('.user-message');
        userMessages.forEach(message => message.classList.toggle('dark-mode'));
        const aiMessages = document.querySelectorAll('.ai-message');
        aiMessages.forEach(message => message.classList.toggle('dark-mode'));
        const loadingMessages = document.querySelectorAll('.loading-message');
        loadingMessages.forEach(message => message.classList.toggle('dark-mode'));
        themeToggle.classList.toggle('dark-mode');
        const chatInputArea = document.querySelector('.chat-input-area');
        chatInputArea.classList.toggle('dark-mode');
    });
}
