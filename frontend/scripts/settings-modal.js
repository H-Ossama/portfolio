// Password confirmation modal for settings page
document.addEventListener('DOMContentLoaded', function() {
    // Add password confirmation modal to DOM
    const passwordModal = document.createElement('div');
    passwordModal.className = 'password-modal';
    passwordModal.innerHTML = `
        <div class="password-modal-content">
            <div class="password-modal-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Confirm Reset Settings</h3>
            </div>
            <div class="password-modal-body">
                <p>This action will reset ALL settings to their default values. This cannot be undone. Please enter your password to confirm.</p>
                <div class="password-input-container">
                    <label for="confirm-password">Password</label>
                    <input type="password" id="confirm-password" placeholder="Enter your password">
                </div>
            </div>
            <div class="password-modal-footer">
                <button class="password-modal-btn password-modal-cancel">Cancel</button>
                <button class="password-modal-btn password-modal-confirm">Reset Settings</button>
            </div>
        </div>
    `;
    document.body.appendChild(passwordModal);
    
    // Modal functionality
    function showPasswordModal(callback) {
        passwordModal.classList.add('active');
        
        // Reset input field
        document.getElementById('confirm-password').value = '';
        
        // Setup button event handlers
        const confirmBtn = document.querySelector('.password-modal-confirm');
        const cancelBtn = document.querySelector('.password-modal-cancel');
        
        // Remove existing event listeners to prevent duplicates
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Add new event listeners
        newConfirmBtn.addEventListener('click', function() {
            const password = document.getElementById('confirm-password').value;
            if (password) {
                // In a real app, you'd verify this password against the user's actual password
                // For demo purposes, we'll use a simple check
                if (password === 'admin' || (window.state && window.state.user && password === window.state.user.password)) {
                    passwordModal.classList.remove('active');
                    if (typeof callback === 'function') {
                        callback(true);
                    }
                } else {
                    const messageContainer = document.createElement('p');
                    messageContainer.className = 'password-error';
                    messageContainer.textContent = 'Incorrect password. Please try again.';
                    messageContainer.style.color = '#ff5252';
                    messageContainer.style.fontSize = '12px';
                    messageContainer.style.marginTop = '10px';
                    
                    // Remove any existing error message
                    const existingError = document.querySelector('.password-error');
                    if (existingError) {
                        existingError.remove();
                    }
                    
                    document.querySelector('.password-input-container').appendChild(messageContainer);
                }
            }
        });
        
        newCancelBtn.addEventListener('click', function() {
            passwordModal.classList.remove('active');
            if (typeof callback === 'function') {
                callback(false);
            }
        });
    }
    
    // Make showPasswordModal available globally
    window.showPasswordModal = showPasswordModal;
});
