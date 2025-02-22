let aiMessage = null; // 单实例维护

async function handleStream(response, userMessage) {
    const decoder = new TextDecoder();
    let currentText = '';
    
    aiMessage = createMessage('ai', '', userMessage.id);
    
    const reader = response.body.getReader();
    while(true) {
        const { done, value } = await reader.read();
        if(done) break;
        
        currentText += decoder.decode(value);
        aiMessage.content = currentText; // 更新同一对象
        updateMessageDisplay(aiMessage); // 统一更新显示
    }
    
    saveToHistory(aiMessage); // 最终保存
} 