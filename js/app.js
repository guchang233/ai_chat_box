document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const chatContainer = document.querySelector('.chat-container');
    const chatHeader = document.querySelector('.chat-header');
    const scrollToBottomButton = document.getElementById('scroll-to-bottom-button');
    const fileInput = document.getElementById('file-input');
    const attachButton = document.getElementById('attach-button');

    let selectedFile = null;

    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                selectedFile = null;
                attachButton.textContent = '附件';
                alert('请选择图片文件');
                fileInput.value = ''; // 清空文件输入
                return;
            }
            attachButton.textContent = selectedFile.name;
        } else {
            attachButton.textContent = '附件';
        }
    });

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            sendMessage();
        }
    });

    let isSending = false;
    async function setSendingState(state) {
        isSending = state;
        sendButton.disabled = state;
        return Promise.resolve();
    }

    async function sendMessage() {
        if (isSending || sendButton.disabled) return;
        await setSendingState(true);
        let stop = false;
        
        const message = messageInput.value.trim();
        if (message || selectedFile) {
            let fileData = null;
            if (selectedFile) {
                fileData = await readFileAsBase64(selectedFile, (progress) => {
                    uploadProgressBar.style.width = `${progress}%`;
                });
            }
            addMessage(message, 'user', fileData);
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
            if (body.classList.contains('dark-mode')) {
                messageDiv.classList.add('dark-mode');
            }
            const contentDiv = document.createElement('div');
            contentDiv.className = 'typing';
            messageDiv.appendChild(contentDiv);

            // 创建停止按钮
            const stopButton = document.createElement('button');
            stopButton.className = 'stop-button';
            stopButton.textContent = '停止';
            stopButton.style.display = 'none'; // 初始隐藏
            // 将停止按钮添加到发送按钮的容器中
            const sendButtonContainer = document.querySelector('.chat-input-area > div');
            sendButtonContainer.appendChild(stopButton);

            stopButton.addEventListener('click', async () => {
                stop = true;
                stopButton.style.display = 'none';
                await setSendingState(false);
            });

            try {
                let currentText = '';
                
                // 开始接收响应时移除加载动画
                messageContainer.removeChild(loadingDiv);
                messageContainer.appendChild(messageDiv);
                stopButton.style.display = 'block'; // 显示停止按钮

                await fetchAIResponse(message, (chunk) => {
                    if (stop) return; // 如果 stop 为 true，则暂停输出
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
                }, fileData).finally(async () => {
                    if (!stop) {
                        setTimeout(async () => {
                            stopButton.style.display = 'none';
                            selectedFile = null;
                            attachButton.textContent = '附件';
                            await setSendingState(false);
                            // 移除最后一个字符
                            if (contentDiv.childNodes.length > 0) {
                                const lastChild = contentDiv.childNodes[contentDiv.childNodes.length - 1];
                                if (lastChild.nodeType === Node.TEXT_NODE) {
                                    lastChild.textContent = lastChild.textContent.slice(0, -1);
                                } else if (lastChild.nodeType === Node.ELEMENT_NODE && lastChild.lastChild && lastChild.lastChild.nodeType === Node.TEXT_NODE) {
                                    lastChild.lastChild.textContent = lastChild.lastChild.textContent.slice(0, -1);
                                }
                            }
                        }, 500);
                    } else {
                        stopButton.style.display = 'none';
                        selectedFile = null;
                        attachButton.textContent = '附件';
                    }
                });
            } catch (error) {
                console.error("Error:", error);
                messageDiv.innerHTML = '<div class="ai-content">抱歉，出错了，请稍后重试。</div>';
                await setSendingState(false);
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

    async function readFileAsBase64(file, onProgress) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    type: file.type,
                    data: reader.result.split(',')[1]
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function addMessage(message, sender, fileData = null) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        let processedMessage = message;
        if (fileData && fileData.type.startsWith('image/')) {
            processedMessage = `<img src="data:${fileData.type};base64,${fileData.data}" alt="Uploaded Image" style="max-width: 100%; max-height: 200px; border-radius: 6px; margin-top: 5px;">`;
        }
        messageDiv.innerHTML = `<span style="font-size: 14px;">${processedMessage}</span>`;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        if (sender === 'ai') {
            hljs.highlightAll();
        }
        
        // Show the scroll-to-bottom button if not already at the bottom
        if (chatMessages.scrollHeight > chatMessages.clientHeight + chatMessages.scrollTop) {
            scrollToBottomButton.style.display = 'flex';
            updateScrollButtonPosition(); // Update the button position
        } else {
            scrollToBottomButton.style.display = 'none';
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

    // Function to update the scroll button position
    function updateScrollButtonPosition() {
        const sendButtonRect = sendButton.getBoundingClientRect();
        const chatMessagesRect = chatMessages.getBoundingClientRect();

        const buttonTop = sendButtonRect.top - chatMessagesRect.top - scrollToBottomButton.offsetHeight + 75; // 10px margin
        const buttonRight = chatMessagesRect.right - sendButtonRect.right + 21; // 10px margin and move 40px left

        scrollToBottomButton.style.top = `${buttonTop}px`;
        scrollToBottomButton.style.right = `${buttonRight}px`;
    }

    // Function to scroll to the bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        scrollToBottomButton.style.display = 'none';
    }

    // Event listener for the scroll to bottom button
    scrollToBottomButton.addEventListener('click', scrollToBottom);

    // Event listener for scroll to show/hide the button
    chatMessages.addEventListener('scroll', () => {
        if (chatMessages.scrollHeight > chatMessages.clientHeight + chatMessages.scrollTop) {
            scrollToBottomButton.style.display = 'flex';
            updateScrollButtonPosition(); // Update the button position
        } else {
            scrollToBottomButton.style.display = 'none';
        }
    });
});
