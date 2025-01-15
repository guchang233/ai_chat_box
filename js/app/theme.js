// js/theme.js
function setupThemeToggle() {
    const themeSliders = document.querySelectorAll('input[name="theme"]');
    const body = document.body;
    const chatContainer = document.querySelector('.chat-container');
    const chatHeader = document.querySelector('.chat-header');

    themeSliders.forEach(slider => {
        slider.addEventListener('change', () => {
            const selectedTheme = slider.value;
            body.classList.remove('dark-mode');
            chatContainer.classList.remove('dark-mode');
            chatHeader.classList.remove('dark-mode');
            const userMessages = document.querySelectorAll('.user-message');
            userMessages.forEach(message => message.classList.remove('dark-mode'));
            const aiMessages = document.querySelectorAll('.ai-message');
            aiMessages.forEach(message => message.classList.remove('dark-mode'));
            const loadingMessages = document.querySelectorAll('.loading-message');
            loadingMessages.forEach(message => message.classList.remove('dark-mode'));
            const chatInputArea = document.querySelector('.chat-input-area');
            chatInputArea.classList.remove('dark-mode');

            if (selectedTheme === 'dark') {
                body.classList.add('dark-mode');
                chatContainer.classList.add('dark-mode');
                chatHeader.classList.add('dark-mode');
                userMessages.forEach(message => message.classList.add('dark-mode'));
                aiMessages.forEach(message => message.classList.add('dark-mode'));
                loadingMessages.forEach(message => message.classList.add('dark-mode'));
                chatInputArea.classList.add('dark-mode');
            }
        });
    });
}
