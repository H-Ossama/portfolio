// Translation Management System for Admin Dashboard
const translationManager = {
    currentLang: 'en',
    supportedLanguages: ['en', 'fr', 'de'], // Update as needed
    selectedSection: null,
    translations: {},
    originalData: {},
    
    async loadTranslationsSection() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        try {
            // Load translations data
            await this.loadTranslationData();
            
            // Render the translations management UI
            contentArea.innerHTML = this.getTranslationsTemplate();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            this.loadSectionData('projects');
        } catch (error) {
            console.error('Failed to load translations section:', error);
            contentArea.innerHTML = '<div class="error-message">Failed to load translations management</div>';
        }
    },
      async loadTranslationData() {
        try {
            // Load translations
            const transResponse = await fetch('/data/translations.json');
            if (!transResponse.ok) throw new Error('Failed to load translations');
            this.translations = await transResponse.json();
            
            // Load original data for reference
            const projects = await fetch('/data/projects.json').then(res => res.ok ? res.json() : []); // Expect array
            const skillsData = await fetch('/data/skills.json').then(res => res.ok ? res.json() : { skills: [] }); // Expect object with skills array
            const education = await fetch('/data/education.json').then(res => res.ok ? res.json() : []) // Expect array
                .catch(() => ([])); // Fallback if not accessible
            
            this.originalData = {
                projects,
                skills: skillsData.skills, // Extract the array
                education,
                about: {} // About content might be embedded in translations already
            };
        } catch (error) {
            console.error('Error loading translation data:', error);
            throw error;
        }
    },
    
    getTranslationsTemplate() {
        return `
            <div class="section-header">
                <h2>Translation Management</h2>
                <div class="header-actions">
                    <select id="lang-selector" class="select-styled">
                        ${this.supportedLanguages.map(lang => 
                            `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>
                                ${lang.toUpperCase()}
                            </option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <div class="translation-container">
                <div class="translation-nav">
                    <button class="trans-nav-btn active" data-section="projects">Projects</button>
                    <button class="trans-nav-btn" data-section="education">Education</button>
                    <button class="trans-nav-btn" data-section="skills">Skills</button>
                    <button class="trans-nav-btn" data-section="about">About</button>
                </div>
                
                <div class="translation-content">
                    <div id="translation-items-container">
                        <!-- Dynamic content will be loaded here -->
                        <div class="loading-spinner">Loading...</div>
                    </div>
                    
                    <div class="translation-actions">
                        <button id="save-translations" class="primary-button">
                            <i class="fas fa-save"></i> Save Translations
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupEventListeners() {
        // Language selector change
        const langSelector = document.getElementById('lang-selector');
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                this.currentLang = e.target.value;
                if (this.selectedSection) {
                    this.loadSectionData(this.selectedSection);
                }
            });
        }
        
        // Section navigation
        const navBtns = document.querySelectorAll('.trans-nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Load section data
                const section = btn.dataset.section;
                this.selectedSection = section;
                this.loadSectionData(section);
            });
        });
        
        // Save button
        const saveBtn = document.getElementById('save-translations');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTranslations());
        }
    },
    
    loadSectionData(section) {
        const container = document.getElementById('translation-items-container');
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '<div class="loading-spinner">Loading...</div>';
        
        // Get the section data based on section type
        setTimeout(() => {
            switch(section) {
                case 'projects':
                    this.renderProjectsTranslation(container);
                    break;
                case 'education':
                    this.renderEducationTranslation(container);
                    break;
                case 'skills':
                    this.renderSkillsTranslation(container);
                    break;
                case 'about':
                    this.renderAboutTranslation(container);
                    break;
                default:
                    container.innerHTML = '<div class="error-message">Unknown section</div>';
            }
        }, 300);
    },
    
    renderProjectsTranslation(container) {
        // Get projects data from translations
        const projects = this.translations[this.currentLang]?.projects || {};
        const originalProjects = this.originalData.projects || [];
        
        let html = `
            <h3>Projects Translations (${this.currentLang.toUpperCase()})</h3>
            <p class="translation-helper">Edit the title and description for each project in the current language.</p>
            <div class="translation-items">
        `;
        
        // Create form fields for each project
        originalProjects.forEach(project => {
            const projectKey = project.id || project.key; // Adapt to your data structure
            const translatedProject = projects[projectKey] || {};
            
            html += `
                <div class="translation-item" data-id="${projectKey}">
                    <div class="item-header">
                        <h4>${project.title || project.name || projectKey}</h4>
                        <div class="item-meta">
                            ${project.image ? `<img src="${project.image}" alt="Project image" class="item-thumbnail">` : ''}
                            <span>ID: ${projectKey}</span>
                        </div>
                    </div>
                    <div class="translation-fields">
                        <div class="field-group">
                            <label for="project-${projectKey}-title">Title:</label>
                            <input 
                                type="text" 
                                id="project-${projectKey}-title" 
                                class="trans-field"
                                data-field="title" 
                                value="${translatedProject.title || ''}"
                            >
                        </div>
                        <div class="field-group">
                            <label for="project-${projectKey}-desc">Description:</label>
                            <textarea 
                                id="project-${projectKey}-desc" 
                                class="trans-field"
                                data-field="description" 
                                rows="3"
                            >${translatedProject.description || ''}</textarea>
                        </div>
                        <!-- Removed read-only fields for technologies and links -->
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    renderEducationTranslation(container) {
        // Get education data from translations
        const education = this.translations[this.currentLang]?.education || {};
        const originalEducation = this.originalData.education || [];
        
        let html = `
            <h3>Education Translations (${this.currentLang.toUpperCase()})</h3>
            <p class="translation-helper">Edit the title, institution and highlights for each education item.</p>
            <div class="translation-items">
        `;
        
        // Identify education items (either from originalData or from translations)
        const eduKeys = Object.keys(education).length > 0 
            ? Object.keys(education) 
            : originalEducation.map(edu => edu.id || edu.key);
            
        eduKeys.forEach(eduKey => {
            const translatedEdu = education[eduKey] || {};
            const originalEdu = originalEducation.find(e => (e.id || e.key) === eduKey) || {};
            
            html += `
                <div class="translation-item" data-id="${eduKey}">
                    <div class="item-header">
                        <h4>${originalEdu.title || eduKey}</h4>
                    </div>
                    <div class="translation-fields">
                        <div class="field-group">
                            <label for="edu-${eduKey}-title">Title:</label>
                            <input 
                                type="text" 
                                id="edu-${eduKey}-title" 
                                class="trans-field"
                                data-field="title" 
                                value="${translatedEdu.title || ''}"
                            >
                        </div>
                        <div class="field-group">
                            <label for="edu-${eduKey}-institution">Institution:</label>
                            <input 
                                type="text" 
                                id="edu-${eduKey}-institution" 
                                class="trans-field"
                                data-field="institution" 
                                value="${translatedEdu.institution || ''}"
                            >
                        </div>
                        <div class="field-group">
                            <label>Highlights:</label>
                            <div class="highlights-container">
                                ${(translatedEdu.highlights || []).map((highlight, idx) => `
                                    <div class="highlight-input-group">
                                        <input 
                                            type="text" 
                                            class="trans-field highlight-field" 
                                            data-field="highlights" 
                                            data-idx="${idx}" 
                                            value="${highlight}"
                                        >
                                        <button type="button" class="icon-btn remove-highlight">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                `).join('')}
                                <button type="button" class="add-highlight-btn" data-edu-key="${eduKey}">
                                    <i class="fas fa-plus"></i> Add Highlight
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Set up event listeners for highlights
        this.setupHighlightsEvents(container);
    },
    
    renderSkillsTranslation(container) {
        // Get skills data from translations
        const skills = this.translations[this.currentLang]?.skills || {};
        const originalSkills = this.originalData.skills || [];
        
        let html = `
            <h3>Skills Translations (${this.currentLang.toUpperCase()})</h3>
            <p class="translation-helper">Edit the name and description for each skill category.</p>
            <div class="translation-items">
        `;
        
        // Identify skill keys (either from originalData or from translations)
        const skillKeys = Object.keys(skills).length > 0 
            ? Object.keys(skills) 
            : originalSkills.map(skill => skill.id || skill.key);
            
        skillKeys.forEach(skillKey => {
            const translatedSkill = skills[skillKey] || {};
            const originalSkill = originalSkills.find(s => (s.id || s.key) === skillKey) || {};
            
            html += `
                <div class="translation-item" data-id="${skillKey}">
                    <div class="item-header">
                        <h4>${originalSkill.name || skillKey}</h4>
                    </div>
                    <div class="translation-fields">
                        <div class="field-group">
                            <label for="skill-${skillKey}-name">Name:</label>
                            <input 
                                type="text" 
                                id="skill-${skillKey}-name" 
                                class="trans-field"
                                data-field="name" 
                                value="${translatedSkill.name || ''}"
                            >
                        </div>
                        <div class="field-group">
                            <label for="skill-${skillKey}-desc">Description:</label>
                            <textarea 
                                id="skill-${skillKey}-desc" 
                                class="trans-field"
                                data-field="description" 
                                rows="3"
                            >${translatedSkill.description || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    renderAboutTranslation(container) {
        // Get about data from translations
        const about = this.translations[this.currentLang]?.about_page || {};
        
        let html = `
            <h3>About Section Translations (${this.currentLang.toUpperCase()})</h3>
            <p class="translation-helper">Edit the about section paragraphs. HTML formatting is allowed.</p>
            <div class="translation-items">
                <div class="translation-item" data-id="about_page">
                    <div class="item-header">
                        <h4>About Content</h4>
                    </div>
                    <div class="translation-fields">
                        <div class="field-group">
                            <label for="about-paragraph1">First Paragraph:</label>
                            <textarea 
                                id="about-paragraph1" 
                                class="trans-field"
                                data-field="paragraph1" 
                                rows="5"
                            >${about.paragraph1 || ''}</textarea>
                            <p class="field-helper">You can use HTML tags like &lt;strong&gt; for formatting.</p>
                        </div>
                        <div class="field-group">
                            <label for="about-paragraph2">Second Paragraph:</label>
                            <textarea 
                                id="about-paragraph2" 
                                class="trans-field"
                                data-field="paragraph2" 
                                rows="5"
                            >${about.paragraph2 || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    setupHighlightsEvents(container) {
        // Add highlight button
        container.querySelectorAll('.add-highlight-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const eduKey = btn.dataset.eduKey;
                const highlightsContainer = btn.closest('.highlights-container');
                const currentHighlights = highlightsContainer.querySelectorAll('.highlight-field');
                const newIndex = currentHighlights.length;
                
                // Create new highlight input
                const newHighlightGroup = document.createElement('div');
                newHighlightGroup.className = 'highlight-input-group';
                newHighlightGroup.innerHTML = `
                    <input 
                        type="text" 
                        class="trans-field highlight-field" 
                        data-field="highlights" 
                        data-idx="${newIndex}" 
                        value=""
                    >
                    <button type="button" class="icon-btn remove-highlight">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Insert before the add button
                highlightsContainer.insertBefore(newHighlightGroup, btn);
                
                // Setup remove event for the new highlight
                this.setupRemoveHighlight(newHighlightGroup.querySelector('.remove-highlight'));
            });
        });
        
        // Remove highlight buttons
        container.querySelectorAll('.remove-highlight').forEach(btn => {
            this.setupRemoveHighlight(btn);
        });
    },
    
    setupRemoveHighlight(btn) {
        btn.addEventListener('click', () => {
            const inputGroup = btn.closest('.highlight-input-group');
            const highlightsContainer = inputGroup.closest('.highlights-container');
            
            // Remove the input group
            inputGroup.remove();
            
            // Update the indices for remaining highlights
            highlightsContainer.querySelectorAll('.highlight-field').forEach((field, idx) => {
                field.dataset.idx = idx;
            });
        });
    },
    
    async saveTranslations() {
        if (!this.selectedSection) return;
        
        try {
            // Show loading state
            const saveBtn = document.getElementById('save-translations');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;
            
            // Get the current section's translations
            const translationData = this.collectTranslationData();
            
            // Send to server
            const response = await fetch('/api/translations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    language: this.currentLang,
                    section: this.selectedSection,
                    data: translationData
                })
            });
            
            if (!response.ok) throw new Error('Failed to save translations');
            
            // Show success
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }, 2000);
            
            // Update local translations data
            await this.loadTranslationData();
            
        } catch (error) {
            console.error('Error saving translations:', error);
            utils.showMessage('Failed to save translations', 'error');
            
            // Reset button
            const saveBtn = document.getElementById('save-translations');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Translations';
                saveBtn.disabled = false;
            }
        }
    },
    
    collectTranslationData() {
        const container = document.getElementById('translation-items-container');
        if (!container) return {};
        
        const data = {};
        
        // Process each translation item
        container.querySelectorAll('.translation-item').forEach(item => {
            const itemId = item.dataset.id;
            data[itemId] = {};
            
            // Get regular fields (inputs and textareas)
            item.querySelectorAll('.trans-field:not(.highlight-field)').forEach(field => {
                const fieldName = field.dataset.field;
                data[itemId][fieldName] = field.value;
            });
            
            // Process highlight fields separately to collect them as arrays
            const highlightFields = item.querySelectorAll('.highlight-field');
            if (highlightFields.length > 0) {
                data[itemId]['highlights'] = Array.from(highlightFields)
                    .sort((a, b) => parseInt(a.dataset.idx) - parseInt(b.dataset.idx))
                    .map(field => field.value);
            }
        });
        
        return data;
    }
};

// Register this manager in the dashboard modules if it exists
if (typeof dashboardModules !== 'undefined') {
    dashboardModules.translations = translationManager;
}
