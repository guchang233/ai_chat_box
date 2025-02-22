// js/utils.js
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
    const session = window.sessionManager.getCurrentSession();
    // 检查最后一条消息是否重复
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage || lastMessage.content !== message) {
        session.messages.push({
            role: sender === 'user' ? 'user' : 'assistant',
            content: message
        });
    }
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (sender === 'user') {
        messageDiv.classList.add('user-message');
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = '编辑';
        editButton.addEventListener('click', () => {
            editMessage(messageDiv);
        });
        messageDiv.appendChild(editButton);
    } else if (sender === 'ai') {
        messageDiv.classList.add('ai-message');
    }
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
        const scrollToBottomButton = document.getElementById('scroll-to-bottom-button');
        scrollToBottomButton.style.display = 'flex';
        updateScrollButtonPosition();
    } else {
         const scrollToBottomButton = document.getElementById('scroll-to-bottom-button');
        scrollToBottomButton.style.display = 'none';
    }
}

function addLoadingMessage() {
    const chatMessages = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'loading-message');
    loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

function removeLoadingMessage(loadingDiv) {
    const chatMessages = document.getElementById('chat-messages');
    if (loadingDiv) {
        chatMessages.removeChild(loadingDiv);
    }
}
