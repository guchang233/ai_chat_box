window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$','$$'], ['\\[','\\]']],
    processEscapes: true,
    packages: {'[+]': ['ams']}
  },
  options: {
    enableMenu: false
  },
  startup: {
    typeset: true
  },
  chtml: {
    scale: 0.9,
    mtextInheritFont: true
  }
};