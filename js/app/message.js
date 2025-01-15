// js/message.js
let sendingMessage = false;
let editingMessage = false;
let editStartIndex = -1;

function setupMessageSending() {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');

        sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            sendMessage();
        }
    });
}

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const attachButton = document.getElementById('attach-button');
    const body = document.body;
    const chatMessages = document.getElementById('chat-messages');
    let selectedFile = null;
    const fileInput = document.getElementById('file-input');

    const messageText = messageInput.value.trim();
    if (!messageText && !selectedFile) {
        return;
    }
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

    if (message) {
        addMessage(message, 'user');
    }
    
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
            attachButton.textContent = '✚';
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
    MathJax.typeset();
}

function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', message.sender);

    let messageContent = message.text;
    if (message.sender === 'ai') {
        messageContent = marked.parse(messageContent);
    }
    messageDiv.innerHTML = messageContent;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (message.sender === 'ai') {
        messageDiv.querySelectorAll('pre code').forEach(block => {
            hljs.highlightBlock(block);
            const copyButton = document.createElement('button');
            copyButton.textContent = '复制';
            copyButton.classList.add('copy-button');
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    copyButton.textContent = '已复制';
                    setTimeout(() => {
                        copyButton.textContent = '复制';
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败', err);
                    copyButton.textContent = '复制失败';
                    setTimeout(() => {
                        copyButton.textContent = '复制';
                    }, 2000);
                });
            });
            block.parentNode.insertBefore(copyButton, block.nextSibling);
        });
    }
}
