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

function addMessage(message, sender, fileData) {
    const session = window.sessionManager.getCurrentSession();
    
    // 生成稳定指纹（移除时间戳）
    const fingerprint = CryptoJS.MD5(
        `${sender}_${message}_${fileData?.name || ''}`
    ).toString();

    // 三重校验：内容、角色、时间
    const isDuplicate = session.messages.some(m => 
        m.fingerprint === fingerprint || 
        (m.role === (sender === 'user' ? 'user' : 'assistant') &&
         Date.now() - m.timestamp < 1000)
    );

    if (!isDuplicate) {
        const newMessage = {
            role: sender === 'user' ? 'user' : 'assistant',
            content: message,
            fingerprint,
            timestamp: Date.now()
        };

        // 强制角色交替
        const lastMessage = session.messages[session.messages.length - 1];
        if (lastMessage?.role === sender) {
            session.messages.pop(); // 移除最后一条同角色消息
        }
        session.messages.push(newMessage);
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

// 新增文件哈希生成函数
function getFileHash(fileData) {
    return CryptoJS.MD5(fileData.data).toString();
}
