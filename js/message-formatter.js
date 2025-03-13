// 消息格式化模块
class MessageFormatter {
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
        text = text.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
        
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
}