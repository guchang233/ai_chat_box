const apiKey = 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U'; // 你的 API 密钥
const apiDomain = 'https://gemini.tech-zer.top'; // 自定义 API 域名
const modelName = 'gemini-2.0-flash-exp'; // 模型名称

// 修改为流式响应
async function fetchAIResponse(message, onChunk) {
    const url = `${apiDomain}/v1/chat/completions`;
    const data = {
        model: modelName,
        messages: [
            { role: 'system', content: '请使用中文回复。' },
            { role: "user", content: message }
        ],
        stream: true  // 启用流式输出
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API 请求失败，状态码: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
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
