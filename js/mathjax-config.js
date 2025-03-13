window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$','$$'], ['\\[','\\]']],
    processEscapes: true,
    packages: {'[+]': ['ams']}
  },
  options: {
    enableMenu: false,
    renderActions: {
      addMenu: [], // 禁用右键菜单
      checkLoading: [] // 禁用加载检查
    }
  },
  startup: {
    typeset: true, // 允许自动渲染
    pageReady: function() {
      return MathJax.startup.defaultPageReady().then(function() {
        console.log('MathJax初始化完成');
      });
    }
  },
  chtml: {
    scale: 0.9,
    mtextInheritFont: true,
    matchFontHeight: true
  }
};