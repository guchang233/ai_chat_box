// js/message.js
let sendingMessage = false;
let editingMessage = false;
let editStartIndex = -1;

const sendButton = document.getElementById('send-button');
const stopButton = document.getElementById('stop-button');

// 添加消息历史数组维护
let messageHistory = [];
const MAX_HISTORY = 10; // 保持最近10条对话

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

function toggleSendButtonState() {
    if (!sendButton) return;
    const messageInput = document.getElementById('message-input');
    sendButton.disabled = !messageInput.value.trim();
}

async function sendMessage() {
    const userInput = document.getElementById('message-input').value.trim();
    if (!userInput) return;

    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;
    let aiResponse = '';
    
    try {
        // 添加用户消息到历史
        messageHistory.push({ role: 'user', content: userInput });
        addMessage('user', userInput);

        // 显示加载状态
        addMessage('assistant', '思考中...');

        // 使用统一的API调用
        await fetchAIResponse(userInput, (chunk) => {
            aiResponse += chunk;
            updateLastMessage(aiResponse);
        });

        // 添加AI回复到历史
        messageHistory.push({ role: 'assistant', content: aiResponse });
    } catch (error) {
        console.error('请求失败:', error);
        alert(`请求失败: ${error.message}`);
    } finally {
        sendButton.disabled = false;
    }
}

function addMessage(sender, content, fileData = null) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    // 保持原有消息容器结构
    messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
    
    // 保持原有内容结构
    const contentSpan = document.createElement('span');
    contentSpan.style.fontSize = '14px';
    
    if (fileData) {
        contentSpan.innerHTML = `<img src="data:image/png;base64,${fileData}" style="max-width:100%;border-radius:6px;">`;
    } else {
        contentSpan.innerHTML = sender === 'user' ? content : marked.parse(content);
    }

    // 保持原有按钮结构
    if (sender === 'user') {
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = '编辑';
        messageDiv.appendChild(editButton);
    }

    messageDiv.appendChild(contentSpan);
    chatMessages.appendChild(messageDiv);

    // 保持原有代码高亮逻辑
    if (sender === 'ai') {
        hljs.highlightAll();
        MathJax.typesetPromise();
    }
}

function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', message.sender);

    let messageContent = message.text;
    if (message.sender === 'ai') {
        messageContent = marked.parse(messageContent);
    }
    messageDiv.innerHTML = `<div class="message-content">${messageContent}</div>`;

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
    MathJax.typesetPromise();
}

function safeClearContainer(containerId) {
    const container = document.getElementById(containerId);
    const clone = container.cloneNode(false); // 只克隆容器本身
    container.parentNode.replaceChild(clone, container);
    return clone; // 返回新容器以便重新初始化
}

// 清空历史时重置
function clearChat() {
    messageHistory = [];
    // ... existing clear UI code ...
}

// 保持原有结构更新内容
function updateLastMessage(newContent) {
    const chatMessages = document.getElementById('chat-messages');
    const lastMessage = chatMessages.lastElementChild;
    if (lastMessage && lastMessage.classList.contains('ai-message')) {
        const contentSpan = lastMessage.querySelector('span');
        if (contentSpan) {
            contentSpan.innerHTML = marked.parse(newContent);
            hljs.highlightAll();
            MathJax.typesetPromise();
        }
    }
}
