// js/file-upload.js
function setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    const attachButton = document.getElementById('attach-button');
    let selectedFile = null;
    
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                selectedFile = null;
                alert('请选择图片文件');
                fileInput.value = '';
                return;
            }
            const fileData = await readFileAsBase64(selectedFile);
            addMessage('', 'user', fileData);
            fileInput.value = '';
        }
    });
}
