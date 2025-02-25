// Dashboard functionality
let projects = [];
let education = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        initializeParticleBackground();
        await initializeDashboard();
        setupSidebarNavigation();
        setupFormHandlers();
        setupImagePreviews();
    } catch (error) {
        showMessage('Error connecting to server. Please ensure the server is running and MongoDB is installed.', 'error');
        console.error('Dashboard initialization error:', error);
    }
});

// Initialize dashboard data and counters
async function initializeDashboard() {
    try {
        const [projects, education, technologies] = await Promise.all([
            loadProjects(),
            loadEducation(),
            fetch('/api/technologies').then(r => r.json())
        ]);
        
        // Update sidebar counters
        updateSidebarCounter('projects', projects.length);
        updateSidebarCounter('education', education.length);
        updateSidebarCounter('technologies', technologies.length);
        
        // Show technologies section by default
        showSection('technologies');
        loadDashboardContent('technologies');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showMessage('Failed to load dashboard data', 'error');
    }
}

// Sidebar navigation
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('href').substring(1);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show selected section
            showSection(sectionId);
        });
    });
}

// Show/hide sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
}

// Update sidebar counters
function updateSidebarCounter(type, count) {
    const counter = document.querySelector(`[href="#${type}"] .item-count`);
    if (counter) {
        counter.textContent = count;
        // Add animation class
        counter.classList.add('counter-update');
        setTimeout(() => counter.classList.remove('counter-update'), 500);
    }
}

// Counter Animation
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 30; // Divide animation into 30 steps
    const duration = 1000; // 1 second animation
    const stepTime = duration / 30;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            setTimeout(updateCounter, stepTime);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

// Project Management
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        projects = await response.json();
        displayProjects(projects);
        return projects;
    } catch (error) {
        showMessage('Failed to load projects', 'error');
        return [];
    }
}

function displayProjects(projects) {
    const projectGrid = document.querySelector('.project-grid');
    projectGrid.innerHTML = projects.map((project, index) => `
        <div class="project-card" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-actions">
                    <a href="${project.githubLink}" class="action-btn github-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-github"></i>
                        GitHub
                    </a>
                    <a href="${project.liveLink}" class="action-btn live-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i>
                        Live
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Education Management with improved error handling
async function loadEducation() {
    try {
        const response = await fetch('/api/education');  // Changed to relative URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        education = await response.json();
        displayEducation(education);
        return education;
    } catch (error) {
        console.error('Error loading education:', error);
        showMessage('Failed to load education entries. Please try again.', 'error');
        return [];
    }
}

function displayEducation(education) {
    const timeline = document.querySelector('.education-timeline');
    timeline.innerHTML = education.map((entry, index) => `
        <div class="timeline-item" data-aos="fade-left" data-aos-delay="${index * 100}">
            <div class="timeline-header">
                <h3>${entry.title}</h3>
                <div class="timeline-actions">
                    <button class="edit-btn" onclick="editEducation(${entry.id})" title="Edit Education">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteEducation(${entry.id})" title="Delete Education">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="institution">${entry.institution}</div>
            <div class="duration">
                <i class="fas fa-calendar"></i>
                ${formatDate(entry.startDate)} - ${formatDate(entry.endDate)}
            </div>
            <p>${entry.description}</p>
        </div>
    `).join('');
}

// Modal Management
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Form Submissions
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        technologies: document.getElementById('project-tech').value.split(',').map(t => t.trim()),
        image: document.getElementById('project-image').files[0] 
            ? await convertToBase64(document.getElementById('project-image').files[0])
            : '',
        githubLink: document.getElementById('github-link').value,
        liveLink: document.getElementById('project-link').value
    };

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Project added successfully', 'success');
            closeModal('project-modal');
            loadProjects();
            e.target.reset();
        } else {
            throw new Error('Failed to add project');
        }
    } catch (error) {
        showMessage('Failed to add project', 'error');
    }
});

document.getElementById('education-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        title: document.getElementById('education-title').value,
        institution: document.getElementById('institution').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        description: document.getElementById('edu-description').value,
        skills: [] // Add skills input field if needed
    };

    try {
        const response = await fetch('/api/education', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Education entry added successfully', 'success');
            closeModal('education-modal');
            loadEducation();
            e.target.reset();
        } else {
            throw new Error('Failed to add education entry');
        }
    } catch (error) {
        showMessage('Failed to add education entry', 'error');
    }
});

// Delete Functions
async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Project deleted successfully', 'success');
            loadProjects();
        } else {
            throw new Error('Failed to delete project');
        }
    } catch (error) {
        showMessage('Failed to delete project', 'error');
    }
}

async function deleteEducation(id) {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    try {
        const response = await fetch(`/api/education/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Education entry deleted successfully', 'success');
            loadEducation();
        } else {
            throw new Error('Failed to delete education entry');
        }
    } catch (error) {
        showMessage('Failed to delete education entry', 'error');
    }
}

// Utility Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });
}

