window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    packages: {'[+]': ['ams', 'noerrors']}
  },
  chtml: {
    scale: 1.05,
    fontFamily: 'Cambria, "Cambria Math", serif',
    matchFontHeight: true
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process'
  },
  startup: {
    ready: function() {
      MathJax.startup.defaultReady();
    }
  }
};

// 添加一个全局函数，用于重新渲染 LaTeX 公式
window.refreshMathJax = function() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    return window.MathJax.typesetPromise()
      .catch(err => console.warn('MathJax 渲染错误:', err));
  }
  return Promise.resolve();
};

// 在文档加载完成后处理公式
document.addEventListener('DOMContentLoaded', function() {
  // 监听DOM变化，处理新添加的公式
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.nodeType === 1) { // 元素节点
            processNewMathElements(node);
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 处理新添加的数学元素
  function processNewMathElements(container) {
    // 处理行间公式
    container.querySelectorAll('.MathJax').forEach(function(el) {
      const parent = el.parentNode;
      if (parent.tagName === 'DIV' && parent.textContent.trim().startsWith('$$')) {
        parent.classList.add('math-display');
      } else {
        el.classList.add('math-inline');
      }
    });
  }
});
