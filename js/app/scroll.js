// js/scroll.js
function setupScrollButton() {
    const scrollToBottomButton = document.getElementById('scroll-to-bottom-button');
    const chatMessages = document.getElementById('chat-messages');
    scrollToBottomButton.addEventListener('click', scrollToBottom);

    chatMessages.addEventListener('scroll', () => {
        if (chatMessages.scrollHeight > chatMessages.clientHeight + chatMessages.scrollTop) {
            scrollToBottomButton.style.display = 'flex';
            updateScrollButtonPosition();
        } else {
            scrollToBottomButton.style.display = 'none';
        }
    });
}

function updateScrollButtonPosition() {
    const sendButton = document.getElementById('send-button');
    const scrollToBottomButton = document.getElementById('scroll-to-bottom-button');
    const chatMessages = document.getElementById('chat-messages');

    const sendButtonRect = sendButton.getBoundingClientRect();
    const chatMessagesRect = chatMessages.getBoundingClientRect();

    const buttonTop = sendButtonRect.top - chatMessagesRect.top - scrollToBottomButton.offsetHeight ;//////////
    const buttonRight = chatMessagesRect.right - sendButtonRect.right ;////////

    scrollToBottomButton.style.top = `${buttonTop}px`;
    scrollToBottomButton.style.right = `${buttonRight}px`;
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    const scrollToBottomButton = document.getElementById('scroll-to-bottom-button');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    scrollToBottomButton.style.display = 'none';
}
