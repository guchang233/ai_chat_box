// API 配置
// 添加配置验证逻辑
function validateConfig() {
    if (!CONFIG.API_KEY || CONFIG.API_KEY.length !== 39) {
        console.error('无效的API密钥格式');
        alert('API配置错误，请检查config.js文件');
        return false;
    }
    
    if (!CONFIG.API_ENDPOINT.includes('https://')) {
        console.error('API端点需要HTTPS协议');
        return false;
    }
    
    return true;
}

// 生成带时间的动态日期
const currentDate = new Date().toLocaleString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit'
});

const CONFIG = {
    API_URL: 'https://gemini.tech-zer.top',
    API_KEY: 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U',
    MODEL: 'gemini-2.0-flash-exp',
    // 添加完整的API端点
    API_ENDPOINT: 'https://gemini.tech-zer.top/v1/chat/completions',
    SYSTEM_PROMPT: `今天是${currentDate}。你是一个由谷歌开发的AI助手Gemini，基于Gemini 2.0模型。你始终说中文...` 
};

// 初始化时自动验证配置
validateConfig();