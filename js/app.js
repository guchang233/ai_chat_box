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
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeButton = document.querySelector('.close-button');
    const saveSettingsButton = document.getElementById('save-settings-button');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiUrlInput = document.getElementById('api-url-input');
    const modelNameInput = document.getElementById('model-name-input');
    const openNewPageButton = document.getElementById('open-github');

    let selectedFile = null;
    let settingsChanged = false;

    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                selectedFile = null;
                attachButton.textContent = '附件';
                alert('请选择图片文件');
                fileInput.value = '';
                return;
            }
            attachButton.textContent = selectedFile.name;
            const fileData = await readFileAsBase64(selectedFile);
            addMessage('', 'user', fileData);
            fileInput.value = '';
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

    let sendingMessage = false;

    async function sendMessage() {
        if (sendingMessage) return;
        sendingMessage = true;
        
        const message = messageInput.value.trim();
        let fileData = null;
        if (selectedFile) {
            const fileDataObj = await readFileAsBase64(selectedFile, (progress) => {
                uploadProgressBar.style.width = `${progress}%`;
            });
            fileData = fileDataObj.data;
            console.log("fileData:", fileData);
        }
        messageInput.value = '';
        sendButton.disabled = true;

        const messageContainer = document.createElement('div');
        messageContainer.className = 'ai-message-container';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-message';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        messageContainer.appendChild(loadingDiv);
        chatMessages.appendChild(messageContainer);

        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';
        if (body.classList.contains('dark-mode')) {
            messageDiv.classList.add('dark-mode');
        }
        const contentDiv = document.createElement('div');
        contentDiv.className = 'typing';
        messageDiv.appendChild(contentDiv);

        const stopButton = document.createElement('button');
        stopButton.className = 'stop-button';
        stopButton.textContent = '停止';
        stopButton.style.display = 'none';
        const sendButtonContainer = document.querySelector('.chat-input-area > div');
        sendButtonContainer.appendChild(stopButton);

        let stop = false;
        stopButton.addEventListener('click', () => {
            stop = true;
            stopButton.style.display = 'none';
            sendButton.disabled = false;
            sendingMessage = false;
        });

        try {
            let currentText = '';
            
            messageContainer.removeChild(loadingDiv);
            messageContainer.appendChild(messageDiv);
            stopButton.style.display = 'block';

            await fetchAIResponse(message, (chunk) => {
                if (stop) return;
                currentText += chunk;
                contentDiv.innerHTML = marked.parse(currentText);
                
                const codeBlocks = messageDiv.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    if (!block.classList.contains('hljs')) {
                        hljs.highlightElement(block);
                        
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
            }, fileData).finally(() => {
                stopButton.style.display = 'none';
                selectedFile = null;
                attachButton.textContent = '附件';
            });
        } catch (error) {
            console.error("Error:", error);
            messageDiv.innerHTML = '<div class="ai-content">出错了😟注意配置是否正确 , 不要频繁操作</div>';
        } finally {
            sendingMessage = false;
            sendButton.disabled = false;
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
        
        if (chatMessages.scrollHeight > chatMessages.clientHeight + chatMessages.scrollTop) {
            scrollToBottomButton.style.display = 'flex';
            updateScrollButtonPosition();
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

    function updateScrollButtonPosition() {
        const sendButtonRect = sendButton.getBoundingClientRect();
        const chatMessagesRect = chatMessages.getBoundingClientRect();

        const buttonTop = sendButtonRect.top - chatMessagesRect.top - scrollToBottomButton.offsetHeight + 75;
        const buttonRight = chatMessagesRect.right - sendButtonRect.right + 21;

        scrollToBottomButton.style.top = `${buttonTop}px`;
        scrollToBottomButton.style.right = `${buttonRight}px`;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        scrollToBottomButton.style.display = 'none';
    }

    scrollToBottomButton.addEventListener('click', scrollToBottom);

    chatMessages.addEventListener('scroll', () => {
        if (chatMessages.scrollHeight > chatMessages.clientHeight + chatMessages.scrollTop) {
            scrollToBottomButton.style.display = 'flex';
            updateScrollButtonPosition();
        } else {
            scrollToBottomButton.style.display = 'none';
        }
    });

    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        apiKeyInput.value = apiKey;
        apiUrlInput.value = apiDomain;
        modelNameInput.value = modelName;
        settingsChanged = false;
    });

    apiKeyInput.addEventListener('input', () => {
        settingsChanged = true;
    });
    apiUrlInput.addEventListener('input', () => {
        settingsChanged = true;
    });
    modelNameInput.addEventListener('input', () => {
        settingsChanged = true;
    });

    closeButton.addEventListener('click', () => {
        if (settingsChanged) {
            if (confirm("设置已修改，是否放弃保存？")) {
                settingsModal.style.display = 'none';
                settingsChanged = false;
            }
        } else {
            settingsModal.style.display = 'none';
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            if (settingsChanged) {
                if (confirm("设置已修改，是否放弃保存？")) {
                    settingsModal.style.display = 'none';
                    settingsChanged = false;
                }
            } else {
                settingsModal.style.display = 'none';
            }
        }
    });

    saveSettingsButton.addEventListener('click', () => {
        const newApiKey = apiKeyInput.value.trim();
        const newApiUrl = apiUrlInput.value.trim();
        const newModelName = modelNameInput.value.trim();
        
        if (newApiKey && newApiUrl && newModelName) {
            setApiConfig(newApiKey, newApiUrl, newModelName);
            settingsModal.style.display = 'none';
            alert('设置已保存！');
            settingsChanged = false;
        } else {
            alert('请填写所有设置项！');
        }
    });

    window.addEventListener('beforeunload', (event) => {
        if (settingsChanged) {
            event.preventDefault();
            event.returnValue = "设置已修改，是否放弃保存？";
            return "设置已修改，是否放弃保存？";
        }
    });

    openNewPageButton.addEventListener('click', () => {
        window.open('https://home.tech-zer.top', '_blank');
    });
});
