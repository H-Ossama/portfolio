const profileManager = {
    async loadProfileSection() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = this.getProfileTemplate();
        await this.loadUserData();
        this.setupEventListeners();
    },

    getProfileTemplate() {
        return `
            <div class="section-header">
                <h2>Profile Settings</h2>
                <button class="save-btn" id="save-profile">
                    <i class="fas fa-save"></i>
                    <span>Save Changes</span>
                </button>
            </div>

            <div class="profile-content">
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
        `;
    },

    async loadUserData() {
        try {
            const response = await fetch('/api/user/settings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load user data');
            
            const userData = await response.json();
            this.populateForm(userData);
        } catch (error) {
            utils.showMessage('Failed to load user data', 'error');
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
        // Image upload preview
        const imageInput = document.getElementById('profile-image');
        imageInput?.addEventListener('change', this.handleImagePreview.bind(this));

        // Form submission
        const saveButton = document.getElementById('save-profile');
        saveButton?.addEventListener('click', this.handleSave.bind(this));
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