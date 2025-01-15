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

    let apiKey = localStorage.getItem('apiKey') || '';
    let apiDomain = localStorage.getItem('apiDomain') || '';
    let modelName = localStorage.getItem('modelName') || '';
    let settingsChanged = false;

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
            const newApiKey = apiKeyInput.value.trim();
            const newApiUrl = apiUrlInput.value.trim();
            const newModelName = modelNameInput.value.trim();

            if (newApiKey && newApiUrl && newModelName) {
                setApiConfig(newApiKey, newApiUrl, newModelName);
                settingsModal.style.display = 'none';
                alert('设置已保存！');
            } else {
                alert('请填写所有设置项！');
            }
        });
    }

    function adjustModalSize() {
        if (!mainElement) return;
        const mainWidth = mainElement.offsetWidth;
        const mainHeight = mainElement.offsetHeight;
        settingsModal.style.width = `${mainWidth}px`;
        settingsModal.style.height = `${mainHeight}px`;
    }

    window.addEventListener('resize', adjustModalSize);
}
