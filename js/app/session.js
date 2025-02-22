class SessionManager {
  constructor() {
    this.sessions = JSON.parse(localStorage.getItem('chatSessions')) || []
    this.currentSessionId = localStorage.getItem('currentSessionId') || this.createNewSession()
  }

  createNewSession() {
    const newSession = {
      id: Date.now().toString(),
      name: `会话 ${this.sessions.length + 1}`,
      messages: [{ role: 'system', content: '请使用中文回复。' }],
      config: {
        apiKey: '',
        apiDomain: '',
        modelName: '',
        preset: 'default',
        maxHistory: 10
      },
      createdAt: new Date()
    }
    // 初始化时继承全局配置
    const prevSession = this.getCurrentSession();
    if (prevSession) {
        newSession.config = { ...prevSession.config };
    }
    this.sessions.push(newSession)
    this.currentSessionId = newSession.id
    this.persist()
    return newSession.id
  }

  getCurrentSession() {
    return this.sessions.find(s => s.id === this.currentSessionId)
  }

  switchSession(sessionId) {
    this.currentSessionId = sessionId;
    this.persist();
    this.refreshUI(); // 确保刷新消息显示
    // 重置输入框为当前会话配置
    const session = this.getCurrentSession();
    document.getElementById('api-key-input').value = session.config.apiKey;
    document.getElementById('preset-select').value = session.config.preset;
  }

  persist() {
    const currentSession = this.getCurrentSession();
    if (currentSession) {
        currentSession.config.preset = document.getElementById('preset-select').value;
    }
    localStorage.setItem('chatSessions', JSON.stringify(this.sessions));
    localStorage.setItem('currentSessionId', this.currentSessionId);
  }

  refreshUI() {
    // 清空当前聊天界面并加载新会话消息
    const chatMessages = document.getElementById('chat-messages')
    chatMessages.innerHTML = ''
    this.getCurrentSession().messages.forEach(msg => {
      displayMessage(msg)
    })
  }

  clearCurrentSessionMessages() {
    const session = this.getCurrentSession();
    session.messages = [];
    this._saveToStorage();
    this.refreshUI(); // 调用现有UI刷新方法
  }

  clearMessagesWithConfirmation() {
    return new Promise((resolve) => {
      const modal = createConfirmationModal('这将永久删除所有消息', {
        '确认': () => {
          this.clearCurrentSessionMessages();
          resolve(true);
        },
        '取消': () => resolve(false)
      });
      document.body.appendChild(modal);
    });
  }
}
