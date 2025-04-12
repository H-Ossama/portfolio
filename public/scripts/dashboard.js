// State management
const state = {
    currentSection: 'projects',
    isLoading: false,
    user: null,
    stats: {
        visitors: 0,
        cvViews: 0,
        cvDownloads: 0,
        messageCount: 0
    },
    settings: {
        theme: 'dark',
        maintenanceMode: {
            contact: {
                enabled: true,
                message: 'I apologize for the inconvenience. The contact form is currently undergoing maintenance.'
            },
            portfolio: {
                enabled: false,
                message: 'Portfolio section is under maintenance. Please check back later.'
            },
            skills: {
                enabled: false,
                message: 'Skills section is under maintenance. Please check back later.'
            }
        },
        errorHandling: {
            showDetailedErrors: false,
            logErrors: true,
            errorNotifications: false,
            errorEmailNotifications: false,
            errorEmail: ''
        },
        seo: {
            titlePrefix: 'Portfolio | ',
            metaDescription: 'Professional portfolio showcasing my projects, skills, and experience.',
            keywords: 'portfolio, web development, programming, projects',
            enableOpenGraph: true,
            enableTwitterCards: true
        },
        social: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            showSocialIcons: true
        },
        contentVisibility: {
            showProjects: true,
            showSkills: true,
            showEducation: true,
            showExperience: true,
            showContact: true
        },
        performance: {
            enableLazyLoading: true,
            enableImageOptimization: true,
            enableCodeMinification: false
        }
    }
};

