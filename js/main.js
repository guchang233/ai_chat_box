document.addEventListener('DOMContentLoaded', function() {
    // 初始化MathJax配置
    if (window.MathJax) {
        window.MathJax.startup.document.state(0);
        window.MathJax.startup.document.clear();
        window.MathJax.startup.document.updateDocument();
    }
    
    // 检查API配置
    if (!CONFIG.API_ENDPOINT) {
        CONFIG.API_ENDPOINT = `${CONFIG.API_URL}/v1/chat/completions`;
        console.log('已自动设置API端点:', CONFIG.API_ENDPOINT);
    }
    
    // 检查网络连接
    function checkNetworkConnection() {
        if (!navigator.onLine) {
            alert('您似乎处于离线状态。请检查网络连接后再使用聊天功能。');
            return false;
        }
        return true;
    }
    
    // 添加网络状态监听
    window.addEventListener('online', () => {
        console.log('网络已连接');
        document.querySelector('.chat-input-container').classList.remove('offline');
    });
    
    window.addEventListener('offline', () => {
        console.log('网络已断开');
        document.querySelector('.chat-input-container').classList.add('offline');
        alert('网络连接已断开，聊天功能可能无法正常使用。');
    });
    
    // 初始检查网络
    checkNetworkConnection();
    
    // 初始化UI处理器
    const uiHandler = new UIHandler();
    
    // 初始化聊天管理器
    const chatManager = new ChatManager(uiHandler);
    
    // 将聊天管理器暴露给全局，以便其他模块可以访问
    window.chatManager = chatManager;
    
    // 初始化代码高亮
    if (window.hljs) {
        window.hljs.configure({
            ignoreUnescapedHTML: true
        });
        window.hljs.highlightAll();
    }
    
    console.log('Gemini Chat Platform 初始化完成');
    
    console.log('当前系统时间:', currentDate);
});