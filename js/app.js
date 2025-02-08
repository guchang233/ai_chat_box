// js/app.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Before setupFileUpload');
    setupFileUpload();
    console.log('Before setupMessageSending');
    setupMessageSending();
    console.log('Before setupThemeToggle');
    setupThemeToggle();
    console.log('Before setupScrollButton');
    setupScrollButton();
    console.log('Before setupSettingsModal');
    setupSettingsModal();
    console.log('Before setupResponsiveDesign');
    setupResponsiveDesign();
    window.sessionManager = new SessionManager();
    
    // 初始化输入框值
    const session = window.sessionManager.getCurrentSession();
    document.getElementById('api-key-input').value = session.config.apiKey;
    document.getElementById('api-url-input').value = session.config.apiDomain;
    document.getElementById('model-name-input').value = session.config.modelName;
    document.getElementById('preset-select').value = session.config.preset || 'default';

    // 添加清除功能
    const clearButton = document.getElementById('clear-chat-button');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('确定清除当前会话聊天记录？此操作不可撤销！')) {
                window.sessionManager.clearCurrentSessionMessages();
                const chatMessages = document.getElementById('chat-messages');
                chatMessages.innerHTML = '';
                document.getElementById('scroll-to-bottom-button').style.display = 'none';
            }
        });
    }

    // 初始化按钮状态
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('send-button').disabled = false;
});
