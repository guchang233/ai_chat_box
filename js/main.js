// 修复 MathJax 初始化错误
// 在文档加载完成后的事件处理中添加 MathJax 重新渲染
document.addEventListener('DOMContentLoaded', function() {
    // 安全地初始化 MathJax
    if (window.MathJax) {
        try {
            // 等待 MathJax 完全加载
            function initMathJax() {
                if (window.MathJax.startup && window.MathJax.startup.document) {
                    window.MathJax.startup.document.clear();
                    window.MathJax.startup.document.updateDocument();
                } else {
                    setTimeout(initMathJax, 100);
                }
            }
            
            // 延迟初始化
            setTimeout(initMathJax, 500);
        } catch (error) {
            console.warn('MathJax 初始化时出错:', error);
        }
    }
    
    // 检查API配置
    if (!CONFIG.API_ENDPOINT) {
        CONFIG.API_ENDPOINT = `${CONFIG.API_URL}/v1/chat/completions`;
        console.log('已自动设置API端点:', CONFIG.API_ENDPOINT);
    }
    
    // 初始化模型选择器
    initModelSelector();
    
    // 添加重连按钮的事件监听器
    const refreshButton = document.getElementById('refresh-page');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // 显示确认对话框
            if (confirm('确定要重新连接吗？这将刷新页面并重新建立连接。')) {
                // 刷新页面
                window.location.reload();
            }
        });
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
        // 添加重连按钮的事件监听器
        document.getElementById('refresh-page').addEventListener('click', function() {
            // 显示确认对话框
            if (confirm('确定要重新连接吗？这将刷新页面并重新建立连接。')) {
                // 刷新页面
                window.location.reload();
            }
        });
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
    
    // 模型选择器初始化函数
    function initModelSelector() {
        const modelSelect = document.getElementById('model-select');
        if (!modelSelect) return;
        
        // 清空现有选项
        modelSelect.innerHTML = '';
        
        // 添加模型选项
        CONFIG.AVAILABLE_MODELS.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.text = model.name;
            option.title = model.description;
            if (model.id === CONFIG.MODEL) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
        
        // 添加模型切换事件
        // 在模型选择器的change事件中
        modelSelect.addEventListener('change', function() {
            const selectedModel = this.value;
            const selectedModelName = this.options[this.selectedIndex].text;
            
            // 使用CONFIG的switchModel方法切换模型
            if (CONFIG.switchModel(selectedModel)) {
                // 如果聊天管理器已初始化，更新系统提示
                if (window.chatManager) {
                    window.chatManager.updateModelInSystemPrompt(selectedModelName);
                }
                
                // 显示通知
                showModelChangeNotification(selectedModelName);
            }
        });
    }
    
    // 显示模型切换通知
    function showModelChangeNotification(modelName) {
        // 移除现有通知
        const existingNotification = document.querySelector('.model-change-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建新通知
        const notification = document.createElement('div');
        notification.className = 'model-change-notification';
        notification.textContent = `已切换到 ${modelName}`;
        document.body.appendChild(notification);
        
        // 2秒后移除通知
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
    
    // 确保 MathJax 在页面加载完成后重新渲染
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.startup.promise.then(() => {
            setTimeout(() => {
                window.MathJax.typesetPromise()
                    .then(() => console.log('初始 MathJax 渲染完成'))
                    .catch(err => console.warn('MathJax 渲染错误:', err));
            }, 500);
        });
    }
});