// Utility functions
const utils = {
    showLoading() {
        state.isLoading = true;
        document.getElementById('loading-overlay').classList.add('show');
    },

    hideLoading() {
        state.isLoading = false;
        document.getElementById('loading-overlay').classList.remove('show');
    },

    showMessage(text, type = 'info') {
        const container = document.getElementById('message-container');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                          type === 'error' ? 'exclamation-circle' : 
                          type === 'warning' ? 'exclamation-triangle' : 
                          'info-circle'}"></i>
            <span>${text}</span>
        `;
        
        container.appendChild(message);
        requestAnimationFrame(() => message.classList.add('show'));

        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 3000);
    },

    async fetchWithAuth(endpoint, options = {}) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                throw new Error('Not authenticated');
            }

            const defaultHeaders = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(endpoint, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                    throw new Error('Session expired');
                }

                // Try to parse error message from response
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || 'Request failed';
                } catch {
                    errorMessage = 'Request failed';
                }
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            console.error('API Error:', error);
            this.showMessage(error.message, 'error');
            throw error;
        }
    }
};

// Analytics module
const analytics = {
    async loadStats() {
        try {
            // Add /api prefix
            const stats = await utils.fetchWithAuth('/api/stats');
            state.stats = stats;
            this.updateStatsDisplay();
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    updateStatsDisplay() {
        // Update message badge
        const messageBadge = document.querySelector('.message-badge');
        if (messageBadge) {
            messageBadge.textContent = state.stats.messageCount || '0';
        }

        // If we're on the analytics section, update the detailed stats
        if (state.currentSection === 'analytics') {
            const contentArea = document.getElementById('content-area');
            contentArea.innerHTML = this.renderStatsTemplate();
            this.initializeCharts();
        }
    },

    renderStatsTemplate() {
        return `
            <div class="section-header">
                <h2>Visitor Analytics</h2>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Total Visitors</div>
                    <div class="stat-value">${state.stats.visitors}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">CV Views</div>
                    <div class="stat-value">${state.stats.cvViews}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">CV Downloads</div>
                    <div class="stat-value">${state.stats.cvDownloads}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Messages</div>
                    <div class="stat-value">${state.stats.messageCount}</div>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="visitorChart"></canvas>
            </div>
        `;
    },

    async initializeCharts() {
        // We'll implement charts in a separate module
    }
};

// User profile module
const userProfile = {
    async loadUserProfile() {
        try {
            // Add /api prefix
            const userData = await utils.fetchWithAuth('/api/user/settings');
            state.user = userData;
            this.updateProfileDisplay();
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    },

    updateProfileDisplay() {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = state.user?.username || 'Admin';
        }

        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar && state.user?.avatar) {
            userAvatar.src = state.user.avatar;
        }
    }
};

// Theme management
const themeManager = {
    init() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Remove any existing listeners to prevent duplicates
            const newThemeToggle = themeToggle.cloneNode(true);
            themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
            
            // Add click handler
            newThemeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Initialize theme icon
            const savedTheme = localStorage.getItem('theme') || 'dark';
            this.applyTheme(savedTheme);
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle icon
        const icon = document.querySelector('.theme-toggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

// Navigation management
const navigation = {
    init() {
        // Setup navigation event listeners
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Setup mobile navigation
        const mobileToggle = document.getElementById('mobile-nav-toggle');
        const sidebar = document.querySelector('.dashboard-sidebar');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    if (!e.target.closest('.dashboard-sidebar') && 
                        !e.target.closest('#mobile-nav-toggle')) {
                        sidebar.classList.remove('show');
                    }
                }
            });
        }
    },

    async navigateToSection(section) {
        state.currentSection = section;
        
        // Update active state in navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Load section content
        utils.showLoading();
        try {
            const contentArea = document.getElementById('content-area');
              switch(section) {
                case 'analytics':
                    await analytics.loadStats();
                    break;
                case 'messages':
                    await messageManager.loadMessagesSection();
                    break;
                case 'projects':
                    await this.loadProjects(contentArea);
                    break;
                case 'skills':
                    await this.loadSkills(contentArea);
                    break;
                case 'education':
                    await this.loadEducation(contentArea);
                    break;
                case 'profile':
                    await profileManager.loadProfileSection();
                    break;
                case 'settings':
                    await settingsManager.loadSettingsSection();
                    break;
                default:
                    contentArea.innerHTML = '<div class="error-message">Section not found</div>';
            }
        } catch (error) {
            utils.showMessage('Failed to load section content', 'error');
            console.error('Navigation error:', error);
        } finally {
            utils.hideLoading();
        }
    },

    async loadProjects(contentArea) {
        try {
            const projects = await utils.fetchWithAuth('/api/projects');
            contentArea.innerHTML = `
                <div class="section-header">
                    <h2>Projects</h2>
                    <button class="add-btn" onclick="openModal('project-modal')">
                        <i class="fas fa-plus"></i> Add Project
                    </button>
                </div>
                <div class="projects-grid">
                    ${projects.map(project => this.renderProjectCard(project)).join('')}
                </div>
            `;
        } catch (error) {
            utils.showMessage('Failed to load projects', 'error');
        }
    },

    async loadSkills(contentArea) {
        try {
            const response = await utils.fetchWithAuth('/api/skills');
            const skillsData = response.skills || []; // Extract the nested skills array
            
            contentArea.innerHTML = `
                <div class="section-header">
                    <h2>Skills & Technologies</h2>
                    <button class="add-btn" onclick="openModal('skill-modal')">
                        <i class="fas fa-plus"></i> Add Skill
                    </button>
                </div>
                <div class="skills-grid">
                    ${skillsData.map(skill => this.renderSkillCard(skill)).join('')}
                </div>
            `;
        } catch (error) {
            utils.showMessage('Failed to load skills', 'error');
        }
    },

    async loadEducation(contentArea) {
        try {
            const education = await utils.fetchWithAuth('/api/education');
            contentArea.innerHTML = `
                <div class="section-header">
                    <h2>Education</h2>
                    <button class="add-btn" onclick="openModal('education-modal')">
                        <i class="fas fa-plus"></i> Add Education
                    </button>
                </div>
                <div class="education-timeline">
                    ${education.map(edu => this.renderEducationCard(edu)).join('')}
                </div>
            `;
        } catch (error) {
            utils.showMessage('Failed to load education', 'error');
        }
    },    renderProjectCard(project) {
        return `
            <div class="project-card" data-id="${project.id}">
                <div class="project-image">
                    <img src="${project.image || 'assets/images/project-placeholder.jpg'}" alt="${project.title}">
                    <div class="project-overlay">
                        <div class="project-action-icons">
                            <button onclick="editProject('${project.id}')" class="card-icon-btn edit-icon" title="Edit Project">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProject('${project.id}')" class="card-icon-btn delete-icon" title="Delete Project">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-technologies">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${project.githubLink}" target="_blank" class="action-btn github-btn">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                        <a href="${project.liveLink}" target="_blank" class="action-btn live-btn">
                            <i class="fas fa-external-link-alt"></i> Live
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    renderSkillCard(skill) {
        return `
            <div class="skill-card" data-id="${skill.id}">
                <div class="skill-header">
                    <i class="${skill.icon}"></i>
                    <h3>${skill.name}</h3>
                </div>
                <div class="skill-level">
                    <div class="level-bar">
                        <div class="level-fill" style="width: ${skill.level}%"></div>
                    </div>
                    <span class="level-text">${skill.level}%</span>
                </div>
                <p class="skill-description">${skill.description}</p>
                <div class="skill-tags">
                    ${skill.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
                </div>
                <div class="skill-actions">
                    <button onclick="editSkill('${skill.id}')" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSkill('${skill.id}')" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },

    renderEducationCard(edu) {
        return `
            <div class="education-card" data-id="${edu.id}">
                <div class="education-year">${edu.year}</div>
                <div class="education-content">
                    <h3>${edu.title}</h3>
                    <h4>${edu.institution}</h4>
                    <ul class="education-highlights">
                        ${edu.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                    <div class="education-skills">
                        ${edu.skills.map(skill => `<span class="edu-skill-tag">${skill}</span>`).join('')}
                    </div>
                    <div class="education-actions">
                        <button onclick="editEducation('${edu.id}')" class="action-btn edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteEducation('${edu.id}')" class="action-btn delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};

// Initialize dashboard
async function initializeDashboard() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize modules
        themeManager.init();
        navigation.init();
          // Load initial data
        await Promise.all([
            userProfile.loadUserProfile(),
            analytics.loadStats()
        ]);

        // Load default section - setting projects as default instead of analytics
        await navigation.navigateToSection('projects');

    } catch (error) {
        utils.showMessage('Failed to initialize dashboard', 'error');
        console.error('Dashboard initialization error:', error);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Only the event listener in the initialization script section should run
// document.addEventListener('DOMContentLoaded', initializeDashboard);

async function editSkill(id) {
    try {
        const response = await utils.fetchWithAuth(`/api/skills/${id}`);
        const skill = response.skill;
        
        // Open modal and populate form
        const modal = document.getElementById('skill-modal');
        const form = modal.querySelector('form');
        
        if (form) {
            form.elements.name.value = skill.name;
            form.elements.category.value = skill.category;
            form.elements.icon.value = skill.icon;
            form.elements.level.value = skill.level;
            form.elements.description.value = skill.description;
            form.elements.tags.value = skill.tags.join(', ');
            form.dataset.editId = id;
        }
        
        // Show modal
        modal.style.display = 'block';
    } catch (error) {
        utils.showMessage('Failed to load skill details', 'error');
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            delete form.dataset.editId;
            
            // Reset modal title for add mode
            const title = modal.querySelector('.modal-header h2');
            if (title) {
                if (modalId === 'project-modal') {
                    title.innerHTML = '<i class="fas fa-plus"></i> Add Project';
                } else if (modalId === 'skill-modal') {
                    title.innerHTML = '<i class="fas fa-plus"></i> Add Skill';
                }
            }
        }
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

async function deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
        await utils.fetchWithAuth(`/api/skills/${id}`, { method: 'DELETE' });
        utils.showMessage('Skill deleted successfully', 'success');
        navigation.loadSectionContent('skills');
    } catch (error) {
        utils.showMessage('Failed to delete skill', 'error');
    }
}

// Initialize form handlers
document.getElementById('skill-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

    try {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            category: formData.get('category'),
            icon: formData.get('icon'),
            level: parseInt(formData.get('level')),
            description: formData.get('description'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean)
        };

        if (editId) {
            await utils.fetchWithAuth(`/api/skills/${editId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            utils.showMessage('Skill updated successfully', 'success');
        } else {
            await utils.fetchWithAuth('/api/skills', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            utils.showMessage('Skill added successfully', 'success');
        }

        // Reset form and close modal
        form.reset();
        delete form.dataset.editId;
        closeModal('skill-modal');
        
        // Reload skills section
        await navigation.loadSectionContent('skills');
    } catch (error) {
        utils.showMessage(error.message || 'Failed to save skill', 'error');
    }
});

// Add range input handler for level display
document.getElementById('level')?.addEventListener('input', (e) => {
    const output = e.target.nextElementSibling;
    if (output) {
        output.value = `${e.target.value}%`;
    }
});

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            delete form.dataset.editId;
            
            // Reset modal title if editing
            const title = modal.querySelector('.modal-header h2');
            if (title) {
                title.innerHTML = '<i class="fas fa-plus"></i> Add Skill';
            }
        }
        modal.style.display = 'block';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Settings Manager Module
const settingsManager = {
    async loadSettingsSection() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        // Load saved settings or use defaults
        await this.loadSettings();

        // Render settings interface
        contentArea.innerHTML = this.renderSettingsTemplate();

        // Initialize settings controls
        this.initSettingsControls();
    },    async loadSettings() {
        try {
            // Load settings from localStorage or use defaults
            const savedSettings = localStorage.getItem('portfolioSettings');
            if (savedSettings) {
                state.settings = JSON.parse(savedSettings);
            } 
            // We'll use default settings if none found in localStorage
            // No need to show errors in console
        } catch (error) {
            console.error('Error parsing saved settings:', error);
        }
    },

    saveSettings() {
        try {
            localStorage.setItem('portfolioSettings', JSON.stringify(state.settings));
            utils.showMessage('Settings saved successfully', 'success');
            
            // Also save to API if available
            this.saveSettingsToApi().catch(error => {
                console.error('Failed to save settings to API:', error);
            });
        } catch (error) {
            utils.showMessage('Failed to save settings', 'error');
            console.error('Error saving settings:', error);
        }
    },

    async saveSettingsToApi() {
        try {
            await utils.fetchWithAuth('/api/settings', {
                method: 'POST',
                body: state.settings
            });
        } catch (error) {
            console.error('API settings save error:', error);
            throw error;
        }
    },    // Helper function to create tooltip HTML
    createTooltip(text) {
        return `
            <span class="tooltip-icon">
                <i class="fas fa-info-circle"></i>
                <span class="tooltip-content">${text}</span>
            </span>
        `;
    },
    
    renderSettingsTemplate() {
        const { theme, maintenanceMode, errorHandling, seo, social, contentVisibility, performance } = state.settings;
        
        return `
            <div class="settings-container">                <div class="section-header">
                    <h2>Website Settings</h2>
                    <div class="settings-actions">
                        <button id="refresh-settings" class="action-btn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <button id="save-settings" class="save-settings-btn">
                            <i class="fas fa-save"></i> Save Settings
                        </button>
                    </div>
                </div>
                
                <div class="settings-tabs">
                    <button class="tab-button active" data-tab="general">General</button>
                    <button class="tab-button" data-tab="maintenance">Maintenance</button>
                    <button class="tab-button" data-tab="seo">SEO & Meta</button>
                    <button class="tab-button" data-tab="social">Social Media</button>
                    <button class="tab-button" data-tab="advanced">Advanced</button>
                </div>
                
                <div class="settings-tab-content" id="general-tab" style="display: block;">
                    <div class="settings-grid">
                        <!-- Theme Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-palette"></i>
                                <h3>Theme Settings</h3>
                            </div>
                            <div class="settings-card-body">                                <div class="setting-group">
                                    <div class="setting-label-container">
                                        <label>Theme Mode</label>
                                        ${this.createTooltip("Switch between dark and light themes for your portfolio. Dark theme uses a sleek black background, while light theme provides a cleaner, brighter experience.")}
                                    </div>
                                    <div class="theme-selector">
                                        <button class="theme-option ${theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                            <i class="fas fa-moon"></i>
                                            <span>Dark</span>
                                        </button>
                                        <button class="theme-option ${theme === 'light' ? 'active' : ''}" data-theme="light">
                                            <i class="fas fa-sun"></i>
                                            <span>Light</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Content Visibility Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-eye"></i>
                                <h3>Content Visibility</h3>
                            </div>
                            <div class="settings-card-body">
                                <div class="setting-group">                                <div class="setting-toggle">
                                        <div class="setting-label-container">
                                            <label>Show Projects Section</label>
                                            ${this.createTooltip("Controls the visibility of your projects section on your portfolio website. When disabled, visitors won't see your projects but the data remains intact.")}
                                        </div>
                                        <label class="switch">
                                            <input type="checkbox" id="show-projects-toggle" 
                                                ${contentVisibility.showProjects ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Show Skills Section</label>
                                        <label class="switch">
                                            <input type="checkbox" id="show-skills-toggle" 
                                                ${contentVisibility.showSkills ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Show Education Section</label>
                                        <label class="switch">
                                            <input type="checkbox" id="show-education-toggle" 
                                                ${contentVisibility.showEducation ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Show Experience Section</label>
                                        <label class="switch">
                                            <input type="checkbox" id="show-experience-toggle" 
                                                ${contentVisibility.showExperience ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Show Contact Section</label>
                                        <label class="switch">
                                            <input type="checkbox" id="show-contact-toggle" 
                                                ${contentVisibility.showContact ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-tab-content" id="maintenance-tab" style="display: none;">
                    <div class="settings-grid">
                        <!-- Maintenance Mode Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-tools"></i>
                                <h3>Maintenance Mode</h3>
                            </div>
                            <div class="settings-card-body">
                                <!-- Contact Form Maintenance -->
                                <div class="setting-group">                                <div class="setting-toggle">
                                        <div class="setting-label-container">
                                            <label>Contact Form</label>
                                            ${this.createTooltip("Enables maintenance mode for your contact form. When enabled, visitors will see your custom maintenance message instead of the contact form, but can still reach you via the alternative contact methods shown.")}
                                        </div>
                                        <label class="switch">
                                            <input type="checkbox" id="contact-maintenance-toggle" 
                                                ${maintenanceMode.contact.enabled ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details ${maintenanceMode.contact.enabled ? 'active' : ''}">
                                        <label for="contact-maintenance-message">Maintenance Message</label>
                                        <textarea id="contact-maintenance-message" rows="3">${maintenanceMode.contact.message}</textarea>
                                        <div class="maintenance-preview">
                                            <button id="preview-contact-maintenance" class="preview-btn">
                                                <i class="fas fa-eye"></i> Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Portfolio Maintenance -->
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Portfolio Section</label>
                                        <label class="switch">
                                            <input type="checkbox" id="portfolio-maintenance-toggle" 
                                                ${maintenanceMode.portfolio.enabled ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details ${maintenanceMode.portfolio.enabled ? 'active' : ''}">
                                        <label for="portfolio-maintenance-message">Maintenance Message</label>
                                        <textarea id="portfolio-maintenance-message" rows="3">${maintenanceMode.portfolio.message}</textarea>
                                        <div class="maintenance-preview">
                                            <button id="preview-portfolio-maintenance" class="preview-btn">
                                                <i class="fas fa-eye"></i> Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Skills Maintenance -->
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Skills Section</label>
                                        <label class="switch">
                                            <input type="checkbox" id="skills-maintenance-toggle" 
                                                ${maintenanceMode.skills.enabled ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details ${maintenanceMode.skills.enabled ? 'active' : ''}">
                                        <label for="skills-maintenance-message">Maintenance Message</label>
                                        <textarea id="skills-maintenance-message" rows="3">${maintenanceMode.skills.message}</textarea>
                                        <div class="maintenance-preview">
                                            <button id="preview-skills-maintenance" class="preview-btn">
                                                <i class="fas fa-eye"></i> Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-calendar-times"></i>
                                <h3>Scheduled Maintenance</h3>
                            </div>
                            <div class="settings-card-body">
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Schedule Maintenance</label>
                                        <label class="switch">
                                            <input type="checkbox" id="scheduled-maintenance-toggle">
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details">
                                        <div class="setting-row">
                                            <label for="maintenance-start-date">Start Date</label>
                                            <input type="datetime-local" id="maintenance-start-date">
                                        </div>
                                        <div class="setting-row">
                                            <label for="maintenance-end-date">End Date</label>
                                            <input type="datetime-local" id="maintenance-end-date">
                                        </div>
                                        <div class="setting-row">
                                            <label for="maintenance-message">Website-wide Maintenance Message</label>
                                            <textarea id="maintenance-message" rows="3">The website is currently undergoing scheduled maintenance. Please check back later.</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-tab-content" id="seo-tab" style="display: none;">
                    <div class="settings-grid">
                        <!-- SEO Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-search"></i>
                                <h3>SEO Settings</h3>
                            </div>
                            <div class="settings-card-body">                                <div class="setting-group">
                                    <div class="setting-label-container">
                                        <label for="title-prefix">Title Prefix</label>
                                        ${this.createTooltip("This text appears before each page title in browser tabs and search results. Good for branding consistency and SEO. Example: 'Portfolio | Projects' where 'Portfolio | ' is the prefix.")}
                                    </div>
                                    <input type="text" id="title-prefix" value="${seo.titlePrefix}" placeholder="Portfolio | ">
                                    <p class="setting-description">This will be added before page titles.</p>
                                </div>
                                  <div class="setting-group">
                                    <div class="setting-label-container">
                                        <label for="meta-description">Meta Description</label>
                                        ${this.createTooltip("The meta description appears in search engine results below your page title. It's crucial for SEO and click-through rates. Keep it concise, compelling, and include relevant keywords that describe your portfolio.")}
                                    </div>
                                    <textarea id="meta-description" rows="3">${seo.metaDescription}</textarea>
                                    <p class="setting-description">Keep this between 150-160 characters for best results.</p>
                                    <div class="character-counter">
                                        <span id="meta-desc-counter">0</span>/160
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <label for="meta-keywords">Meta Keywords</label>
                                    <input type="text" id="meta-keywords" value="${seo.keywords}" placeholder="portfolio, web development, skills">
                                    <p class="setting-description">Comma-separated keywords for search engines.</p>
                                </div>
                                
                                <div class="setting-group">                                <div class="setting-toggle">
                                        <div class="setting-label-container">
                                            <label>Enable Open Graph</label>
                                            ${this.createTooltip("Open Graph protocol controls how your portfolio appears when shared on social media platforms like Facebook and LinkedIn. When enabled, your links will display with rich previews including images, titles, and descriptions instead of basic links.")}
                                        </div>
                                        <label class="switch">
                                            <input type="checkbox" id="enable-opengraph" 
                                                ${seo.enableOpenGraph ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <p class="setting-description">
                                        Enables rich previews when sharing your website on social media.
                                    </p>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Enable Twitter Cards</label>
                                        <label class="switch">
                                            <input type="checkbox" id="enable-twitter-cards" 
                                                ${seo.enableTwitterCards ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <p class="setting-description">
                                        Enables rich previews when sharing your website on Twitter.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Performance Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-tachometer-alt"></i>
                                <h3>Performance Settings</h3>
                            </div>
                            <div class="settings-card-body">
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Enable Lazy Loading</label>
                                        <label class="switch">
                                            <input type="checkbox" id="enable-lazy-loading" 
                                                ${performance.enableLazyLoading ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <p class="setting-description">
                                        Loads images and content only when they enter the viewport for faster initial page load.
                                    </p>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Enable Image Optimization</label>
                                        <label class="switch">
                                            <input type="checkbox" id="enable-image-optimization" 
                                                ${performance.enableImageOptimization ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <p class="setting-description">
                                        Automatically optimizes and compresses images for faster loading.
                                    </p>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Enable Code Minification</label>
                                        <label class="switch">
                                            <input type="checkbox" id="enable-code-minification" 
                                                ${performance.enableCodeMinification ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <p class="setting-description">
                                        Minifies HTML, CSS, and JavaScript for faster loading times.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-tab-content" id="social-tab" style="display: none;">
                    <div class="settings-grid">
                        <!-- Social Media Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-share-alt"></i>
                                <h3>Social Media Links</h3>
                            </div>
                            <div class="settings-card-body">
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Show Social Icons</label>
                                        <label class="switch">
                                            <input type="checkbox" id="show-social-icons" 
                                                ${social.showSocialIcons ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="input-with-icon">
                                        <i class="fab fa-github"></i>
                                        <input type="url" id="github-url" value="${social.github}" placeholder="https://github.com/username">
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="input-with-icon">
                                        <i class="fab fa-linkedin"></i>
                                        <input type="url" id="linkedin-url" value="${social.linkedin}" placeholder="https://linkedin.com/in/username">
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="input-with-icon">
                                        <i class="fab fa-twitter"></i>
                                        <input type="url" id="twitter-url" value="${social.twitter}" placeholder="https://twitter.com/username">
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="input-with-icon">
                                        <i class="fab fa-instagram"></i>
                                        <input type="url" id="instagram-url" value="${social.instagram}" placeholder="https://instagram.com/username">
                                    </div>
                                </div>
                                
                                <button id="add-social-link" class="action-btn">
                                    <i class="fas fa-plus"></i> Add Another Platform
                                </button>
                            </div>
                        </div>
                        
                        <!-- Sharing Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-retweet"></i>
                                <h3>Sharing Settings</h3>
                            </div>
                            <div class="settings-card-body">
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Enable Share Buttons</label>
                                        <label class="switch">
                                            <input type="checkbox" id="enable-share-buttons" checked>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <p class="setting-description">
                                        Displays share buttons for visitors to share your content.
                                    </p>
                                </div>
                                
                                <div class="setting-group">
                                    <label>Select Platforms</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-container">
                                            <input type="checkbox" id="share-facebook" checked>
                                            <span class="checkmark"></span>
                                            Facebook
                                        </label>
                                        <label class="checkbox-container">
                                            <input type="checkbox" id="share-twitter" checked>
                                            <span class="checkmark"></span>
                                            Twitter
                                        </label>
                                        <label class="checkbox-container">
                                            <input type="checkbox" id="share-linkedin" checked>
                                            <span class="checkmark"></span>
                                            LinkedIn
                                        </label>
                                        <label class="checkbox-container">
                                            <input type="checkbox" id="share-email">
                                            <span class="checkmark"></span>
                                            Email
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <label for="share-text">Default Share Text</label>
                                    <textarea id="share-text" rows="2">Check out this awesome portfolio!</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-tab-content" id="advanced-tab" style="display: none;">
                    <div class="settings-grid">
                        <!-- Error Handling Settings -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h3>Error Handling</h3>
                            </div>
                            <div class="settings-card-body">
                                <div class="setting-group">                                <div class="setting-toggle">
                                        <div class="setting-label-container">
                                            <label>Show Detailed Errors</label>
                                            ${this.createTooltip("Controls whether visitors see technical error details when something goes wrong. Useful for debugging during development, but should be turned off in production as error details could expose security vulnerabilities or sensitive information about your site structure.")}
                                        </div>
                                        <label class="switch">
                                            <input type="checkbox" id="detailed-errors-toggle" 
                                                ${errorHandling.showDetailedErrors ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details">
                                        <p class="setting-description">
                                            When enabled, detailed error messages will be shown to visitors. 
                                            Turn off in production for security.
                                        </p>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Log Errors</label>
                                        <label class="switch">
                                            <input type="checkbox" id="log-errors-toggle" 
                                                ${errorHandling.logErrors ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details">
                                        <p class="setting-description">
                                            When enabled, all errors will be logged to the server for future reference.
                                        </p>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Error Notifications</label>
                                        <label class="switch">
                                            <input type="checkbox" id="error-notifications-toggle" 
                                                ${errorHandling.errorNotifications ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details">
                                        <p class="setting-description">
                                            When enabled, you'll receive notifications when errors occur on your site.
                                        </p>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-toggle">
                                        <label>Email Error Reports</label>
                                        <label class="switch">
                                            <input type="checkbox" id="error-email-toggle" 
                                                ${errorHandling.errorEmailNotifications ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="setting-details ${errorHandling.errorEmailNotifications ? 'active' : ''}">
                                        <label for="error-email">Notification Email</label>
                                        <input type="email" id="error-email" value="${errorHandling.errorEmail}" placeholder="you@example.com">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Backup & Restore -->
                        <div class="settings-card">
                            <div class="settings-card-header">
                                <i class="fas fa-database"></i>
                                <h3>Backup & Restore</h3>
                            </div>
                            <div class="settings-card-body">                                <div class="setting-group">
                                    <div class="setting-label-container">
                                        <label>Backup Your Settings</label>
                                        ${this.createTooltip("Creates a complete backup of all your portfolio settings and content as a JSON file. This backup can be used to restore your website configuration in case of data loss or when migrating to a new server. Regular backups are recommended.")}
                                    </div>
                                    <button id="create-backup" class="action-btn">
                                        <i class="fas fa-download"></i> Create Backup
                                    </button>
                                    <p class="setting-description">
                                        Downloads a JSON file containing all your website data and settings.
                                    </p>
                                </div>
                                
                                <div class="setting-group">
                                    <label for="restore-backup">Restore from Backup</label>
                                    <div class="file-upload">
                                        <input type="file" id="restore-backup" accept=".json">
                                        <label for="restore-backup" class="file-upload-btn">
                                            <i class="fas fa-upload"></i> Choose Backup File
                                        </label>
                                    </div>
                                    <p class="setting-description warning">
                                        Warning: Restoring from backup will overwrite current settings.
                                    </p>
                                </div>
                                
                                <div class="setting-group danger-zone">
                                    <h4><i class="fas fa-exclamation-circle"></i> Danger Zone</h4>
                                    <button id="reset-all-settings" class="danger-btn">
                                        <i class="fas fa-trash"></i> Reset All Settings
                                    </button>
                                    <p class="setting-description warning">
                                        This will reset all settings to their default values. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },    initSettingsControls() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab button
                document.querySelectorAll('.tab-button').forEach(t => 
                    t.classList.toggle('active', t === tab));
                
                // Show selected tab content, hide others
                const targetTab = tab.dataset.tab;
                document.querySelectorAll('.settings-tab-content').forEach(content => {
                    content.style.display = content.id === `${targetTab}-tab` ? 'block' : 'none';
                });
            });
        });

        // Save button
        document.getElementById('save-settings')?.addEventListener('click', () => {
            try {
                this.updateSettingsFromUI();
                this.saveSettings();
            } catch (error) {
                utils.showMessage(`Error saving settings: ${error.message}`, 'error');
                console.error('Settings save error:', error);
            }
        });

        // Export settings
        document.getElementById('export-settings')?.addEventListener('click', () => {
            this.exportSettings();
        });

        // Import settings
        document.getElementById('import-settings')?.addEventListener('click', () => {
            this.promptImportSettings();
        });

        // Reset settings
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
                this.resetSettings();
            }
        });

        // Create backup
        document.getElementById('create-backup')?.addEventListener('click', () => {
            this.createBackup();
        });

        // Restore from backup
        document.getElementById('restore-backup')?.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.restoreFromBackup(e.target.files[0]);
            }
        });        // Refresh settings button
        document.getElementById('refresh-settings')?.addEventListener('click', () => {
            // Add refresh animation
            const refreshBtn = document.getElementById('refresh-settings');
            refreshBtn.classList.add('refreshing');
            
            // Reload settings from localStorage or defaults
            setTimeout(() => {
                this.loadSettings().then(() => {
                    // Re-render settings template
                    document.getElementById('content-area').innerHTML = this.renderSettingsTemplate();
                    // Re-initialize controls
                    this.initSettingsControls();
                    // Remove animation class
                    refreshBtn.classList.remove('refreshing');
                    utils.showMessage('Settings refreshed successfully', 'success');
                });
            }, 600); // Short delay for animation effect
        });
        
        // Reset all settings (danger zone) with password confirmation
        document.getElementById('reset-all-settings')?.addEventListener('click', () => {
            const password = prompt('Please enter your password to confirm resetting all settings to factory defaults:');
            
            if (password) {
                // In a real app, you'd verify this password against the user's actual password
                // For demo purposes, we'll use a simple check
                if (password === 'admin' || password === state.user?.password) {
                    this.resetAllSettings();
                    utils.showMessage('All settings have been reset to defaults', 'success');
                } else {
                    utils.showMessage('Incorrect password. Settings reset cancelled.', 'error');
                }
            }
        });

        // Theme selector
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                
                // Update UI
                document.querySelectorAll('.theme-option').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.theme === theme);
                });
                
                // Apply theme change immediately
                themeManager.applyTheme(theme);
                
                // Update settings state
                state.settings.theme = theme;
            });
        });

        // Setup toggle switches
        const setupToggle = (toggleId, settingPath) => {
            const toggle = document.getElementById(toggleId);
            if (!toggle) return;
            
            toggle.addEventListener('change', () => {
                const isEnabled = toggle.checked;
                const detailsEl = toggle.closest('.setting-group')?.querySelector('.setting-details');
                
                if (detailsEl) {
                    detailsEl.classList.toggle('active', isEnabled);
                }
                
                // Update the corresponding setting in the state object
                const pathParts = settingPath.split('.');
                let obj = state.settings;
                for (let i = 0; i < pathParts.length - 1; i++) {
                    obj = obj[pathParts[i]];
                }
                obj[pathParts[pathParts.length - 1]] = isEnabled;
            });
        };

        // Set up maintenance toggles
        setupToggle('contact-maintenance-toggle', 'maintenanceMode.contact.enabled');
        setupToggle('portfolio-maintenance-toggle', 'maintenanceMode.portfolio.enabled');
        setupToggle('skills-maintenance-toggle', 'maintenanceMode.skills.enabled');
        
        // Error handling toggles
        setupToggle('detailed-errors-toggle', 'errorHandling.showDetailedErrors');
        setupToggle('log-errors-toggle', 'errorHandling.logErrors');
        setupToggle('error-notifications-toggle', 'errorHandling.errorNotifications');
        setupToggle('error-email-toggle', 'errorHandling.errorEmailNotifications');
        
        // Content visibility toggles
        setupToggle('show-projects-toggle', 'contentVisibility.showProjects');
        setupToggle('show-skills-toggle', 'contentVisibility.showSkills');
        setupToggle('show-education-toggle', 'contentVisibility.showEducation');
        setupToggle('show-experience-toggle', 'contentVisibility.showExperience');
        setupToggle('show-contact-toggle', 'contentVisibility.showContact');
        
        // SEO toggles
        setupToggle('enable-opengraph', 'seo.enableOpenGraph');
        setupToggle('enable-twitter-cards', 'seo.enableTwitterCards');
        
        // Performance toggles
        setupToggle('enable-lazy-loading', 'performance.enableLazyLoading');
        setupToggle('enable-image-optimization', 'performance.enableImageOptimization');
        setupToggle('enable-code-minification', 'performance.enableCodeMinification');
        
        // Social toggles
        setupToggle('show-social-icons', 'social.showSocialIcons');
        
        // Add social link button
        document.getElementById('add-social-link')?.addEventListener('click', () => {
            this.addSocialLinkField();
        });

        // Preview maintenance notices
        document.getElementById('preview-contact-maintenance')?.addEventListener('click', () => {
            const message = document.getElementById('contact-maintenance-message').value;
            this.showMaintenancePreview('Contact Form Maintenance', message);
        });
        
        document.getElementById('preview-portfolio-maintenance')?.addEventListener('click', () => {
            const message = document.getElementById('portfolio-maintenance-message').value;
            this.showMaintenancePreview('Portfolio Maintenance', message);
        });
        
        document.getElementById('preview-skills-maintenance')?.addEventListener('click', () => {
            const message = document.getElementById('skills-maintenance-message').value;
            this.showMaintenancePreview('Skills Maintenance', message);
        });

        // Character counter for meta description
        const metaDesc = document.getElementById('meta-description');
        const metaCounter = document.getElementById('meta-desc-counter');
        if (metaDesc && metaCounter) {
            metaCounter.textContent = metaDesc.value.length;
            metaDesc.addEventListener('input', () => {
                metaCounter.textContent = metaDesc.value.length;
                if (metaDesc.value.length > 160) {
                    metaCounter.classList.add('warning');
                } else {
                    metaCounter.classList.remove('warning');
                }
            });
        }
    },

    updateSettingsFromUI() {
        try {
            // Theme settings already updated on click
            
            // Maintenance messages
            state.settings.maintenanceMode.contact.message = document.getElementById('contact-maintenance-message').value;
            state.settings.maintenanceMode.portfolio.message = document.getElementById('portfolio-maintenance-message').value;
            state.settings.maintenanceMode.skills.message = document.getElementById('skills-maintenance-message').value;
            
            // SEO settings
            state.settings.seo.titlePrefix = document.getElementById('title-prefix').value;
            state.settings.seo.metaDescription = document.getElementById('meta-description').value;
            state.settings.seo.keywords = document.getElementById('meta-keywords').value;
            
            // Social media URLs
            state.settings.social.github = document.getElementById('github-url').value;
            state.settings.social.linkedin = document.getElementById('linkedin-url').value;
            state.settings.social.twitter = document.getElementById('twitter-url').value;
            state.settings.social.instagram = document.getElementById('instagram-url').value;
            
            // Error email
            state.settings.errorHandling.errorEmail = document.getElementById('error-email').value;
            
            // Toggle states are updated in real-time via event listeners
            
            // Validate critical settings
            this.validateSettings();
            
        } catch (error) {
            console.error('Error updating settings from UI:', error);
            throw new Error('Failed to update settings from form: ' + error.message);
        }
    },
    
    validateSettings() {
        // Check if error email is valid when notifications are enabled
        if (state.settings.errorHandling.errorEmailNotifications && 
            state.settings.errorHandling.errorEmail &&
            !this.isValidEmail(state.settings.errorHandling.errorEmail)) {
            throw new Error('Please enter a valid email address for error notifications');
        }
        
        // Check meta description length
        if (state.settings.seo.metaDescription && state.settings.seo.metaDescription.length > 160) {
            utils.showMessage('Meta description exceeds recommended 160 characters', 'warning');
        }
        
        // Validate URLs
        const urlFields = [
            { name: 'GitHub URL', value: state.settings.social.github },
            { name: 'LinkedIn URL', value: state.settings.social.linkedin },
            { name: 'Twitter URL', value: state.settings.social.twitter },
            { name: 'Instagram URL', value: state.settings.social.instagram }
        ];
        
        for (const field of urlFields) {
            if (field.value && !this.isValidURL(field.value)) {
                throw new Error(`Invalid ${field.name}: ${field.value}`);
            }
        }
    },
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },

    showMaintenancePreview(message) {
        const popup = document.createElement('div');
        popup.className = 'apology-popup';
        popup.innerHTML = `
            <div class="apology-content">
                <div class="apology-header">
                    <i class="fas fa-tools"></i>
                    <h3>Maintenance Notice</h3>
                </div>
                <p>${message}</p>
                <p>Please reach out to me directly at:</p>
                <div class="contact-alternatives">
                    <a href="mailto:ossamahattan@gmail.com" class="alt-contact">
                        <i class="fas fa-envelope"></i>
                        ossamahattan@gmail.com
                    </a>
                    <a href="https://www.linkedin.com/in/h-oussama/" target="_blank" class="alt-contact">
                        <i class="fab fa-linkedin"></i>
                        LinkedIn
                    </a>
                </div>
                <button class="close-popup">Close Preview</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Add animation class after a small delay
        setTimeout(() => popup.classList.add('show'), 10);

        // Close button handler
        const closeBtn = popup.querySelector('.close-popup');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        });
    }
};

async function editProject(id) {
    try {
        const response = await utils.fetchWithAuth(`/api/projects/${id}`);
        // Fix: The API might return the project directly rather than nested in a 'project' property
        const project = response.project || response;
        
        if (!project) {
            throw new Error('Project data not found');
        }
        
        // Open modal and populate form
        const modal = document.getElementById('project-modal');
        const form = modal.querySelector('form');
        
        if (form) {
            // Set the title of the modal to indicate editing mode
            const modalTitle = modal.querySelector('.modal-header h2');
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Project';
            }
            
            // Populate form fields
            form.elements.title.value = project.title || '';
            form.elements.description.value = project.description || '';
            form.elements.technologies.value = Array.isArray(project.technologies) ? project.technologies.join(', ') : '';
            form.elements.image.value = project.image || '';
            form.elements.githubLink.value = project.githubLink || '';
            form.elements.liveLink.value = project.liveLink || '';
            form.dataset.editId = id;
        }
        
        // Show modal
        modal.style.display = 'block';
    } catch (error) {
        utils.showMessage('Failed to load project details', 'error');
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        await utils.fetchWithAuth(`/api/projects/${id}`, { method: 'DELETE' });
        utils.showMessage('Project deleted successfully', 'success');
        navigation.loadSectionContent('projects');
    } catch (error) {
        utils.showMessage('Failed to delete project', 'error');
    }
}

// Initialize project form handler
document.addEventListener('DOMContentLoaded', function() {
    const projectForm = document.getElementById('project-form');
    
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const editId = form.dataset.editId;
            
            try {
                utils.showLoading();
                
                // Validate form
                const title = form.elements['title'].value;
                const description = form.elements['description'].value;
                const technologiesStr = form.elements['technologies'].value;
                const image = form.elements['image'].value;
                const githubLink = form.elements['githubLink'].value;
                const liveLink = form.elements['liveLink'].value;
                
                if (!title || !description || !technologiesStr || !image || !githubLink || !liveLink) {
                    throw new Error('All fields are required');
                }
                
                const technologies = technologiesStr.split(',').map(tech => tech.trim()).filter(Boolean);
                if (technologies.length === 0) {
                    throw new Error('At least one technology is required');
                }
                
                const data = {
                    title,
                    description,
                    technologies,
                    image,
                    githubLink,
                    liveLink
                };
                
                if (editId) {
                    await utils.fetchWithAuth(`/api/projects/${editId}`, {
                        method: 'PUT',
                        body: data
                    });
                    utils.showMessage('Project updated successfully', 'success');
                } else {
                    await utils.fetchWithAuth('/api/projects', {
                        method: 'POST',
                        body: data
                    });
                    utils.showMessage('Project added successfully', 'success');
                }
                
                // Reset form and close modal
                form.reset();
                delete form.dataset.editId;
                closeModal('project-modal');
                
                // Reload projects section
                await navigation.navigateToSection('projects');
                
            } catch (error) {
                utils.showMessage(error.message || 'Failed to save project', 'error');
            } finally {
                utils.hideLoading();
            }
        });
    }
});