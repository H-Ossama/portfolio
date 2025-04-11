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
            const stats = await utils.fetchWithAuth('/stats');
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
            const userData = await utils.fetchWithAuth('/user/settings');
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
    },

    renderProjectCard(project) {
        return `
            <div class="project-card" data-id="${project.id}">
                <div class="project-image">
                    <img src="${project.image || 'assets/images/project-placeholder.jpg'}" alt="${project.title}">
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-technologies">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-actions">
                        <a href="${project.githubLink}" target="_blank" class="action-btn github-btn">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                        <a href="${project.liveLink}" target="_blank" class="action-btn live-btn">
                            <i class="fas fa-external-link-alt"></i> Live
                        </a>
                        <button onclick="editProject('${project.id}')" class="action-btn edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProject('${project.id}')" class="action-btn delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
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

        // Load default section
        await navigation.navigateToSection('analytics');

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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);

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

async function editProject(id) {
    try {
        const response = await utils.fetchWithAuth(`/api/projects/${id}`);
        const project = response.project;
        
        // Open modal and populate form
        const modal = document.getElementById('project-modal');
        const form = modal.querySelector('form');
        
        if (form) {
            form.elements.title.value = project.title;
            form.elements.description.value = project.description;
            form.elements.technologies.value = project.technologies.join(', ');
            form.elements.githubLink.value = project.githubLink;
            form.elements.liveLink.value = project.liveLink;
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
document.getElementById('project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

    try {
        const formData = new FormData(form);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            technologies: formData.get('technologies').split(',').map(tech => tech.trim()).filter(Boolean),
            githubLink: formData.get('githubLink'),
            liveLink: formData.get('liveLink')
        };

        if (formData.get('image').size > 0) {
            const imageData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(formData.get('image'));
            });
            data.image = imageData;
        }

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
        await navigation.loadSectionContent('projects');
    } catch (error) {
        utils.showMessage(error.message || 'Failed to save project', 'error');
    }
});