// 全局变量
let referenceImage = null;

// DOM元素
document.addEventListener('DOMContentLoaded', () => {
    // 侧边栏控制
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    
    openSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    
    // 标签页切换
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // 切换按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 切换内容显示
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // 滑块值显示
    const stepsSlider = document.getElementById('steps');
    const stepsValue = document.getElementById('steps-value');
    const guidanceSlider = document.getElementById('guidance-scale');
    const guidanceValue = document.getElementById('guidance-value');
    
    stepsSlider.addEventListener('input', () => {
        stepsValue.textContent = stepsSlider.value;
    });
    
    guidanceSlider.addEventListener('input', () => {
        guidanceValue.textContent = guidanceSlider.value;
    });
    
    // 随机种子按钮
    const randomSeedBtn = document.getElementById('random-seed');
    const seedInput = document.getElementById('seed');
    
    randomSeedBtn.addEventListener('click', () => {
        seedInput.value = Math.floor(Math.random() * 4294967295);
    });
    
    // 图片上传处理
    const uploadImageInput = document.getElementById('upload-image');
    const clearImageBtn = document.getElementById('clear-image');
    
    uploadImageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                referenceImage = event.target.result;
                addSystemMessage('参考图片已上传成功！');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    clearImageBtn.addEventListener('click', () => {
        referenceImage = null;
        uploadImageInput.value = '';
        addSystemMessage('参考图片已清除！');
    });
    
    // 生成按钮
    const generateBtn = document.getElementById('generate-button');
    generateBtn.addEventListener('click', generateImage);
});

// 添加系统消息
function addSystemMessage(text) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    
    // 添加动画效果
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    scrollToBottom();
}

// 添加用户消息
function addUserMessage(prompt, negativePrompt) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    
    let messageContent = `<p>${prompt}</p>`;
    if (negativePrompt) {
        messageContent += `<p class="negative-prompt">负向提示词: ${negativePrompt}</p>`;
    }
    
    messageDiv.innerHTML = `<div class="message-content">${messageContent}</div>`;
    messagesContainer.appendChild(messageDiv);
    
    // 添加动画效果
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    scrollToBottom();
}

// 添加AI回复（带图片）
function addAIMessage(imageUrl) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>已为您生成图像：</p>
            <div class="image-toggle" onclick="toggleImage(this)">点击查看图片 <i class="fas fa-chevron-down"></i></div>
            <div class="message-image">
                <img src="${imageUrl}" alt="生成的图像">
            </div>
            <div class="image-actions">
                <button class="button" onclick="downloadImage('${imageUrl}')"><i class="fas fa-download"></i> 下载</button>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // 添加动画效果
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    scrollToBottom();
}

// 添加加载中消息
function addLoadingMessage() {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai loading';
    messageDiv.id = 'loading-message';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p><i class="fas fa-spinner fa-spin"></i> 正在生成图像，请稍候...</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// 移除加载中消息
function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// 滚动到底部
function scrollToBottom() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 切换图片显示/隐藏
function toggleImage(element) {
    const imageContainer = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    if (imageContainer.classList.contains('show')) {
        imageContainer.classList.remove('show');
        element.classList.remove('active');
        element.innerHTML = '点击查看图片 <i class="fas fa-chevron-down"></i>';
    } else {
        imageContainer.classList.add('show');
        element.classList.add('active');
        element.innerHTML = '点击收起图片 <i class="fas fa-chevron-up"></i>';
    }
}

// 下载图片
function downloadImage(imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 生成图像
async function generateImage() {
    // 获取输入值
    const promptInput = document.getElementById('prompt-input').value.trim();
    const negativeInput = document.getElementById('negative-input').value.trim();
    const modelSelect = document.getElementById('model-select').value;
    const apiKey = document.getElementById('api-key').value;
    const imageSize = document.getElementById('image-size').value;
    const batchSize = parseInt(document.getElementById('batch-size').value);
    const seed = parseInt(document.getElementById('seed').value);
    const steps = parseInt(document.getElementById('steps').value);
    const guidanceScale = parseFloat(document.getElementById('guidance-scale').value);
    
    // 验证输入
    if (!promptInput) {
        addSystemMessage('请输入图像描述！');
        return;
    }
    
    if (!apiKey) {
        addSystemMessage('请输入API密钥！');
        return;
    }
    
    // 显示用户输入
    addUserMessage(promptInput, negativeInput);
    
    // 显示加载中
    addLoadingMessage();
    
    try {
        // 准备请求数据
        const requestBody = {
            model: modelSelect,
            prompt: promptInput,
            negative_prompt: negativeInput || "",
            image_size: imageSize,
            batch_size: batchSize,
            seed: seed,
            num_inference_steps: steps,
            guidance_scale: guidanceScale
        };
        
        // 如果有参考图片，添加到请求中
        if (referenceImage) {
            requestBody.image = referenceImage;
        }
        
        // 发送请求
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };
        
        const response = await fetch('https://api.siliconflow.cn/v1/images/generations', options);
        const data = await response.json();
        
        // 移除加载中消息
        removeLoadingMessage();
        
        // 处理响应
        if (data.data && data.data.length > 0) {
            // 显示生成的图像
            data.data.forEach(item => {
                addAIMessage(item.url);
            });
        } else if (data.error) {
            // 显示错误信息
            addSystemMessage(`生成失败：${data.error.message || '未知错误'}`);
        } else {
            addSystemMessage('生成失败：API返回格式异常');
        }
    } catch (error) {
        // 移除加载中消息
        removeLoadingMessage();
        // 显示错误信息
        addSystemMessage(`生成失败：${error.message || '网络错误'}`);
    }
}