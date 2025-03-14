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

// 可选模型列表
const AVAILABLE_MODELS = [
    {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: '快速响应的通用模型',
        api_url: 'https://gemini.tech-zer.top/v1/chat/completions',
        api_key: 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U'
    },
    {
        id: 'gemini-2.0-pro-exp',
        name: 'Gemini 2.0 Pro',
        description: '高级推理能力的专业模型',
        api_url: 'https://gemini.tech-zer.top/v1/chat/completions',
        api_key: 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U'
    },
    {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: '硅基流动的高级模型',
        api_url: 'https://gemini.tech-zer.top/v1/chat/completions',
        api_key: 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U'
    },
    {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: '硅基流动的旗舰模型',
        api_url: 'https://gemini.tech-zer.top/v1/chat/completions',
        api_key: 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U'
    },
    {
        id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        name: 'DeepSeek R1 Qwen 7B',
        description: '硅基流动部署的模型',
        api_url: 'https://api.siliconflow.cn/v1/chat/completions',
        api_key: 'sk-lxmwbpakbgskicxtzoqaxbzdhubfpszjfvkyoosakfzntjjj',
        parameters: {
            stream_options: {
                include_usage: true,
                include_reasoning: true
            }
        }
    }
];

// 从本地存储获取当前选择的模型，如果没有则使用默认模型
const savedModel = localStorage.getItem('selectedModel') || 'gemini-2.0-flash-exp';

// 获取当前选择模型的配置
const getCurrentModelConfig = () => {
    const model = AVAILABLE_MODELS.find(m => m.id === savedModel) || AVAILABLE_MODELS[0];
    return {
        id: model.id,
        api_url: model.api_url,
        api_key: model.api_key
    };
};

const modelConfig = getCurrentModelConfig();

const CONFIG = {
    API_URL: modelConfig.api_url,
    API_KEY: modelConfig.api_key,
    MODEL: modelConfig.id,
    API_ENDPOINT: modelConfig.api_url,
    SYSTEM_PROMPT: `今天是${currentDate}。你是一个由Gu微调的AI助手，现有的ai大模型。请遵循以下规则：
            1. 提供准确、有用的回答
            2. 如果不确定答案，请坦诚承认
            3. 避免生成有害、非法或不道德的内容
            4. 使用简洁清晰的语言
            5. 当需要展示数学公式时，使用LaTeX格式，并将其居中显示
            6. 对于行内公式，使用单个美元符号，如 $E=mc^2$
            7. 对于需要单独罗列的公式，使用双美元符号，如 $$E=mc^2$$
            8. 对于复杂的推导过程，请使用行间公式并分步骤展示
            9. 回答使用中文`,
    AVAILABLE_MODELS: AVAILABLE_MODELS,
    
    // 切换模型的方法
    switchModel: function(modelId) {
        const model = AVAILABLE_MODELS.find(m => m.id === modelId);
        if (model) {
            this.MODEL = model.id;
            this.API_URL = model.api_url;
            this.API_KEY = model.api_key;
            this.API_ENDPOINT = model.api_url;
            
            localStorage.setItem('selectedModel', model.id);
            console.log(`已切换到模型: ${model.name}`);
            return true;
        }
        console.error(`无效的模型ID: ${modelId}`);
        return false;
    }
};

// 添加配置验证逻辑
function validateConfig() {
    // 不同API可能有不同的密钥格式，所以移除长度检查
    if (!CONFIG.API_KEY) {
        console.error('API密钥未设置');
        alert('API配置错误，请检查config.js文件');
        return false;
    }
    
    if (!CONFIG.API_ENDPOINT.includes('https://')) {
        console.error('API端点需要HTTPS协议');
        return false;
    }
    
    return true;
}

// 初始化时自动验证配置
validateConfig();