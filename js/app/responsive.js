// js/responsive.js
function setupResponsiveDesign() {
    function handleResize() {
        const navRightItems = document.querySelectorAll('.nav-right > li:not(.theme-toggle-container)');
        if (window.innerWidth <= 768) {
            navRightItems.forEach(item => item.style.display = 'none');
        } else {
            navRightItems.forEach(item => item.style.display = 'block');
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化时执行一次
}
