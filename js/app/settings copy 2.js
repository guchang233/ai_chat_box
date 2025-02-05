// js/settings.js
function setupSettingsModal() {
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeButton = document.querySelector('.close-button');
    const saveSettingsButton = document.getElementById('save-settings-button');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiUrlInput = document.getElementById('api-url-input');
    const modelNameInput = document.getElementById('model-name-input');
    const generalSettingsButton = document.getElementById('general-settings-button');
    const advancedSettingsButton = document.getElementById('advanced-settings-button');
    const generalSettingsPanel = document.getElementById('general-settings');
    const advancedSettingsPanel = document.getElementById('advanced-settings');
    const mainElement = document.querySelector('main');

    let settingsChanged = false;

    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        apiKeyInput.value = apiKey;
        apiUrlInput.value = apiDomain;
        modelNameInput.value = modelName;
        settingsChanged = false;
        generalSettingsButton.classList.add('active');
        advancedSettingsButton.classList.remove('active');
        generalSettingsPanel.classList.add('active');
        advancedSettingsPanel.classList.remove('active');
        adjustModalSize();
    });

    apiKeyInput.addEventListener('input', () => {
        settingsChanged = true;
    });
    apiUrlInput.addEventListener('input', () => {
        settingsChanged = true;
    });
    modelNameInput.addEventListener('input', () => {
        settingsChanged = true;
    });

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

    saveSettingsButton.addEventListener('click', () => {
        const newApiKey = apiKeyInput.value.trim();
        const newApiUrl = apiUrlInput.value.trim();
        const newModelName = modelNameInput.value.trim();
        
        if (newApiKey && newApiUrl && newModelName) {
            setApiConfig(newApiKey, newApiUrl, newModelName);
            settingsModal.style.display = 'none';
            alert('设置已保存！');
            settingsChanged = false;
        } else {
            alert('请填写所有设置项！');
        }
    });

    window.addEventListener('beforeunload', (event) => {
        if (settingsChanged) {
            event.preventDefault();
            event.returnValue = "设置已修改，是否放弃保存？";
            return "设置已修改，是否放弃保存？";
        }
    });

    generalSettingsButton.addEventListener('click', () => {
        generalSettingsButton.classList.add('active');
        advancedSettingsButton.classList.remove('active');
        generalSettingsPanel.classList.add('active');
        advancedSettingsPanel.classList.remove('active');
    });

    advancedSettingsButton.addEventListener('click', () => {
        advancedSettingsButton.classList.add('active');
        generalSettingsButton.classList.remove('active');
        advancedSettingsPanel.classList.add('active');
        generalSettingsPanel.classList.remove('active');
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
