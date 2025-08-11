const messageManager = {
    async loadMessagesSection() {
        const contentArea = document.getElementById('content-area');
        try {
            const messages = await utils.fetchWithAuth('/api/messages');
            
            contentArea.innerHTML = `
                <div class="section-header">
                    <h2>Messages</h2>
                    <div class="header-actions">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="unread">Unread</button>
                        <button class="filter-btn" data-filter="read">Read</button>
                    </div>
                </div>
                <div class="messages-container">
                    <div class="messages-list">
                        ${this.renderMessagesList(messages)}
                    </div>
                    <div class="message-detail">
                        <div class="no-message-selected">
                            <i class="fas fa-envelope"></i>
                            <p>Select a message to view details</p>
                        </div>
                    </div>
                </div>`;

            this.setupEventListeners();
            this.updateUnreadCount();
        } catch (error) {
            contentArea.innerHTML = '<div class="error-message">Failed to load messages</div>';
            console.error('Error loading messages:', error);
        }
    },

    renderMessagesList(messages) {
        if (!messages.length) {
            return '<div class="no-messages">No messages found</div>';
        }

        return messages.map(message => `
            <div class="message-item ${message.read ? 'read' : 'unread'}" data-id="${message.id}">
                <div class="message-sender">
                    <i class="fas fa-user-circle"></i>
                    <div class="sender-info">
                        <span class="sender-name">${message.name}</span>
                        <span class="sender-email">${message.email}</span>
                    </div>
                </div>
                <div class="message-preview">
                    <span class="message-subject">${message.projectType || 'General Inquiry'}</span>
                    <p class="message-excerpt">${this.truncateText(message.message, 100)}</p>
                </div>
                <div class="message-meta">
                    <span class="message-date">${this.formatDate(message.createdAt)}</span>
                    ${!message.read ? '<span class="unread-badge"></span>' : ''}
                </div>
            </div>
        `).join('');
    },

    getMessagesTemplate() {
        return `
            <div class="section-header">
                <h2>Messages</h2>
                <div class="header-actions">
                    <button class="filter-btn" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="unread">Unread</button>
                    <button class="filter-btn" data-filter="read">Read</button>
                </div>
            </div>

            <div class="messages-container">
                <div class="messages-list"></div>
                <div class="message-detail">
                    <div class="no-message-selected">
                        <i class="fas fa-envelope"></i>
                        <p>Select a message to view details</p>
                    </div>
                </div>
            </div>
        `;
    },

    async loadMessages() {
        try {
            const response = await fetch(config.getApiPath('/api/messages'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load messages');
            
            const messages = await response.json();
            this.renderMessages(messages);
            this.updateMessageCount(messages.filter(m => !m.read).length);
        } catch (error) {
            utils.showMessage('Failed to load messages', 'error');
        }
    },

    renderMessages(messages) {
        const messagesList = document.querySelector('.messages-list');
        if (!messagesList) return;

        messagesList.innerHTML = messages.map(message => `
            <div class="message-item ${message.read ? 'read' : 'unread'}" data-id="${message.id}">
                <div class="message-sender">
                    <i class="fas fa-user-circle"></i>
                    <div class="sender-info">
                        <span class="sender-name">${message.name}</span>
                        <span class="sender-email">${message.email}</span>
                    </div>
                </div>
                <div class="message-preview">
                    <span class="message-subject">${message.projectType || 'General Inquiry'}</span>
                    <p class="message-excerpt">${this.truncateText(message.message, 100)}</p>
                </div>
                <div class="message-meta">
                    <span class="message-date">${this.formatDate(message.createdAt)}</span>
                    ${!message.read ? '<span class="unread-badge"></span>' : ''}
                </div>
            </div>
        `).join('');
    },

    renderMessageDetail(message) {
        const detailContainer = document.querySelector('.message-detail');
        if (!detailContainer) return;

        detailContainer.innerHTML = `
            <div class="message-header">
                <div class="sender-info">
                    <h3>${message.name}</h3>
                    <span class="sender-email">${message.email}</span>
                </div>
                <div class="message-actions">
                    <button class="action-btn" onclick="messageManager.deleteMessage('${message.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn" onclick="messageManager.toggleReadStatus('${message.id}')">
                        <i class="fas fa-${message.read ? 'envelope' : 'check'}"></i>
                    </button>
                </div>
            </div>
            <div class="message-info">
                <div class="info-item">
                    <span class="label">Company:</span>
                    <span class="value">${message.company || 'Not specified'}</span>
                </div>
                <div class="info-item">
                    <span class="label">Project Type:</span>
                    <span class="value">${message.projectType || 'Not specified'}</span>
                </div>
                <div class="info-item">
                    <span class="label">Timeline:</span>
                    <span class="value">${message.timeline || 'Not specified'}</span>
                </div>
                <div class="info-item">
                    <span class="label">Received:</span>
                    <span class="value">${this.formatDate(message.createdAt)}</span>
                </div>
            </div>
            <div class="message-content">
                <h4>Message:</h4>
                <p>${message.message}</p>
            </div>
        `;
    },

    setupEventListeners() {
        // Message selection
        document.querySelector('.messages-list')?.addEventListener('click', (e) => {
            const messageItem = e.target.closest('.message-item');
            if (!messageItem) return;

            this.selectMessage(messageItem.dataset.id);
        });

        // Message filtering
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterMessages(filter);
            });
        });
    },

    async selectMessage(id) {
        try {
            const response = await fetch(`/api/messages/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load message');
            
            const message = await response.json();
            this.renderMessageDetail(message);

            // Mark as read if unread
            if (!message.read) {
                await this.toggleReadStatus(id);
            }

            // Update UI
            document.querySelectorAll('.message-item').forEach(item => {
                item.classList.toggle('selected', item.dataset.id === id);
            });
        } catch (error) {
            utils.showMessage('Failed to load message details', 'error');
        }
    },

    async toggleReadStatus(id) { // Renamed from markAsRead
        try {
            // Find the current status from the UI to determine the new status
            const messageItem = document.querySelector(`.message-item[data-id="${id}"]`);
            const isCurrentlyRead = messageItem ? messageItem.classList.contains('read') : false;
            const newReadStatus = !isCurrentlyRead;

            const response = await fetch(`/api/messages/${id}/read`, { // Keep using the same endpoint, but send the desired status
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json' // Added Content-Type
                },
                body: JSON.stringify({ read: newReadStatus }) // Send the new status in the body
            });

            if (!response.ok) throw new Error('Failed to toggle message read status');

            // Update UI
            if (messageItem) {
                messageItem.classList.toggle('read', newReadStatus);
                messageItem.classList.toggle('unread', !newReadStatus);
                const badge = messageItem.querySelector('.unread-badge');
                if (newReadStatus && badge) {
                    badge.remove();
                } else if (!newReadStatus && !badge) {
                    const metaDiv = messageItem.querySelector('.message-meta');
                    if (metaDiv) {
                        const newBadge = document.createElement('span');
                        newBadge.className = 'unread-badge';
                        metaDiv.appendChild(newBadge);
                    }
                }
            }
            
            // Update detail view button if this message is selected
            const detailButton = document.querySelector(`.message-detail button[onclick*="toggleReadStatus('${id}')"]`);
            if (detailButton) {
                 detailButton.innerHTML = newReadStatus 
                    ? '<i class="fas fa-envelope-open"></i> Mark as Unread'
                    : '<i class="fas fa-envelope"></i> Mark as Read';
            }

            await this.updateUnreadCount();
        } catch (error) {
            utils.showMessage('Failed to toggle message read status', 'error');
            console.error('Toggle Read Status Error:', error); // Added console log
        }
    },

    async deleteMessage(id) {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete message');

            // Update UI
            document.querySelector(`.message-item[data-id="${id}"]`)?.remove();
            document.querySelector('.message-detail').innerHTML = this.getNoMessageSelectedTemplate();
            utils.showMessage('Message deleted successfully', 'success');

            await this.updateUnreadCount();
        } catch (error) {
            utils.showMessage('Failed to delete message', 'error');
        }
    },

    async updateUnreadCount() {
        console.log('Attempting to fetch /api/messages/unread-count'); // Add log
        try {
            const response = await utils.fetchWithAuth('/api/messages/unread-count'); // Use fetchWithAuth
            
            // No need to check response.ok here, fetchWithAuth handles it
            // if (!response.ok) throw new Error('Failed to get unread count');
            
            // fetchWithAuth already parses JSON if applicable
            // const { count } = await response.json(); 
            const count = response.count; // Access count directly from the parsed response

            if (typeof count !== 'number') { // Add check for valid count
                 console.error('Invalid count received:', response);
                 throw new Error('Invalid count received from server');
            }

            this.updateMessageCount(count);
        } catch (error) {
            console.error('Failed to update unread count:', error);
            // utils.showMessage is likely called within fetchWithAuth already
        }
    },

    updateMessageCount(count) {
        const badge = document.querySelector('.message-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    filterMessages(filter) {
        const messages = document.querySelectorAll('.message-item');
        messages.forEach(message => {
            switch (filter) {
                case 'unread':
                    message.style.display = message.classList.contains('unread') ? 'flex' : 'none';
                    break;
                case 'read':
                    message.style.display = message.classList.contains('read') ? 'flex' : 'none';
                    break;
                default:
                    message.style.display = 'flex';
            }
        });

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    },

    getNoMessageSelectedTemplate() {
        return `
            <div class="no-message-selected">
                <i class="fas fa-envelope"></i>
                <p>Select a message to view details</p>
            </div>
        `;
    },

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text || ''; // Handle null/undefined text
        return text.substr(0, maxLength) + '...';
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};