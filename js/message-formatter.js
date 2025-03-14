// 消息格式化模块
class MessageFormatter {
    // 修复代码块处理
    // 在 formatMessage 方法中添加或修改 LaTeX 处理部分
    static formatMessage(text) {
        // 保护LaTeX公式，避免被Markdown解析
        const latexBlocks = [];
        
        // 改进的LaTeX公式识别正则表达式
        // 处理多行公式块
        text = text.replace(/\$\$([\s\S]*?)\$\$/g, function(match, formula) {
            const safeFormula = formula.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            latexBlocks.push(`$$${safeFormula}$$`);
            return `%%LATEX_BLOCK_${latexBlocks.length - 1}%%`;
        });
        
        // 处理行内公式，但避免匹配货币符号
        text = text.replace(/([^\\]|^)\$([^\s$][^$]*?[^\s$])\$/g, function(match, prefix, formula) {
            const safeFormula = formula.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            latexBlocks.push(`$${safeFormula}$`);
            return `${prefix}%%LATEX_INLINE_${latexBlocks.length - 1}%%`;
        });
        
        // 处理代码块
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, language, content) {
            const codeElement = document.createElement('pre');
            codeElement.className = 'code-block';
            
            const block = document.createElement('code');
            if (language) {
                block.className = language;
            }
            block.textContent = content;
            
            // 使用 innerHTML 而不是直接返回字符串
            codeElement.appendChild(block);
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(codeElement);
            return tempDiv.innerHTML;
        });
        
        // 处理行内代码
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 处理标题
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // 处理列表
        text = text.replace(/^\s*\* (.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
        text = text.replace(/<\/li>\n<li>/g, '</li><li>');
        text = text.replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>');
        text = text.replace(/<\/ul>\n<ul>/g, '');
        
        // 处理粗体
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 处理链接
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 处理表格
        if (text.includes('|')) {
            const lines = text.split('\n');
            let inTable = false;
            let tableHtml = '<table class="markdown-table">';
            let isHeader = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('|') && line.endsWith('|')) {
                    if (!inTable) {
                        inTable = true;
                        isHeader = true;
                    }
                    
                    const cells = line.split('|').filter(cell => cell !== '');
                    
                    if (isHeader) {
                        tableHtml += '<thead><tr>';
                        cells.forEach(cell => {
                            tableHtml += `<th>${cell.trim()}</th>`;
                        });
                        tableHtml += '</tr></thead><tbody>';
                        isHeader = false;
                    } else if (line.includes('---')) {
                        // 这是分隔行，跳过
                        continue;
                    } else {
                        tableHtml += '<tr>';
                        cells.forEach(cell => {
                            tableHtml += `<td>${cell.trim()}</td>`;
                        });
                        tableHtml += '</tr>';
                    }
                } else if (inTable) {
                    tableHtml += '</tbody></table>';
                    inTable = false;
                    lines[i] = tableHtml + line;
                    tableHtml = '<table class="markdown-table">';
                }
            }
            
            if (inTable) {
                tableHtml += '</tbody></table>';
                lines.push(tableHtml);
            }
            
            text = lines.join('\n');
        }
        
        // 处理换行
        text = text.replace(/\n/g, '<br>');
        
        // 恢复LaTeX公式，添加特殊标记以便后续渲染
        text = text.replace(/%%LATEX_BLOCK_(\d+)%%/g, function(match, index) {
            const latex = latexBlocks[parseInt(index)];
            return `<div class="math-block-container"><div class="math-block" data-latex="${encodeURIComponent(latex)}">${latex}</div></div>`;
        });
        
        text = text.replace(/%%LATEX_INLINE_(\d+)%%/g, function(match, index) {
            const latex = latexBlocks[parseInt(index)];
            return `<span class="math-inline" data-latex="${encodeURIComponent(latex)}">${latex}</span>`;
        });
        
        // 处理行间 LaTeX 公式 (双 $)，必须先处理这个，避免与行内公式冲突
        text = text.replace(/\$\$([\s\S]+?)\$\$/g, function(match, formula) {
            return `<div class="math-display">$$${formula}$$</div>`;
        });
        
        // 处理行内 LaTeX 公式 (单个 $)
        text = text.replace(/\$([^\$\n]+?)\$/g, function(match, formula) {
            return `<span class="math-inline">$${formula}$</span>`;
        });
        
        return `<div class="markdown-content">${text}</div>`;
    }
    
    static renderLaTeX(element) {
        if (!element || typeof MathJax === 'undefined') return;
        
        // 使用最新MathJax API
        MathJax.typesetPromise([element]).then(() => {
            element.querySelectorAll('.math-block-container').forEach(container => {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            });
        }).catch(err => {
            console.error('MathJax渲染失败:', err);
            MathJax.typeset([element]); // 回退到同步渲染
        });
    }
    
    // 修改 formatMarkdown 方法
    formatMarkdown(text) {
        // 先处理 think 标签
        const thinkBlocks = [];
        text = text.replace(/<think>([\s\S]*?)<\/think>/g, (match, content) => {
            const placeholder = `__THINK_${thinkBlocks.length}__`;
            thinkBlocks.push(content);
            return placeholder;
        });
    
        // 处理其他 Markdown
        let formatted = marked(text)
            .replace(/<pre>/g, '<pre class="code-block">')
            .replace(/<table>/g, '<table class="markdown-table">');
    
        // 还原 think 标签
        formatted = formatted.replace(/__THINK_(\d+)__/g, (_, index) => {
            const content = thinkBlocks[parseInt(index)];
            return `<div class="think-block">
                <div class="think-title"><i class="fas fa-brain"></i>推理过程</div>
                ${this.formatMarkdown(content)}
            </div>`;
        });
    
        return formatted;
    }
    
    // 在 formatMessage 方法中修改 LaTeX 处理部分
    static formatMessage(text) {
        // 保存代码块，避免处理代码块中的数学符号
        const codeBlocks = [];
        text = text.replace(/```([\s\S]*?)```/g, function(match) {
            const index = codeBlocks.length;
            codeBlocks.push(match);
            return `__CODE_BLOCK_${index}__`;
        });
        
        // 处理行间公式（必须先处理这个，避免与行内公式冲突）
        text = text.replace(/\$\$([\s\S]+?)\$\$/g, function(match, formula) {
            return `<div class="latex-display-container"><div class="latex-display-inner">$$${formula}$$</div></div>`;
        });
        
        // 处理行内公式
        text = text.replace(/\$([^\$\n]+?)\$/g, function(match, formula) {
            return `<span style="font-style:italic;">$${formula}$</span>`;
        });
        
        // 恢复代码块
        text = text.replace(/__CODE_BLOCK_(\d+)__/g, function(match, index) {
            return codeBlocks[parseInt(index)];
        });
        
        // 处理其他 Markdown 格式
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        text = text.replace(/^\s*\* (.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
        text = text.replace(/<\/li>\n<li>/g, '</li><li>');
        text = text.replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>');
        text = text.replace(/<\/ul>\n<ul>/g, '');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        if (text.includes('|')) {
            const lines = text.split('\n');
            let inTable = false;
            let tableHtml = '<table class="markdown-table">';
            let isHeader = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('|') && line.endsWith('|')) {
                    if (!inTable) {
                        inTable = true;
                        isHeader = true;
                    }
                    
                    const cells = line.split('|').filter(cell => cell !== '');
                    
                    if (isHeader) {
                        tableHtml += '<thead><tr>';
                        cells.forEach(cell => {
                            tableHtml += `<th>${cell.trim()}</th>`;
                        });
                        tableHtml += '</tr></thead><tbody>';
                        isHeader = false;
                    } else if (line.includes('---')) {
                        // 这是分隔行，跳过
                        continue;
                    } else {
                        tableHtml += '<tr>';
                        cells.forEach(cell => {
                            tableHtml += `<td>${cell.trim()}</td>`;
                        });
                        tableHtml += '</tr>';
                    }
                } else if (inTable) {
                    tableHtml += '</tbody></table>';
                    inTable = false;
                    lines[i] = tableHtml + line;
                    tableHtml = '<table class="markdown-table">';
                }
            }
            
            if (inTable) {
                tableHtml += '</tbody></table>';
                lines.push(tableHtml);
            }
            
            text = lines.join('\n');
        }
        
        text = text.replace(/\n/g, '<br>');
        return text;
    }
    
    // 添加一个方法来刷新 MathJax 渲染
    static refreshMathJax() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            setTimeout(() => {
                window.MathJax.typesetPromise()
                    .catch(err => console.warn('MathJax 渲染错误:', err));
            }, 100); // 延迟一点时间确保 DOM 已更新
        }
    }
}
