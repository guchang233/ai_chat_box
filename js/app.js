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

            const loadingMessage = addLoadingMessage();

            try {
                const aiResponse = await fetchAIResponse(message);
                removeLoadingMessage(loadingMessage);
                addMessage(aiResponse, 'ai');
            } catch (error) {
                console.error("Error fetching AI response:", error);
                removeLoadingMessage(loadingMessage);
                addMessage("抱歉，出错了，请稍后重试。", 'ai');
            } finally {
                sendingMessage = false;
                sendButton.disabled = false;
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
