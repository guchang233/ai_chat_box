// 聊天管理模块
class ChatManager {
    constructor(uiHandler) {
        this.uiHandler = uiHandler;
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        
        this.chatHistory = [];
        this.isProcessing = false;
        this.shouldStopGeneration = false;
        this.currentController = null;
        
        // 初始化系统提示词
        this.initSystemPrompt();
        
        // 加载聊天历史
        this.loadChatHistory();
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    initEventListeners() {
        // 发送按钮点击事件
        this.sendButton.addEventListener('click', this.sendMessage.bind(this));
        
        // 按下Enter键发送消息
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    initSystemPrompt() {
        // 检查聊天历史是否为空或第一条不是系统提示
        if (this.chatHistory.length === 0 || (this.chatHistory.length > 0 && this.chatHistory[0].role !== "system")) {
            // 添加系统提示词到聊天历史的开头
            this.chatHistory.unshift({
                role: "system",
                content: [{
                    type: "text",
                    text: CONFIG.SYSTEM_PROMPT
                }]
            });
            console.log("系统提示词已添加到聊天历史");
        }
    }
    
    loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        const savedMessages = localStorage.getItem('chatMessages');
        
        if (savedHistory) {
            try {
                this.chatHistory = JSON.parse(savedHistory);
                
                // 确保系统提示词存在
                this.initSystemPrompt();
                
                // 如果有保存的消息HTML，则恢复聊天界面
                if (savedMessages) {
                    this.chatMessages.innerHTML = savedMessages;
                    
                    // 为恢复的图片添加点击事件
                    this.chatMessages.querySelectorAll('.message-images img').forEach(img => {
                        img.addEventListener('click', function() {
                            const fullImg = document.createElement('div');
                            fullImg.className = 'fullscreen-image';
                            fullImg.innerHTML = `<img src="${this.src}" alt="${this.alt}">`;
                            fullImg.addEventListener('click', function() {
                                this.remove();
                            });
                            document.body.appendChild(fullImg);
                        });
                    });
                    
                    // 为恢复的复制按钮添加事件
                    this.chatMessages.querySelectorAll('.copy-button').forEach((button, index) => {
                        const messageContent = this.chatHistory.find(msg => msg.role === (index % 2 === 0 ? 'user' : 'assistant'));
                        if (messageContent && messageContent.content && messageContent.content[0] && messageContent.content[0].text) {
                            const text = messageContent.content[0].text;
                            button.addEventListener('click', function() {
                                navigator.clipboard.writeText(text).then(() => {
                                    button.innerHTML = '<i class="fas fa-check"></i>';
                                    setTimeout(() => {
                                        button.innerHTML = '<i class="fas fa-copy"></i>';
                                    }, 2000);
                                });
                            });
                        }
                    });
                } else {
                    // 如果只有历史数据但没有HTML，则重新生成聊天界面
                    this.regenerateChatInterface();
                }
                
                console.log('已从本地存储加载聊天历史');
            } catch (e) {
                console.error('加载聊天历史时出错:', e);
                this.chatHistory = [];
                this.initSystemPrompt();
            }
        } else {
            // 如果没有历史记录，初始化系统提示
            this.initSystemPrompt();
        }
    }
    
    saveChatHistory() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
            localStorage.setItem('chatMessages', this.chatMessages.innerHTML);
            console.log('聊天历史已保存到本地存储');
        } catch (e) {
            console.error('保存聊天历史时出错:', e);
            // 如果存储空间不足，清除旧数据
            if (e.name === 'QuotaExceededError') {
                alert('本地存储空间不足，将清除部分历史记录');
                // 保留最近的10条消息
                if (this.chatHistory.length > 10) {
                    this.chatHistory = this.chatHistory.slice(-10);
                    this.saveChatHistory();
                }
            }
        }
    }
    
    regenerateChatInterface() {
        this.chatMessages.innerHTML = '';
        
        // 添加欢迎消息
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message ai-message';
        welcomeMessage.innerHTML = `
            <div class="avatar">AI</div>
            <div class="message-content">
                <p>你好！我是谷歌Gemini，可以回答问题或分析图片。欢迎与我交流。😄</p>
            </div>
        `;
        this.chatMessages.appendChild(welcomeMessage);
        
        // 重新生成历史消息
        for (let i = 0; i < this.chatHistory.length; i++) {
            const msg = this.chatHistory[i];
            if (msg.role === 'user' || msg.role === 'assistant') {
                let text = '';
                let images = [];
                
                // 提取文本和图片
                if (msg.content && Array.isArray(msg.content)) {
                    for (const item of msg.content) {
                        if (item.type === 'text') {
                            text = item.text;
                        } else if (item.type === 'image_url' && item.image_url) {
                            images.push({
                                dataUrl: item.image_url.url,
                                name: 'Uploaded Image'
                            });
                        }
                    }
                }
                
                // 创建时间戳
                const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // 添加消息到界面
                this.addMessage(msg.role, text, images, timeString);
            }
        }
    }
    
    clearHistory() {
        if (confirm('确定要清除所有聊天历史吗？此操作不可恢复。')) {
            // 保留系统提示词
            const systemPrompt = this.chatHistory.find(msg => msg.role === 'system');
            
            // 清空聊天历史
            this.chatHistory = [];
            
            // 重新添加系统提示词
            if (systemPrompt) {
                this.chatHistory.push(systemPrompt);
            } else {
                this.initSystemPrompt();
            }
            
            // 清空聊天界面
            this.chatMessages.innerHTML = '';
            
            // 添加欢迎消息
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'message ai-message';
            welcomeMessage.innerHTML = `
                <div class="avatar">AI</div>
                <div class="message-content">
                    <p>你好！我是谷歌Gemini，可以回答问题或分析图片。欢迎与我交流。😄</p>
                </div>
            `;
            this.chatMessages.appendChild(welcomeMessage);
            
            // 保存清空后的状态
            this.saveChatHistory();
            
            console.log('聊天历史已清除');
        }
    }
    
    stopGeneration() {
        if (this.currentController) {
            this.shouldStopGeneration = true;
            this.currentController.abort();
            this.currentController = null;
            
            // 添加停止生成的提示
            const aiMessageElement = document.querySelector('.message.ai-message:last-child');
            if (aiMessageElement) {
                const stoppedIndicator = document.createElement('div');
                stoppedIndicator.className = 'generation-stopped';
                stoppedIndicator.textContent = '✓ 已停止生成';
                aiMessageElement.querySelector('.message-content').appendChild(stoppedIndicator);
            }
            
            // 更新UI状态
            this.isProcessing = false;
            this.uiHandler.showStopButton(false);
            this.uiHandler.disableSendButton(false);
            
            console.log('已停止生成');
        }
    }
    
    async sendMessage() {
        if (this.isProcessing) return;
        
        const userText = this.userInput.value.trim();
        const images = this.uiHandler.selectedImages;
        
        // 检查是否有输入内容或图片
        if (userText === '' && images.length === 0) return;
        
        // 创建时间戳
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // 添加用户消息到界面
        this.addMessage('user', userText, images, timeString);
        
        // 清空输入框和图片预览
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.uiHandler.clearImagePreviews();
        
        // 准备请求数据
        const userContent = [];
        
        // 添加文本内容
        if (userText) {
            userContent.push({
                type: 'text',
                text: userText
            });
        }
        
        // 添加图片内容
        for (const image of images) {
            userContent.push({
                type: 'image_url',
                image_url: {
                    url: image.dataUrl
                }
            });
        }
        
        // 添加用户消息到聊天历史
        this.chatHistory.push({
            role: 'user',
            content: userContent
        });
        
        // 保存聊天历史
        this.saveChatHistory();
        
        // 添加AI正在输入的提示
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai-message typing-message';
        typingIndicator.innerHTML = `
            <div class="avatar">AI</div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.chatMessages.appendChild(typingIndicator);
        this.uiHandler.scrollToBottom();
        
        // 更新UI状态
        this.isProcessing = true;
        this.uiHandler.showStopButton(true);
        this.uiHandler.disableSendButton(true);
        
        try {
            // 创建AbortController用于取消请求
            this.currentController = new AbortController();
            this.shouldStopGeneration = false;
            
            // 准备API请求数据
            const requestData = {
                model: CONFIG.MODEL,
                messages: this.chatHistory.map(msg => {
                    // 系统消息特殊处理
                    if (msg.role === 'system') {
                        return {
                            role: 'system',
                            content: msg.content[0].text
                        };
                    }
                    return msg;
                }),
                stream: true
            };
            
            console.log('发送请求到:', CONFIG.API_ENDPOINT);
            
            // 发送API请求，添加错误处理和超时
            // 修改请求头配置
            const headers = new Headers({
                'Content-Type': 'application/json',
                // 修正为Google API要求的认证头格式
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            });
            
            // 添加调试日志
            console.log('API Key:', CONFIG.API_KEY.substring(0, 6) + '****');
            console.log('完整请求头:', headers);
            
            const fetchPromise = fetch(CONFIG.API_ENDPOINT || `${CONFIG.API_URL}/v1/chat/completions`, {
                method: 'POST',
                headers: headers,  // 使用新的headers对象
                body: JSON.stringify(requestData),
                signal: this.currentController.signal,
                mode: 'cors'
            });
            
            // 添加超时处理
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('请求超时，请稍后再试')), 30000);
            });
            
            // 使用 Promise.race 实现超时控制
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => '无法获取错误详情');
                throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            // 移除正在输入的提示
            typingIndicator.remove();
            
            // 创建AI回复消息元素
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.innerHTML = `
                <div class="avatar">AI</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-time">${timeString}</span>
                        <button class="copy-button" title="复制回复"><i class="fas fa-copy"></i></button>
                    </div>
                    <div class="ai-response"></div>
                </div>
            `;
            this.chatMessages.appendChild(aiMessage);
            
            const aiResponseElement = aiMessage.querySelector('.ai-response');
            
            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let responseText = '';
            
            // 添加复制按钮事件
            const copyButton = aiMessage.querySelector('.copy-button');
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(responseText).then(() => {
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
            });
            
            // 读取流式响应
            while (true) {
                const { done, value } = await reader.read();
                if (done || this.shouldStopGeneration) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                                const content = data.choices[0].delta.content;
                                
                                // 累加响应文本
                                responseText += content;
                                
                                // 格式化并显示响应
                                aiResponseElement.innerHTML = MessageFormatter.formatMessage(responseText);
                                
                                // 渲染LaTeX公式
                                MessageFormatter.renderLaTeX(aiResponseElement);
                                
                                // 应用代码高亮
                                if (window.hljs) {
                                    aiResponseElement.querySelectorAll('pre.code-block').forEach(block => {
                                        window.hljs.highlightElement(block);
                                    });
                                }
                                
                                // 滚动到底部
                                this.uiHandler.scrollToBottom();
                            }
                        } catch (e) {
                            console.error('解析流式响应时出错:', e);
                        }
                    }
                }
            }
            
            // 添加AI回复到聊天历史
            this.chatHistory.push({
                role: 'assistant',
                content: [{
                    type: 'text',
                    text: responseText
                }]
            });
            
            // 保存聊天历史
            this.saveChatHistory();
            
        } catch (e) {
            console.error('发送消息时出错:', e);
            
            // 移除正在输入的提示
            document.querySelector('.typing-message')?.remove();
            
            // 区分用户主动停止和实际错误
            if (e.name === 'AbortError' || this.shouldStopGeneration) {
                console.log('生成已被用户停止');
                // 不添加错误消息，使用上面的停止提示
            } else {
                // 添加错误消息
                const errorMessage = document.createElement('div');
                errorMessage.className = 'message ai-message error-message';
                errorMessage.innerHTML = `
                    <div class="avatar">AI</div>
                    <div class="message-content">
                        <p>抱歉，发生了错误：${e.message}</p>
                        <p>请检查网络连接或稍后再试。如果问题持续存在，可能需要检查API配置。</p>
                    </div>
                `;
                this.chatMessages.appendChild(errorMessage);
            }
        } finally {
            // 恢复UI状态
            this.isProcessing = false;
            this.uiHandler.showStopButton(false);
            this.uiHandler.disableSendButton(false);
            this.currentController = null;
        }
    }
    
    addMessage(role, text, images = [], timeString) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        let messageContent = '';
        
        if (role === 'user') {
            // 用户消息
            messageContent = `
                <div class="avatar">You</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-time">${timeString}</span>
                        <button class="copy-button" title="复制消息"><i class="fas fa-copy"></i></button>
                    </div>
            `;
            
            // 添加图片预览
            if (images && images.length > 0) {
                messageContent += '<div class="message-images">';
                for (const image of images) {
                    messageContent += `<img src="${image.dataUrl}" alt="${image.name}" loading="lazy">`;
                }
                messageContent += '</div>';
            }
            
            // 添加文本内容
            if (text) {
                messageContent += `<p>${text}</p>`;
            }
            
            messageContent += '</div>';
        } else {
            // AI消息
            messageContent = `
                <div class="avatar">AI</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-time">${timeString}</span>
                        <button class="copy-button" title="复制回复"><i class="fas fa-copy"></i></button>
                    </div>
            `;
            
            // 添加文本内容
            if (text) {
                messageContent += MessageFormatter.formatMessage(text);
            } else {
                messageContent += '<p>...</p>';
            }
            
            messageContent += '</div>';
        }
        
        messageDiv.innerHTML = messageContent;
        
        // 添加复制按钮事件
        const copyButton = messageDiv.querySelector('.copy-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(text).then(() => {
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
            });
        }
        
        // 添加图片点击放大事件
        const imgElements = messageDiv.querySelectorAll('.message-images img');
        imgElements.forEach(img => {
            img.addEventListener('click', function() {
                const fullImg = document.createElement('div');
                fullImg.className = 'fullscreen-image';
                fullImg.innerHTML = `<img src="${this.src}" alt="${this.alt}">`;
                fullImg.addEventListener('click', function() {
                    this.remove();
                });
                document.body.appendChild(fullImg);
            });
            
            // 添加图片加载完成的类
            img.onload = function() {
                this.classList.add('loaded');
                // 强制重排触发动画
                this.style.opacity = 0;
                requestAnimationFrame(() => {
                    this.style.opacity = 1;
                });
            };
        });
        
        // 添加消息到聊天界面
        this.chatMessages.appendChild(messageDiv);
        
        // 渲染LaTeX公式
        if (role === 'assistant' && text) {
            MessageFormatter.renderLaTeX(messageDiv.querySelector('.markdown-content'));
            
            // 应用代码高亮
            if (window.hljs) {
                messageDiv.querySelectorAll('pre.code-block').forEach(block => {
                    window.hljs.highlightElement(block);
                });
            }
        }
        
        // 滚动到底部
        this.uiHandler.scrollToBottom();
        
        return messageDiv;
    }
}