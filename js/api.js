const apiKey = 'API     密     钥'; // 你的 API 密钥
const apiDomain = 'API     域     名'; // 自定义 API 域名
const modelName = '模     型     名     称'; // 模型名称

// OpenAI 风格的 API 调用
async function fetchAIResponse(message) {
    const url = `${apiDomain}/v1/chat/completions`;

    const data = {
        model: modelName,
        messages: [
            { role: 'system', content: '请使用中文回复。' }, // 指示 AI 使用中文回复
            { role: "user", content: message }
            ]
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
             console.error("API Error:", errorData)
            throw new Error(`API 请求失败，状态码: ${response.status}`);
        }

        const responseData = await response.json();
        // 根据 OpenAI 的响应格式提取 AI 回复
        return responseData.choices[0].message.content;
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "抱歉，无法获取 AI 回复，请稍后重试。";
    }
}
