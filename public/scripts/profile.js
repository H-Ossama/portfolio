const profileManager = {
    async loadProfileSection() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = this.getProfileTemplate();
        await this.loadUserData();
        this.setupEventListeners();
    },

    getProfileTemplate() {
        // Added tab structure
        return `
            <div class="section-header">
                <h2>Profile & Settings</h2>
                <button class="save-btn" id="save-profile" style="display: none;"> <!-- Initially hidden, shown on relevant tabs -->
                    <i class="fas fa-save"></i>
                    <span>Save Changes</span>
                </button>
            </div>

            <div class="profile-tabs">
                <button class="tab-button active" data-tab="account">Account Info</button>
                <button class="tab-button" data-tab="theme">Theme</button>
                <button class="tab-button" data-tab="image">Profile Image</button>
                <button class="tab-button" data-tab="email-template">Reset Email</button>
            </div>

            <div class="profile-tab-content active" id="account-tab-content">
                <!-- Account Info content moved here -->
                <div class="profile-section">
                    <h3>Account Information</h3>
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" name="new-password">
                        <small>Leave blank to keep current password</small>
                    </div>
                </div>
            </div>

            <div class="profile-tab-content" id="theme-tab-content">
                <!-- Theme Preferences content moved here -->
                <div class="profile-section">
                    <h3>Theme Preferences</h3>
                    <div class="form-group">
                        <label for="theme">Default Theme</label>
                        <select id="theme" name="theme">
                            <option value="dark">Dark Mode</option>
                            <option value="light">Light Mode</option>
                            <option value="winter">Winter Theme</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="profile-tab-content" id="image-tab-content">
                <!-- Profile Image content moved here -->
                <div class="profile-section">
                    <h3>Profile Image</h3>
                    <div class="image-upload-container">
                        <div class="current-image">
                            <img id="profile-preview" src="assets/images/profile-pic.jpg" alt="Profile Picture">
                        </div>
                        <div class="upload-controls">
                            <label for="profile-image" class="upload-btn">
                                <i class="fas fa-upload"></i>
                                <span>Upload New Image</span>
                            </label>
                            <input type="file" id="profile-image" accept="image/*" hidden>
                            <small>Maximum size: 2MB. Supported formats: JPG, PNG</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="profile-tab-content" id="email-template-tab-content">
                <!-- Email template editor will be loaded here -->
                <div id="email-template-editor-container"></div>
            </div>
        `;
    },

    async loadUserData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // If no token, redirect to login immediately
                window.location.href = 'login.html';
                return; // Stop execution
            }

            const response = await fetch('/api/user/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Handle specific error statuses
            if (response.status === 401 || response.status === 403) {
                console.error('Authentication error loading user data. Redirecting to login.');
                utils.showMessage('Authentication failed. Please log in again.', 'error');
                localStorage.removeItem('token'); // Clear invalid token
                window.location.href = 'login.html';
                return; // Stop execution
            }

            if (!response.ok) {
                // Handle other non-ok statuses (like 404, 500)
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' })); // Try to get error details
                console.error(`Error loading user data: ${response.status}`, errorData);
                throw new Error(`Failed to load user data (Status: ${response.status})`);
            }

            const userData = await response.json();
            this.populateForm(userData);
        } catch (error) {
            console.error('Error in loadUserData:', error); // Log the actual error object
            // Display a user-friendly message, potentially using the error message if available
            utils.showMessage(error.message || 'Failed to load user data', 'error');
            // Optional: Consider redirecting or specific UI changes based on the error
        }
    },

    populateForm(userData) {
        document.getElementById('username').value = userData.username || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('theme').value = userData.settings?.theme || 'dark';
        
        const preview = document.getElementById('profile-preview');
        if (userData.avatar) {
            preview.src = userData.avatar;
        }
    },

    setupEventListeners() {
        // Tab switching logic
        const tabButtons = document.querySelectorAll('.profile-tabs .tab-button');
        const tabContents = document.querySelectorAll('.profile-tab-content');
        const saveButton = document.getElementById('save-profile'); // Get the main save button

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;

                // Update button active state
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update content active state
                tabContents.forEach(content => {
                    content.classList.toggle('active', content.id === `${tabId}-tab-content`);
                });

                // Show/hide the main save button based on the tab
                const showSaveButtonForTabs = ['account', 'theme', 'image'];
                saveButton.style.display = showSaveButtonForTabs.includes(tabId) ? 'inline-flex' : 'none';


                // Load email template editor if that tab is selected
                if (tabId === 'email-template') {
                    // Check if the emailTemplatesModule and its rendering function exist
                    if (typeof emailTemplatesModule !== 'undefined' && typeof emailTemplatesModule.renderTemplateEditor === 'function') {
                        const container = document.getElementById('email-template-editor-container');
                        // Only render if the container is empty to avoid duplicates
                        if (container && !container.hasChildNodes()) {
                             emailTemplatesModule.renderTemplateEditor(container);
                        }
                    } else {
                        console.error('Email templates module or render function not found.');
                        // Optionally display an error message to the user in the container
                        const container = document.getElementById('email-template-editor-container');
                        if(container) container.innerHTML = '<p class="error-message">Error loading email template editor.</p>';
                    }
                }
            });
        });


        // Existing event listeners (scoped correctly by IDs)
        const imageInput = document.getElementById('profile-image');
        imageInput?.addEventListener('change', this.handleImagePreview.bind(this));

        // Form submission (now handles combined profile data)
        saveButton?.addEventListener('click', this.handleSave.bind(this));

        // Trigger click on the initially active tab to load its content correctly (if needed)
        // document.querySelector('.profile-tabs .tab-button.active')?.click(); // Might not be needed if default HTML is sufficient
    },

    async handleImagePreview(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            utils.showMessage('Please select an image file', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            utils.showMessage('Image size should be less than 2MB', 'error');
            return;
        }

        const preview = document.getElementById('profile-preview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.src = e.target.result;
        };

        reader.readAsDataURL(file);
    },

    async handleSave() {
        try {
            utils.showLoading();
            const formData = new FormData();
            
            formData.append('username', document.getElementById('username').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('theme', document.getElementById('theme').value);

            const password = document.getElementById('new-password').value;
            if (password) {
                formData.append('password', password);
            }

            const imageFile = document.getElementById('profile-image').files[0];
            if (imageFile) {
                formData.append('avatar', imageFile);
            }

            const response = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update profile');

            utils.showMessage('Profile updated successfully', 'success');
            await this.loadUserData(); // Reload data to show updated values
        } catch (error) {
            utils.showMessage('Failed to update profile', 'error');
        } finally {
            utils.hideLoading();
        }
    }
};