// Enhanced message display
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${text}
    `;
    
    document.querySelector('.dashboard-main').appendChild(message);
    
    // Slide in animation
    requestAnimationFrame(() => {
        message.style.transform = 'translateX(0)';
        message.style.opacity = '1';
    });

    setTimeout(() => {
        message.style.transform = 'translateX(100%)';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

async function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Background Animation
function initializeParticleBackground() {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Ensure canvas fills the viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle configuration
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2; // Increased minimum opacity
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around screen edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize background when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeParticleBackground();
});

// Modal Handlers
function setupModalHandlers() {
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Form submissions with loading states
    setupFormHandlers();
}

function setupFormHandlers() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                await handleFormSubmission(form);
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    closeModal(form.closest('.modal').id);
                }, 1000);
            } catch (error) {
                submitBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1000);
            }
        });
    });
}

// Image preview
function setupImagePreviews() {
    document.getElementById('project-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.querySelector('.preview-image').innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    loadDashboardContent('projects'); // Load projects by default
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            loadDashboardContent(section);
        });
    });
}

// Toggle User Menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('show');
}

// Settings Modal
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'flex';
    loadUserSettings();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Load User Settings
async function loadUserSettings() {
    try {
        const response = await fetch('/api/user/settings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const settings = await response.json();
        
        document.getElementById('new-username').value = settings.username || '';
        document.getElementById('cursor-style').value = settings.cursor || 'default';
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save User Settings
document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const settings = {
        username: document.getElementById('new-username').value,
        cursor: document.getElementById('cursor-style').value
    };

    const password = document.getElementById('new-password').value;
    if (password) {
        settings.password = password;
    }

    try {
        const response = await fetch('/api/user/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            alert('Settings saved successfully');
            closeModal('settings-modal');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        alert(error.message);
    }
});

// Load Dashboard Content
async function loadDashboardContent(section) {
    const contentArea = document.getElementById('content-area');
    try {
        const response = await fetch(`/api/${section}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        let html = '';
        switch(section) {
            case 'projects':
                html = renderProjects(data);
                break;
            case 'education':
                html = renderEducation(data);
                break;
            case 'technologies':
                html = renderTechnologies(data);
                break;
            case 'about':
                html = renderAbout(data);
                break;
        }
        
        contentArea.innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${section}:`, error);
        contentArea.innerHTML = `<div class="error-message">Failed to load ${section}</div>`;
    }
}

// Render Functions
function renderProjects(projects) {
    return `
        <div class="section-header">
            <h2>Projects</h2>
            <button class="add-btn" onclick="openModal('project-modal')">
                <i class="fas fa-plus"></i> Add Project
            </button>
        </div>
        <div class="content-grid">
            ${projects.map(project => `
                <div class="project-card" data-id="${project._id}">
                    <img src="${project.image}" alt="${project.title}">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-actions">
                            <button onclick="editProject('${project._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProject('${project._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderEducation(education) {
    return `
        <div class="section-header">
            <h2>Education</h2>
            <button class="add-btn" onclick="openModal('education-modal')">
                <i class="fas fa-plus"></i> Add Education
            </button>
        </div>
        <div class="timeline">
            ${education.map(edu => `
                <div class="timeline-item" data-id="${edu._id}">
                    <div class="year">${edu.year}</div>
                    <div class="content">
                        <h3>${edu.title}</h3>
                        <h4>${edu.institution}</h4>
                        <ul>
                            ${edu.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                        </ul>
                        <div class="skills">
                            ${edu.skills.map(skill => `<span>${skill}</span>`).join('')}
                        </div>
                        <div class="actions">
                            <button onclick="editEducation('${edu._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteEducation('${edu._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTechnologies(skills) {
    return `
        <div class="section-header">
            <h2>Skills & Technologies</h2>
            <button class="add-btn" onclick="openModal('technology-modal')">
                <i class="fas fa-plus"></i> Add Skill
            </button>
        </div>
        <div class="tech-grid">
            ${skills.map(skill => `
                <div class="tech-card" data-id="${skill.id}">
                    <div class="tech-header">
                        <i class="${skill.icon}"></i>
                        <h3>${skill.name}</h3>
                    </div>
                    <div class="skill-level">
                        <span class="level-label">Proficiency: ${skill.level}%</span>
                        <div class="level-bar">
                            <div class="level-fill" style="width: ${skill.level}%"></div>
                        </div>
                    </div>
                    <div class="tech-tags">
                        ${skill.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="tech-actions">
                        <button onclick="editSkill('${skill.id}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteSkill('${skill.id}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

function renderAbout(about) {
    return `
        <div class="section-header">
            <h2>About</h2>
        </div>
        <div class="about-form">
            <div class="form-group">
                <label>Description</label>
                <textarea id="about-description">${about.description}</textarea>
            </div>
            <div class="stats-group">
                <div class="stat-item">
                    <label>Visitors Count</label>
                    <input type="number" id="visitors-count" value="${about.visitors}">
                </div>
                <div class="stat-item">
                    <label>CV Views</label>
                    <input type="number" id="cv-views" value="${about.cvViews}">
                </div>
            </div>
            <button onclick="saveAbout()" class="save-btn">
                <i class="fas fa-save"></i> Save Changes
            </button>
        </div>
    `;
}

// Logout Function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile')) {
        document.getElementById('userMenu').classList.remove('show');
    }
});

// Technology Management
async function saveTechnology(formData) {
    try {
        const response = await fetch('/api/technologies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...formData,
                keyFeatures: formData.keyFeatures.split('\n').filter(f => f.trim()),
                level: parseInt(formData.level)
            })
        });

        if (!response.ok) throw new Error('Failed to save technology');
        
        const result = await response.json();
        showMessage('Technology added successfully', 'success');
        return result;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

async function editTechnology(id) {
    try {
        const tech = await fetch(`/api/technologies/${id}`).then(r => r.json());
        
        // Populate form
        document.getElementById('tech-category').value = tech.category;
        document.getElementById('tech-name').value = tech.name;
        document.getElementById('tech-icon').value = tech.icon;
        document.getElementById('tech-level').value = tech.level;
        document.getElementById('tech-level').nextElementSibling.value = tech.level;
        document.getElementById('tech-experience').value = tech.experience;
        document.getElementById('tech-description').value = tech.description || '';
        document.getElementById('tech-features').value = (tech.keyFeatures || []).join('\n');
        
        // Update form for edit mode
        const form = document.getElementById('technology-form');
        form.dataset.editId = id;
        document.querySelector('#technology-modal h2').innerHTML = '<i class="fas fa-edit"></i> Edit Technology';
        
        openModal('technology-modal');
    } catch (error) {
        showMessage('Failed to load technology details', 'error');
    }
}

async function deleteTechnology(id) {
    if (!confirm('Are you sure you want to delete this technology?')) return;
    
    try {
        const response = await fetch(`/api/technologies/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete technology');
        
        showMessage('Technology deleted successfully', 'success');
        await loadDashboardContent('technologies');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Update form submission handler
document.getElementById('technology-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const editId = e.target.dataset.editId;
    
    try {
        if (editId) {
            await fetch(`/api/technologies/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    keyFeatures: formData.keyFeatures.split('\n').filter(f => f.trim()),
                    level: parseInt(formData.level)
                })
            });
        } else {
            await saveTechnology(formData);
        }
        
        closeModal('technology-modal');
        e.target.reset();
        delete e.target.dataset.editId;
        await loadDashboardContent('technologies');
    } catch (error) {
        console.error('Error saving technology:', error);
    }
});

document.getElementById('technology-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const editId = e.target.dataset.editId;
    
    try {
        if (editId) {
            await fetch(`/api/technologies/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    keyFeatures: formData.keyFeatures.split('\n').filter(f => f.trim()),
                    level: parseInt(formData.level)
                })
            });
        } else {
            await saveTechnology(formData);
        }
        
        closeModal('technology-modal');
        e.target.reset();
        delete e.target.dataset.editId;
        await loadDashboardContent('technologies');
    } catch (error) {
        console.error('Error saving technology:', error);
    }
});

async function saveSkill(formData) {
    try {
        const tags = formData.tags.split(',').map(t => t.trim());
        const features = formData.features.split('\n').filter(f => f.trim());
        
        const skillData = {
            ...formData,
            tags,
            features,
            level: parseInt(formData.level)
        };

        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id ? `/api/skills/${formData.id}` : '/api/skills';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(skillData)
        });

        if (!response.ok) throw new Error('Failed to save skill');
        
        showMessage('Skill saved successfully', 'success');
        closeModal('technology-modal');
        await loadDashboardContent('technologies');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function editSkill(id) {
    try {
        const skill = await fetch(`/api/skills/${id}`).then(r => r.json());
        
        // Populate form
        document.getElementById('tech-name').value = skill.name;
        document.getElementById('tech-category').value = skill.category;
        document.getElementById('tech-icon').value = skill.icon;
        document.getElementById('tech-level').value = skill.level;
        document.getElementById('tech-level').nextElementSibling.value = skill.level;
        document.getElementById('tech-tags').value = skill.tags.join(', ');
        document.getElementById('tech-description').value = skill.description;
        document.getElementById('tech-features').value = skill.features.join('\n');
        
        // Update form for edit mode
        const form = document.getElementById('technology-form');
        form.dataset.id = id;
        document.querySelector('#technology-modal h2').innerHTML = '<i class="fas fa-edit"></i> Edit Skill';
        
        openModal('technology-modal');
    } catch (error) {
        showMessage('Failed to load skill details', 'error');
    }
}

async function deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
        const response = await fetch(`/api/skills/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete skill');
        
        showMessage('Skill deleted successfully', 'success');
        await loadDashboardContent('technologies');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Add event listener for skill form submission
document.getElementById('technology-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    await saveSkill(formData);
});