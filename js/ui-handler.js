// UI 交互处理模块
class UIHandler {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.imageUpload = document.getElementById('image-upload');
        this.imagePreviewContainer = document.getElementById('image-preview-container');
        this.clearHistoryButton = document.getElementById('clear-history');
        this.stopGenerateButton = document.getElementById('stop-generate');
        
        this.selectedImages = [];
        this.stopButtonTimeout = null;
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    initEventListeners() {
        // 自动调整文本框高度
        this.userInput.addEventListener('input', this.adjustTextareaHeight.bind(this));
        
        // 图片上传处理
        this.imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
        
        // 清除历史按钮
        this.clearHistoryButton.addEventListener('click', () => {
            if (window.chatManager) {
                window.chatManager.clearHistory();
            }
        });
        
        // 停止生成按钮 - 优化点击反馈
        // 在 initEventListeners 方法中修正
        this.stopGenerateButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (window.chatManager) {
                // 移除动画逻辑
                window.chatManager.stopGeneration();
                // 立即隐藏按钮
                this.hideStopButton();
            }
        });
    }
    
    adjustTextareaHeight() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = (this.userInput.scrollHeight) + 'px';
        
        // 限制最大高度
        if (this.userInput.scrollHeight > 120) {
            this.userInput.style.overflowY = 'auto';
        } else {
            this.userInput.style.overflowY = 'hidden';
        }
    }
    
    handleImageUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            reader.onload = (event) => {
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
                removeButton.addEventListener('click', () => {
                    // 移除图片预览
                    previewContainer.remove();
                    // 从选中的图片数组中移除
                    this.selectedImages = this.selectedImages.filter(image => image.dataUrl !== dataUrl);
                });
                
                previewContainer.appendChild(img);
                previewContainer.appendChild(removeButton);
                this.imagePreviewContainer.appendChild(previewContainer);
                
                // 添加到选中的图片数组
                this.selectedImages.push({
                    dataUrl,
                    name: file.name
                });
                
                // 上传图片后自动在输入框填入提示文本
                if (this.userInput.value.trim() === '') {
                    this.userInput.value = "说说你看到了什么";
                    // 触发input事件以调整文本框高度
                    const event = new Event('input', { bubbles: true });
                    this.userInput.dispatchEvent(event);
                }
            };
            
            reader.readAsDataURL(file);
        }
        
        // 清空文件输入，以便可以再次选择相同的文件
        e.target.value = '';
    }
    
    clearImagePreviews() {
        this.imagePreviewContainer.innerHTML = '';
        this.selectedImages = [];
    }
    
    showStopButton(show) {
        if (show) {
            // 直接切换显示状态
            this.stopGenerateButton.style.display = 'flex';
            this.sendButton.style.visibility = 'hidden'; // 隐藏发送按钮
            // 移除尺寸设置逻辑
        } else {
            this.stopGenerateButton.style.display = 'none';
            this.sendButton.style.visibility = 'visible'; // 恢复发送按钮
        }
    }
    
    hideStopButton() {
        // 简化隐藏逻辑
        this.stopGenerateButton.style.display = 'none';
        this.sendButton.style.visibility = 'visible';
    }
    
    disableSendButton(disable) {
        this.sendButton.disabled = disable;
        
        // 添加视觉反馈
        if (disable) {
            this.sendButton.classList.add('disabled');
        } else {
            this.sendButton.classList.remove('disabled');
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// 查找可能使用了未定义block变量的代码
// 例如在处理代码高亮或Markdown渲染的函数中

// 可能的修复方式
function highlightCode(element) {
    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        if (window.hljs) {
            window.hljs.highlightElement(block);
        }
    });
}