// js/settings.js
function setupSettingsModal() {
    console.log('setupSettingsModal called');
    const settingsModal = document.getElementById('settings-modal');
    const settingsButton = document.getElementById('settings-button');
    const closeButton = settingsModal.querySelector('.close-button');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiUrlInput = document.getElementById('api-url-input');
    const modelNameInput = document.getElementById('model-name-input');
    const saveSettingsButton = document.getElementById('save-settings-button');
    const generalSettingsPanel = document.getElementById('general-settings-panel');
    const mainElement = document.querySelector('.chat-container');
    const presetSelect = document.getElementById('preset-select');

    let apiKey = localStorage.getItem('apiKey') || '';
    let apiDomain = localStorage.getItem('apiDomain') || '';
    let modelName = localStorage.getItem('modelName') || '';
    let settingsChanged = false;

    const PRESETS = {
        default: { 
            apiKey: 'AIzaSyAP2oSzARft7Hk7I8lpu-6YVqNotJEyl5U', 
            apiDomain: 'https://gemini.tech-zer.top/v1',
            modelName: 'gemini-2.0-flash-exp' 
        },
        siliconflow: { 
            apiKey: 'sk-lxmwbpakbgskicxtzoqaxbzdhubfpszjfvkyoosakfzntjjj', 
            apiDomain: 'https://api.siliconflow.cn/v1',
            modelName: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B' 
        }
    };

    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            console.log('settingsButton clicked');
            settingsModal.style.display = 'block';
            apiKeyInput.value = apiKey;
            apiUrlInput.value = apiDomain;
            modelNameInput.value = modelName;
            settingsChanged = false;
            generalSettingsPanel.classList.add('active');
        });
    }

    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', () => {
            settingsChanged = true;
        });
    }
    if (apiUrlInput) {
        apiUrlInput.addEventListener('input', () => {
            settingsChanged = true;
        });
    }
    if (modelNameInput) {
        modelNameInput.addEventListener('input', () => {
            settingsChanged = true;
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (settingsChanged) {
                if (confirm("设置已修改，是否放弃保存？")) {
                    settingsModal.style.display = 'none';
                    settingsChanged = false;
                }
            } else {
                settingsModal.style.display = 'none';
            }
        });
    }

    if (settingsModal) {
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                if (settingsChanged) {
                    if (confirm("设置已修改，是否放弃保存？")) {
                        settingsModal.style.display = 'none';
                        settingsChanged = false;
                    }
                } else {
                    settingsModal.style.display = 'none';
                }
            }
        });
    }

    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', () => {
            const session = window.sessionManager.getCurrentSession();
            session.config = {
                apiKey: apiKeyInput.value,
                apiDomain: apiUrlInput.value,
                modelName: modelNameInput.value,
                preset: presetSelect.value
            };
            window.sessionManager.persist();
            settingsModal.style.display = 'none';
            settingsChanged = false;
            alert('设置已保存！');
        });
    }

    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            const preset = e.target.value;
            if (preset !== 'custom') {
                apiKeyInput.value = PRESETS[preset].apiKey;
                apiUrlInput.value = PRESETS[preset].apiDomain;
                modelNameInput.value = PRESETS[preset].modelName;
                settingsChanged = true;
            } else {
                settingsChanged = false;
            }
        });
    }

    [apiKeyInput, apiUrlInput, modelNameInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.value !== PRESETS[presetSelect.value]?.[input.id.replace('-input', '')]) {
                presetSelect.value = 'custom';
                settingsChanged = true;
            }
        });
    });

    function adjustModalSize() {
        if (!mainElement) return;
        const mainWidth = mainElement.offsetWidth;
        const mainHeight = mainElement.offsetHeight;
        settingsModal.style.width = `${mainWidth}px`;
        settingsModal.style.height = `${mainHeight}px`;
    }

    window.addEventListener('resize', adjustModalSize);
}
