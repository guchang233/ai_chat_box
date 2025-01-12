let apiKey = 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U'; // 你的 API 密钥
let apiDomain = 'https://gemini.tech-zer.top'; // 自定义 API 域名
let modelName = 'gemini-2.0-flash-exp'; // 模型名称
let messages = [{ role: 'system', content: '请使用中文回复。' }]; // 初始化 messages 数组

// 修改为流式响应
async function fetchAIResponse(message, onChunk, fileData = null) {
    const url = `${apiDomain}/v1/chat/completions`;
    
    if (message) {
        messages.push({ role: "user", content: message });
    }
    if (fileData) {
        messages.push({ role: "user", content: `data:image/png;base64,${fileData}` });
    }
    const data = {
        model: modelName,
        messages: messages,
        stream: true  // 启用流式输出
    };

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        console.log("Request Headers:", headers);

        const body = JSON.stringify(data);
        console.log("Request Body:", body);

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API 请求失败，状态码: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let stop = false; // 用于控制 AI 输出的暂停和恢复

        while (!stop) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const content = data.choices[0].delta.content || '';
                        if (content) {
                            onChunk(content);
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
        throw error;
    }
}

function setApiConfig(newApiKey, newApiDomain, newModelName) {
    apiKey = newApiKey;
    apiDomain = newApiDomain;
    modelName = newModelName;
    messages = [{ role: 'system', content: '请使用中文回复。' }]; // 重置 messages 数组
}
