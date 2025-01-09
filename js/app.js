document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            sendMessage();
        }
    });

    let sendingMessage = false;

    async function sendMessage() {
        if (sendingMessage) return;
        sendingMessage = true;
        
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            messageInput.value = '';
            sendButton.disabled = true;

            // 创建消息容器
            const messageContainer = document.createElement('div');
            messageContainer.className = 'ai-message-container';

            // 创建加载动画
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-message';
            loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
            messageContainer.appendChild(loadingDiv);
            chatMessages.appendChild(messageContainer);

            // 创建消息气泡
            const messageDiv = document.createElement('div');
            messageDiv.className = 'ai-message';
            const contentDiv = document.createElement('div');
            contentDiv.className = 'typing';
            messageDiv.appendChild(contentDiv);

            try {
                let currentText = '';
                
                // 开始接收响应时移除加载动画
                messageContainer.removeChild(loadingDiv);
                messageContainer.appendChild(messageDiv);

                await fetchAIResponse(message, (chunk) => {
                    currentText += chunk;
                    // 使用 innerHTML 而不是 textContent 以支持 markdown
                    contentDiv.innerHTML = marked.parse(currentText);
                    
                    // 处理代码高亮
                    const codeBlocks = messageDiv.querySelectorAll('pre code');
                    codeBlocks.forEach(block => {
                        if (!block.classList.contains('hljs')) {
                            hljs.highlightElement(block);
                            
                            // 添加复制按钮
                            const pre = block.parentElement;
                            if (!pre.querySelector('.copy-button')) {
                                const copyButton = document.createElement('button');
                                copyButton.className = 'copy-button';
                                copyButton.textContent = '复制';
                                copyButton.onclick = async () => {
                                    await navigator.clipboard.writeText(block.textContent);
                                    copyButton.textContent = '已复制!';
                                    copyButton.classList.add('copied');
                                    setTimeout(() => {
                                        copyButton.textContent = '复制';
                                        copyButton.classList.remove('copied');
                                    }, 2000);
                                };
                                pre.appendChild(copyButton);
                            }
                        }
                    });
                    
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
            } catch (error) {
                console.error("Error:", error);
                messageDiv.innerHTML = '<div class="ai-content">抱歉，出错了，请稍后重试。</div>';
            } finally {
                sendingMessage = false;
                sendButton.disabled = false;
                // 移除最后一个字符
                if (contentDiv.childNodes.length > 0) {
                    const lastChild = contentDiv.childNodes[contentDiv.childNodes.length - 1];
                    if (lastChild.nodeType === Node.TEXT_NODE) {
                        lastChild.textContent = lastChild.textContent.slice(0, -1);
                    } else if (lastChild.nodeType === Node.ELEMENT_NODE && lastChild.lastChild && lastChild.lastChild.nodeType === Node.TEXT_NODE) {
                        lastChild.lastChild.textContent = lastChild.lastChild.textContent.slice(0, -1);
                    }
                }
            }
        }
    }

    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        let processedMessage = message;
        if (sender === 'ai') {
            marked.setOptions({
                highlight: function(code, language) {
                    if (language && hljs.getLanguage(language)) {
                        try {
                            return hljs.highlight(code, { language: language }).value;
                        } catch (err) {
                            console.error('Highlight.js error:', err);
                        }
                    }
                    return hljs.highlightAuto(code).value;
                },
                langPrefix: 'hljs language-',
                breaks: true,
                gfm: true
            });
            
            processedMessage = marked.parse(message);
            
            setTimeout(() => {
                const codeBlocks = messageDiv.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    const pre = block.parentElement;
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.textContent = '复制';
                    copyButton.onclick = async () => {
                        await navigator.clipboard.writeText(block.textContent);
                        copyButton.textContent = '已复制!';
                        copyButton.classList.add('copied');
                        setTimeout(() => {
                            copyButton.textContent = '复制';
                            copyButton.classList.remove('copied');
                        }, 2000);
                    };
                    pre.appendChild(copyButton);
                });
            }, 0);
        } else {
            processedMessage = message.replace(/\*/g, '<br>');
        }
        
        messageDiv.innerHTML = `<span style="font-size: 14px;">${processedMessage}</span>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (sender === 'ai') {
            hljs.highlightAll();
        }
    }

    function addLoadingMessage() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'loading-message');
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv;
    }

    function removeLoadingMessage(loadingDiv) {
        if (loadingDiv) {
            chatMessages.removeChild(loadingDiv);
        }
    }
});
