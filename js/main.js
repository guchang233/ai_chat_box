document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const imageUpload = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const clearHistoryButton = document.getElementById('clear-history');
    const stopGenerateButton = document.getElementById('stop-generate');
    
    const API_URL = 'https://gemini.tech-zer.top';
    const API_KEY = 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U';
    const MODEL = 'gemini-2.0-flash-exp';
    
    // 修改为正确的API端点
    const API_ENDPOINT = `${API_URL}/v1/chat/completions`;
    
    // 添加系统提示词
    const SYSTEM_PROMPT = "你是一个由谷歌开发的AI助手Gemini，基于Gemini 2.0模型。你应该以友好、专业的方式回答用户的问题。如果用户上传了图片，请详细描述你看到的内容并回答相关问题。请用简洁、准确的语言回答，避免冗长的回复。当用户使用中文时，请用中文回答；当用户使用英文时，请用英文回答。如果你不确定答案，请诚实地表明你不知道，而不是提供可能不准确的信息。";
    
    let selectedImages = [];
    let isProcessing = false;
    let shouldStopGeneration = false;
    let currentController = null;
    // 添加聊天历史记录数组，用于连续对话
    let chatHistory = [];
    
    // 初始化系统提示词
    function initSystemPrompt() {
        // 检查聊天历史是否为空或第一条不是系统提示
        if (chatHistory.length === 0 || (chatHistory.length > 0 && chatHistory[0].role !== "system")) {
            // 添加系统提示词到聊天历史的开头
            chatHistory.unshift({
                role: "system",
                content: [{
                    type: "text",
                    text: SYSTEM_PROMPT
                }]
            });
            console.log("系统提示词已添加到聊天历史");
        }
    }
    
    // 从本地存储加载聊天历史
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        const savedMessages = localStorage.getItem('chatMessages');
        
        if (savedHistory) {
            try {
                chatHistory = JSON.parse(savedHistory);
                
                // 确保系统提示词存在
                initSystemPrompt();
                
                // 如果有保存的消息HTML，则恢复聊天界面
                if (savedMessages) {
                    chatMessages.innerHTML = savedMessages;
                    
                    // 为恢复的图片添加点击事件
                    chatMessages.querySelectorAll('.message-images img').forEach(img => {
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
                    chatMessages.querySelectorAll('.copy-button').forEach((button, index) => {
                        const messageContent = chatHistory.find(msg => msg.role === (index % 2 === 0 ? 'user' : 'assistant'));
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
                    regenerateChatInterface();
                }
                
                console.log('已从本地存储加载聊天历史');
            } catch (e) {
                console.error('加载聊天历史时出错:', e);
                chatHistory = [];
                initSystemPrompt();
            }
        } else {
            // 如果没有历史记录，初始化系统提示
            initSystemPrompt();
        }
    }
    
    // 保存聊天历史到本地存储
    function saveChatHistory() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            localStorage.setItem('chatMessages', chatMessages.innerHTML);
            console.log('聊天历史已保存到本地存储');
        } catch (e) {
            console.error('保存聊天历史时出错:', e);
            // 如果存储空间不足，清除旧数据
            if (e.name === 'QuotaExceededError') {
                alert('本地存储空间不足，将清除部分历史记录');
                // 保留最近的10条消息
                if (chatHistory.length > 10) {
                    chatHistory = chatHistory.slice(-10);
                    saveChatHistory();
                }
            }
        }
    }
    
    // 根据chatHistory重新生成聊天界面
    function regenerateChatInterface() {
        chatMessages.innerHTML = '';
        
        // 添加欢迎消息
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message ai-message';
        welcomeMessage.innerHTML = `
            <div class="avatar">AI</div>
            <div class="message-content">
                <p>你好！我是AI助手，可以回答问题或分析上传的图片。请输入文字或上传图片与我交流。</p>
            </div>
        `;
        chatMessages.appendChild(welcomeMessage);
        
        // 重新生成历史消息
        for (let i = 0; i < chatHistory.length; i++) {
            const msg = chatHistory[i];
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
                addMessage(msg.role, text, images, timeString);
            }
        }
    }
    
    // 自动调整文本框高度
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // 限制最大高度
        if (this.scrollHeight > 120) {
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
        }
    });
    
    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);
    
    // 按下Enter键发送消息
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 图片上传处理
    imageUpload.addEventListener('change', handleImageUpload);
    
    // 处理图片上传
    function handleImageUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const dataUrl = event.target.result;
                
                // 创建图片预览
                const previewContainer = document.createElement('div');
                previewContainer.className = 'image-preview';
                
                const img = document.createElement('img');
                img.src = dataUrl;
                img.alt = file.name;
                
                // 添加图片加载完成的类
                img.onload = function() {
                    this.classList.add('loaded');
                };
                
                const removeButton = document.createElement('button');
                removeButton.className = 'remove-image';
                removeButton.innerHTML = '<i class="fas fa-times"></i>';
                removeButton.addEventListener('click', function() {
                    // 移除图片预览
                    previewContainer.remove();
                    // 从选中的图片数组中移除
                    selectedImages = selectedImages.filter(image => image.dataUrl !== dataUrl);
                });
                
                previewContainer.appendChild(img);
                previewContainer.appendChild(removeButton);
                imagePreviewContainer.appendChild(previewContainer);
                
                // 添加到选中的图片数组
                selectedImages.push({
                    dataUrl,
                    name: file.name
                });
                
                // 上传图片后自动在输入框填入提示文本
                if (userInput.value.trim() === '') {
                    userInput.value = "说说你看到了什么";
                    // 触发input事件以调整文本框高度
                    const event = new Event('input', { bubbles: true });
                    userInput.dispatchEvent(event);
                }
            };
            
            reader.readAsDataURL(file);
        }
        
        // 清空文件输入，以便可以再次选择相同的文件
        e.target.value = '';
    }
    
    // 发送消息
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '' && selectedImages.length === 0) return;
        if (isProcessing) return;
        
        // 重置停止生成状态
        shouldStopGeneration = false;
        
        // 获取当前时间
        const currentTime = new Date();
        const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // 添加用户消息到聊天界面
        addMessage('user', message, selectedImages, timeString);
        
        // 添加用户消息到聊天历史
        const userMessage = {
            role: "user",
            content: []
        };
        
        if (message) {
            userMessage.content.push({
                type: "text",
                text: message
            });
        }
        
        // 保存当前图片以便发送
        const imagesToSend = [...selectedImages];
        
        // 添加图片到用户消息
        for (const image of imagesToSend) {
            userMessage.content.push({
                type: "image_url",
                image_url: {
                    url: image.dataUrl,
                    detail: "high"
                }
            });
        }
        
        // 将用户消息添加到历史
        chatHistory.push(userMessage);
        
        // 清空输入框和图片预览
        userInput.value = '';
        userInput.style.height = 'auto';
        imagePreviewContainer.innerHTML = '';
        selectedImages = [];
        
        isProcessing = true;
        sendButton.disabled = true;
        
        // 创建当前时间用于AI回复
        const aiResponseTime = new Date();
        const aiTimeString = aiResponseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // 创建AI消息容器，用于流式输出
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 添加消息头部（时间和复制按钮）
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // 添加时间
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = aiTimeString;
        messageHeader.appendChild(timeSpan);
        
        // 创建复制按钮（稍后会更新其功能）
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = '复制内容';
        messageHeader.appendChild(copyButton);
        
        messageContent.appendChild(messageHeader);
        
        // 添加文本容器
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        const markdownContent = document.createElement('div');
        markdownContent.className = 'markdown-content';
        textDiv.appendChild(markdownContent);
        messageContent.appendChild(textDiv);
        
        aiMessageDiv.appendChild(avatar);
        aiMessageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(aiMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // 准备请求数据 - 修改为OpenAI格式
            const requestData = {
                model: MODEL,
                messages: [],
                temperature: 0.7,
                max_tokens: 8192,
                stream: true, // 启用流式输出
            };
            
            // 添加历史消息（最多保留20条）
            requestData.messages = chatHistory.slice(-20);
            
            console.log("发送的请求数据:", JSON.stringify(requestData));
            
            let fullResponse = '';
            
            // 发送请求到API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            
            while (true) {
                // 检查是否应该停止生成
                if (shouldStopGeneration) {
                    break;
                }
                
                const { done, value } = await reader.read();
                if (done) break;
                
                // 解码响应数据
                const chunk = decoder.decode(value, { stream: true });
                
                // 处理数据块
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.choices && data.choices.length > 0) {
                                const delta = data.choices[0].delta;
                                if (delta && delta.content) {
                                    fullResponse += delta.content;
                                    // 更新显示的内容
                                    markdownContent.innerHTML = formatMessage(fullResponse);
                                    // 滚动到底部
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }
                            }
                        } catch (e) {
                            console.error('解析流式数据出错:', e);
                        }
                    }
                }
            }
            
            // 更新复制按钮功能
            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(fullResponse).then(() => {
                    // 显示复制成功提示
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
            });
            // 在sendMessage函数中，修改流式输出完成后的渲染部分
            // 完成后应用代码高亮和LaTeX渲染
            setTimeout(() => {
            // 应用LaTeX渲染
            renderLaTeX(textDiv);
            
            // 应用代码高亮
            if (typeof hljs !== 'undefined') {
            textDiv.querySelectorAll('pre.code-block').forEach((block) => {
            hljs.highlightElement(block);
            });
            }
            }, 300);
            
            // 添加AI回复到聊天历史
            chatHistory.push({
                role: "assistant",
                content: [{type: "text", text: fullResponse}]
            });
            
            // 保存聊天历史到本地存储
            saveChatHistory();
            
            } catch (error) {
                console.error('发送消息时出错:', error);
                
                // 显示错误消息
                markdownContent.innerHTML = formatMessage(`抱歉，处理您的请求时出现了错误: ${error.message}`);
            } finally {
                isProcessing = false;
                sendButton.disabled = false;
            }
        }
        
        // 添加消息到聊天界面
        // 在addMessage函数末尾添加
        function addMessage(role, text, images = [], time = '') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role}-message`;
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.textContent = role === 'user' ? '你' : 'AI';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            // 添加消息头部（时间和复制按钮）
            if (text || images.length > 0) {
                const messageHeader = document.createElement('div');
                messageHeader.className = 'message-header';
                
                // 添加时间
                if (time) {
                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'message-time';
                    timeSpan.textContent = time;
                    messageHeader.appendChild(timeSpan);
                }
                
                // 添加复制按钮
                if (text) {
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.title = '复制内容';
                    copyButton.addEventListener('click', function() {
                        navigator.clipboard.writeText(text).then(() => {
                            // 显示复制成功提示
                            copyButton.innerHTML = '<i class="fas fa-check"></i>';
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                            }, 2000);
                        });
                    });
                    messageHeader.appendChild(copyButton);
                }
                
                messageContent.appendChild(messageHeader);
            }
            
            // 修改渲染部分
            if (text) {
                const formattedText = formatMessage(text);
                const textDiv = document.createElement('div');
                textDiv.className = 'message-text markdown-content';
                textDiv.innerHTML = formattedText;
                messageContent.appendChild(textDiv);
            
                // 使用Promise链确保渲染顺序
                Promise.resolve().then(() => {
                    renderLaTeX(textDiv);
                    if (typeof hljs !== 'undefined') {
                        textDiv.querySelectorAll('pre.code-block').forEach((block) => {
                            hljs.highlightElement(block);
                            // 添加行号
                            const lines = block.textContent.split('\n').length - 1;
                            block.innerHTML = `<span class="line-numbers">${Array(lines).fill('<span></span>').join('')}</span>${block.innerHTML}`;
                        });
                    }
                }).catch(console.error);
            }
            
            // 添加图片
            if (images && images.length > 0) {
                const imagesContainer = document.createElement('div');
                imagesContainer.className = 'message-images';
                
                for (const image of images) {
                    const img = document.createElement('img');
                    img.src = image.dataUrl;
                    img.alt = image.name || '上传的图片';
                    img.addEventListener('click', function() {
                        // 点击放大图片
                        const fullImg = document.createElement('div');
                        fullImg.className = 'fullscreen-image';
                        fullImg.innerHTML = `<img src="${image.dataUrl}" alt="${image.name || '上传的图片'}">`;
                        fullImg.addEventListener('click', function() {
                            this.remove();
                        });
                        document.body.appendChild(fullImg);
                    });
                    imagesContainer.appendChild(img);
                }
                
                messageContent.appendChild(imagesContainer);
            }
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
            
            chatMessages.appendChild(messageDiv);
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 如果不是在加载历史记录时调用，则保存聊天历史
            if (role === 'user' && text) {
                saveChatHistory();
            }
            
            // 返回创建的消息元素，以便流式输出时可以引用
            return messageDiv;
        }
        
        // 格式化消息，支持Markdown和LaTeX
        function formatMessage(text) {
            // 保护LaTeX公式，避免被Markdown解析
            const latexBlocks = [];
            
            // 改进的LaTeX公式识别正则表达式
            // 处理多行公式块
            text = text.replace(/\$\$([\s\S]*?)\$\$/g, function(match, formula) {
                const safeFormula = formula.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                latexBlocks.push(`$$${safeFormula}$$`);
                return `%%LATEX_BLOCK_${latexBlocks.length - 1}%%`;
            });
            
            // 处理行内公式，但避免匹配货币符号
            text = text.replace(/([^\\]|^)\$([^\s$][^$]*?[^\s$])\$/g, function(match, prefix, formula) {
                const safeFormula = formula.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                latexBlocks.push(`$${safeFormula}$`);
                return `${prefix}%%LATEX_INLINE_${latexBlocks.length - 1}%%`;
            });
            
            // 处理代码块
            text = text.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
            
            // 处理行内代码
            text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // 处理标题
            text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
            text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
            text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
            
            // 处理列表
            text = text.replace(/^\s*\* (.*$)/gm, '<li>$1</li>');
            text = text.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
            text = text.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
            text = text.replace(/<\/li>\n<li>/g, '</li><li>');
            text = text.replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>');
            text = text.replace(/<\/ul>\n<ul>/g, '');
            
            // 处理粗体
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // 处理斜体
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // 处理链接
            text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            
            // 处理表格
            if (text.includes('|')) {
                const lines = text.split('\n');
                let inTable = false;
                let tableHtml = '<table class="markdown-table">';
                let isHeader = false;
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    
                    if (line.startsWith('|') && line.endsWith('|')) {
                        if (!inTable) {
                            inTable = true;
                            isHeader = true;
                        }
                        
                        const cells = line.split('|').filter(cell => cell !== '');
                        
                        if (isHeader) {
                            tableHtml += '<thead><tr>';
                            cells.forEach(cell => {
                                tableHtml += `<th>${cell.trim()}</th>`;
                            });
                            tableHtml += '</tr></thead><tbody>';
                            isHeader = false;
                        } else if (line.includes('---')) {
                            // 这是分隔行，跳过
                            continue;
                        } else {
                            tableHtml += '<tr>';
                            cells.forEach(cell => {
                                tableHtml += `<td>${cell.trim()}</td>`;
                            });
                            tableHtml += '</tr>';
                        }
                    } else if (inTable) {
                        tableHtml += '</tbody></table>';
                        inTable = false;
                        lines[i] = tableHtml + line;
                        tableHtml = '<table class="markdown-table">';
                    }
                }
                
                if (inTable) {
                    tableHtml += '</tbody></table>';
                    lines.push(tableHtml);
                }
                
                text = lines.join('\n');
            }
            
            // 处理换行
            text = text.replace(/\n/g, '<br>');
            
            // 恢复LaTeX公式，添加特殊标记以便后续渲染
            text = text.replace(/%%LATEX_BLOCK_(\d+)%%/g, function(match, index) {
                const latex = latexBlocks[parseInt(index)];
                return `<div class="math-block-container"><div class="math-block" data-latex="${encodeURIComponent(latex)}">${latex}</div></div>`;
            });
            
            text = text.replace(/%%LATEX_INLINE_(\d+)%%/g, function(match, index) {
                const latex = latexBlocks[parseInt(index)];
                return `<span class="math-inline" data-latex="${encodeURIComponent(latex)}">${latex}</span>`;
            });
            
            return `<div class="markdown-content">${text}</div>`;
        }
        
        // 添加专门的LaTeX渲染函数
        function renderLaTeX(element) {
            if (!element || typeof MathJax === 'undefined') return;
            
            // 使用最新MathJax API
            MathJax.typesetPromise([element]).then(() => {
                element.querySelectorAll('.math-block-container').forEach(container => {
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                });
            }).catch(err => {
                console.error('MathJax渲染失败:', err);
                MathJax.typeset([element]); // 回退到同步渲染
            });
        }
        
        // 添加停止生成按钮事件
        if (stopGenerateButton) {
            stopGenerateButton.addEventListener('click', function() {
                shouldStopGeneration = true;
                if (currentController) {
                    currentController.abort();
                }
                stopGenerateButton.style.display = 'none';
                isProcessing = false;
                sendButton.disabled = false;
            });
        }
        
        // 添加清除历史按钮事件
        if (clearHistoryButton) {
            clearHistoryButton.addEventListener('click', function() {
                if (confirm('确定要清除所有聊天历史吗？')) {
                    chatMessages.innerHTML = '';
                    // 清除历史但保留系统提示
                    chatHistory = [];
                    initSystemPrompt(); // 重新添加系统提示词
                    
                    // 添加欢迎消息
                    const welcomeMessage = document.createElement('div');
                    welcomeMessage.className = 'message ai-message';
                    welcomeMessage.innerHTML = `
                        <div class="avatar">AI</div>
                        <div class="message-content">
                            <p>你好！我是谷歌Gemini，可以回答问题或分析图片。欢迎与我交流。😄</p>
                        </div>
                    `;
                    chatMessages.appendChild(welcomeMessage);
                    
                    // 保存到本地存储
                    saveChatHistory();
                }
            });
        }
        
        // 加载聊天历史
        loadChatHistory();
        
        // 初始化时自动聚焦到输入框
        userInput.focus();
});