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
        this.stopGenerateButton.addEventListener('click', (e) => {
            if (window.chatManager) {
                // 添加点击反馈动画
                this.stopGenerateButton.classList.add('clicked');
                
                // 显示停止中状态
                this.stopGenerateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">停止中...</span>';
                
                // 调用停止生成方法
                window.chatManager.stopGeneration();
                
                // 300ms后恢复按钮状态
                setTimeout(() => {
                    this.stopGenerateButton.classList.remove('clicked');
                    this.hideStopButton();
                }, 300);
                
                // 阻止事件冒泡
                e.stopPropagation();
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
            // 获取发送按钮的样式
            const sendButtonStyle = window.getComputedStyle(this.sendButton);
            
            // 复制发送按钮的关键样式属性
            this.stopGenerateButton.style.width = sendButtonStyle.width;
            this.stopGenerateButton.style.height = sendButtonStyle.height;
            this.stopGenerateButton.style.borderRadius = sendButtonStyle.borderRadius;
            
            // 确保位置完全重合
            this.stopGenerateButton.style.position = 'absolute';
            this.stopGenerateButton.style.right = '0';
            this.stopGenerateButton.style.bottom = '0';
            
            // 显示按钮
            this.stopGenerateButton.style.display = 'flex';
        } else {
            this.stopGenerateButton.style.display = 'none';
        }
    }
    
    hideStopButton() {
        // 添加淡出动画
        this.stopGenerateButton.classList.remove('fade-in');
        this.stopGenerateButton.classList.add('fade-out');
        
        // 动画结束后隐藏按钮
        this.stopButtonTimeout = setTimeout(() => {
            this.stopGenerateButton.style.display = 'none';
            this.stopButtonTimeout = null;
        }, 300); // 与CSS动画时长匹配
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