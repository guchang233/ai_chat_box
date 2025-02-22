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
    
    // 确保默认配置生效
    if (!window.sessionManager.getCurrentSession().config.apiDomain) {
        window.sessionManager.getCurrentSession().config = {
            apiKey: '',
            apiDomain: 'https://gemini.tech-zer.top/v1', // 带API版本路径
            modelName: 'gemini-2.0-flash-exp'
        };
    }

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

function visualizeReasoning(response) {
    // 解析模型的中间状态
    const reasoningSteps = response.metadata.thought_process;
    
    // 创建可视化元素
    const reasoningContainer = document.createElement('div');
    reasoningContainer.className = 'reasoning-visualization';
    
    // 添加推理步骤展示
    reasoningSteps.forEach(step => {
        const stepElement = document.createElement('div');
        stepElement.textContent = `🤔 [推理步骤] ${step}`;
        reasoningContainer.appendChild(stepElement);
    });
    
    // 插入到消息容器中
    document.getElementById('chat-messages').appendChild(reasoningContainer);
}
