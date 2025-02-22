let messages = []; // 移除全局系统消息

// 修改为从当前会话获取配置
function getCurrentConfig() {
    const session = window.sessionManager?.getCurrentSession();
    return { 
        ...session?.config, 
        messages: session?.messages || [] 
    };
}

// 修改为流式响应
async function fetchAIResponse(message, onChunk, fileData = null) {
    const session = window.sessionManager.getCurrentSession();
    const { apiKey, apiDomain, modelName } = session.config;
    const url = `${apiDomain}/v1/chat/completions`;

    // 使用会话中已存储的消息（不重复添加新消息）
    const requestMessages = session.messages
        .filter(m => m.role !== 'system')
        .slice(-10); // 保留最后5轮对话

    if (message) requestMessages.push({ role: "user", content: message });
    if (fileData) requestMessages.push({ role: "user", content: `data:image/png;base64,${fileData}` });

    const data = {
        model: modelName,
        messages: requestMessages, // 直接使用已存储的消息
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
    };

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        console.log("Request Headers:", headers);

        const body = JSON.stringify(data);
        console.log("Request Body:", body);

        const stopController = new AbortController();

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
            signal: stopController.signal
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            throw new Error(`API错误: ${response.status} - ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let stop = false; // 用于控制 AI 输出的暂停和恢复

        while (!stop) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true })
                .replace(/\r/g, '')  // 移除回车符
                .replace(/\]\}[\n\s]*\{/g, '},{') // 处理可能的分隔符
                .trim();

            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const jsonStr = line.slice(6).replace(/(\r\n|\n|\r)/gm, "");
                        const data = JSON.parse(jsonStr);
                        const content = data.choices[0]?.delta?.content || '';
                        if (content) {
                            onChunk(content);
                        }
                    } catch (e) {
                        console.error('解析错误:', e, '原始数据:', line);
                    }
                }
            }
        }

        console.log("请求URL:", url);
        console.log("请求头:", headers);
        console.log("请求体:", data);
    } catch (error) {
        console.error("Error fetching AI response:", error);
        if (error.name === 'AbortError') {
            console.log('请求已中止');
            return;
        }
        throw error;
    }
}

function getApiConfig() {
  const session = window.sessionManager.getCurrentSession()
  return {
    apiKey: session.config.apiKey,
    apiDomain: session.config.apiDomain,
    modelName: session.config.modelName,
    messages: session.messages
  }
}

function setApiConfig(newApiKey, newApiDomain, newModelName) {
  const session = window.sessionManager.getCurrentSession()
  session.config.apiKey = newApiKey
  session.config.apiDomain = newApiDomain
  session.config.modelName = newModelName
  session.messages = [{ role: 'system', content: '请使用中文回复。' }]
  window.sessionManager.persist()
}

function validateRequest(messages) {
    // 确保最后一条是用户消息
    const last = messages[messages.length - 1];
    if (last?.role !== 'user') {
        throw new Error("无效的对话上下文");
    }
    
    // 检查消息交替
    let prevRole = '';
    for (const msg of messages) {
        if (msg.role === prevRole) {
            throw new Error("连续的同角色消息");
        }
        prevRole = msg.role;
    }
}

async function sendToAPI() {
    const context = window.sessionManager.getContextWindow();
    
    // 仅保留最后1轮有效对话
    const validMessages = context
        .filter(msg => msg.role !== 'system')
        .slice(-2);

    const payload = {
        messages: [
            {
                role: "system",
                content: "请直接回答用户的最新问题，忽略之前的对话历史。"
            },
            ...validMessages
        ]
    };
}
