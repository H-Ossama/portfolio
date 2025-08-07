// Personal Info Management for AI Chat
class PersonalInfoManager {
    constructor() {
        this.personalInfo = null;
        this.init();
    }

    init() {
        this.loadPersonalInfo();
    }

    async loadPersonalInfo() {
        try {
            const response = await fetch('/api/personal-info');
            if (response.ok) {
                this.personalInfo = await response.json();
                this.renderSection();
            }
        } catch (error) {
            console.error('Error loading personal info:', error);
            this.renderSection();
        }
    }

    renderSection() {
        return `
            <div class="dashboard-section">
                <div class="section-header">
                    <h2><i class="fas fa-robot"></i> AI Personal Information</h2>
                    <p>Manage the information that your AI assistant uses to answer questions about you</p>
                </div>

                <div class="personal-info-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="pi-name">Full Name</label>
                            <input type="text" id="pi-name" value="${this.personalInfo?.name || ''}" placeholder="Your full name">
                        </div>
                        <div class="form-group">
                            <label for="pi-profession">Profession</label>
                            <input type="text" id="pi-profession" value="${this.personalInfo?.profession || ''}" placeholder="Your job title">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="pi-experience">Experience</label>
                            <input type="text" id="pi-experience" value="${this.personalInfo?.experience || ''}" placeholder="e.g., 5+ years">
                        </div>
                        <div class="form-group">
                            <label for="pi-location">Location</label>
                            <input type="text" id="pi-location" value="${this.personalInfo?.location || ''}" placeholder="City, Country">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="pi-age">Age</label>
                            <input type="number" id="pi-age" value="${this.personalInfo?.age || ''}" placeholder="Your current age" min="18" max="100">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="pi-education-level">Education Level</label>
                            <select id="pi-education-level">
                                <option value="">Select education level</option>
                                <option value="High School" ${this.personalInfo?.educationLevel === 'High School' ? 'selected' : ''}>High School</option>
                                <option value="Associate Degree" ${this.personalInfo?.educationLevel === 'Associate Degree' ? 'selected' : ''}>Associate Degree</option>
                                <option value="Bachelor's Degree" ${this.personalInfo?.educationLevel === 'Bachelor\'s Degree' ? 'selected' : ''}>Bachelor's Degree</option>
                                <option value="Master's Degree" ${this.personalInfo?.educationLevel === 'Master\'s Degree' ? 'selected' : ''}>Master's Degree</option>
                                <option value="PhD" ${this.personalInfo?.educationLevel === 'PhD' ? 'selected' : ''}>PhD</option>
                                <option value="Bootcamp" ${this.personalInfo?.educationLevel === 'Bootcamp' ? 'selected' : ''}>Coding Bootcamp</option>
                                <option value="Self-taught" ${this.personalInfo?.educationLevel === 'Self-taught' ? 'selected' : ''}>Self-taught</option>
                                <option value="Certification" ${this.personalInfo?.educationLevel === 'Certification' ? 'selected' : ''}>Professional Certification</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="pi-years-coding">Years of Coding</label>
                            <input type="number" id="pi-years-coding" value="${this.personalInfo?.yearsCoding || ''}" placeholder="Total years coding" min="0" max="50">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="pi-education">Education Details</label>
                        <textarea id="pi-education" rows="2" placeholder="Your educational background">${this.personalInfo?.education || ''}</textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="pi-current-role">Current Role</label>
                            <input type="text" id="pi-current-role" value="${this.personalInfo?.currentRole || ''}" placeholder="e.g., Senior Backend Developer">
                        </div>
                        <div class="form-group">
                            <label for="pi-company">Current Company</label>
                            <input type="text" id="pi-company" value="${this.personalInfo?.company || ''}" placeholder="Company name (or Freelance)">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="pi-skills">Skills (comma-separated)</label>
                        <textarea id="pi-skills" rows="3" placeholder="Node.js, Python, React, etc.">${this.personalInfo?.skills?.join(', ') || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="pi-certifications">Certifications</label>
                        <textarea id="pi-certifications" rows="2" placeholder="Professional certifications you hold">${this.personalInfo?.certifications || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="pi-work-experience">Work Experience</label>
                        <textarea id="pi-work-experience" rows="4" placeholder="Brief description of your work history and key roles">${this.personalInfo?.workExperience || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="pi-achievements">Key Achievements</label>
                        <textarea id="pi-achievements" rows="3" placeholder="Your major accomplishments, awards, or notable projects">${this.personalInfo?.achievements || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="pi-languages">Languages (comma-separated)</label>
                        <input type="text" id="pi-languages" value="${this.personalInfo?.languages?.join(', ') || ''}" placeholder="English, Arabic, French">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="pi-projects">Projects</label>
                            <input type="text" id="pi-projects" value="${this.personalInfo?.projects || ''}" placeholder="e.g., 15+ completed projects">
                        </div>
                        <div class="form-group">
                            <label for="pi-specialization">Specialization</label>
                            <input type="text" id="pi-specialization" value="${this.personalInfo?.specialization || ''}" placeholder="Your area of expertise">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="pi-personality">Personality & Traits</label>
                        <textarea id="pi-personality" rows="2" placeholder="Describe your personality and work style">${this.personalInfo?.personality || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="pi-additional">Additional Information</label>
                        <textarea id="pi-additional" rows="4" placeholder="Any additional information you want the AI to know about you (achievements, interests, goals, etc.)">${this.personalInfo?.additionalInfo || ''}</textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-primary" onclick="personalInfoManager.savePersonalInfo()">
                            <i class="fas fa-save"></i> Save Information
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="personalInfoManager.testAIConnection()">
                            <i class="fas fa-wifi"></i> Test AI Connection
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="personalInfoManager.testAI()">
                            <i class="fas fa-robot"></i> Test AI Response
                        </button>
                    </div>
                </div>

                <div class="ai-preview" id="ai-preview" style="display: none;">
                    <h3><i class="fas fa-eye"></i> AI Response Preview</h3>
                    <div class="ai-preview-content" id="ai-preview-content">
                        <!-- AI response will be shown here -->
                    </div>
                </div>
            </div>
        `;
    }

    async savePersonalInfo() {
        const personalInfo = {
            name: document.getElementById('pi-name').value,
            profession: document.getElementById('pi-profession').value,
            experience: document.getElementById('pi-experience').value,
            location: document.getElementById('pi-location').value,
            age: parseInt(document.getElementById('pi-age').value) || null,
            educationLevel: document.getElementById('pi-education-level').value,
            yearsCoding: parseInt(document.getElementById('pi-years-coding').value) || null,
            education: document.getElementById('pi-education').value,
            currentRole: document.getElementById('pi-current-role').value,
            company: document.getElementById('pi-company').value,
            skills: document.getElementById('pi-skills').value.split(',').map(s => s.trim()).filter(s => s),
            certifications: document.getElementById('pi-certifications').value,
            workExperience: document.getElementById('pi-work-experience').value,
            achievements: document.getElementById('pi-achievements').value,
            languages: document.getElementById('pi-languages').value.split(',').map(s => s.trim()).filter(s => s),
            projects: document.getElementById('pi-projects').value,
            specialization: document.getElementById('pi-specialization').value,
            personality: document.getElementById('pi-personality').value,
            additionalInfo: document.getElementById('pi-additional').value
        };

        try {
            const response = await fetch('/api/personal-info', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin' // Simple auth - replace with proper auth
                },
                body: JSON.stringify(personalInfo)
            });

            if (response.ok) {
                this.personalInfo = personalInfo;
                this.showMessage('Personal information saved successfully!', 'success');
            } else {
                throw new Error('Failed to save personal information');
            }
        } catch (error) {
            console.error('Error saving personal info:', error);
            this.showMessage('Error saving personal information. Please try again.', 'error');
        }
    }

    async testAIConnection() {
        const preview = document.getElementById('ai-preview');
        const content = document.getElementById('ai-preview-content');
        
        preview.style.display = 'block';
        content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Testing AI connection...</div>';

        const startTime = Date.now();

        try {
            // Simple connection test with minimal payload
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDRXEHvUO5wMETMcyMzWF7gEQY4iIKKK6M', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Hello, please respond with 'Connection successful!'"
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 10,
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiResponse = data.candidates[0].content.parts[0].text;
                
                content.innerHTML = `
                    <div class="connection-test-success">
                        <div class="test-status">
                            <i class="fas fa-check-circle"></i>
                            <strong>Connection Status:</strong> ✅ Connected Successfully
                        </div>
                        <div class="test-details">
                            <strong>API Response:</strong><br>
                            "${aiResponse}"
                        </div>
                        <div class="test-info">
                            <strong>API Endpoint:</strong> Google Gemini 2.0 Flash<br>
                            <strong>Response Time:</strong> ${Date.now() - startTime}ms<br>
                            <strong>Status:</strong> Ready for AI chat
                        </div>
                    </div>
                `;
                
                this.showMessage('AI connection test successful!', 'success');
            } else {
                throw new Error(`API connection failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error testing AI connection:', error);
            content.innerHTML = `
                <div class="connection-test-error">
                    <div class="test-status">
                        <i class="fas fa-times-circle"></i>
                        <strong>Connection Status:</strong> ❌ Connection Failed
                    </div>
                    <div class="test-details">
                        <strong>Error:</strong><br>
                        ${error.message}
                    </div>
                    <div class="test-troubleshoot">
                        <strong>Troubleshooting Tips:</strong>
                        <ul>
                            <li>Check your internet connection</li>
                            <li>Verify the API key is valid</li>
                            <li>Check if the Gemini API service is available</li>
                            <li>Try again in a few moments</li>
                        </ul>
                    </div>
                </div>
            `;
            
            this.showMessage('AI connection test failed. Check the preview for details.', 'error');
        }
    }

    async testAI() {
        const preview = document.getElementById('ai-preview');
        const content = document.getElementById('ai-preview-content');
        
        preview.style.display = 'block';
        content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Testing AI response...</div>';

        try {
            // Create a test prompt
            const testPrompt = "Tell me about your background and experience as a developer.";
            
            // Create system prompt
            const systemPrompt = this.createSystemPrompt();
            const fullPrompt = `${systemPrompt}\n\nPotential employer/evaluator asks: "${testPrompt}"\n\nRespond as ${this.personalInfo?.name || 'yourself'} in a professional, confident manner suitable for a portfolio evaluation.`;

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDRXEHvUO5wMETMcyMzWF7gEQY4iIKKK6M', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 300,
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiResponse = data.candidates[0].content.parts[0].text;
                
                content.innerHTML = `
                    <div class="test-question">
                        <strong>Test Question:</strong> "${testPrompt}"
                    </div>
                    <div class="test-response">
                        <strong>AI Response:</strong><br>
                        ${aiResponse}
                    </div>
                `;
            } else {
                throw new Error('AI test failed');
            }
        } catch (error) {
            console.error('Error testing AI:', error);
            content.innerHTML = '<div class="error">Error testing AI. Please check your information and try again.</div>';
        }
    }

    createSystemPrompt() {
        return `You are ${this.personalInfo?.name || 'a developer'}. Here's your personal information:

Name: ${this.personalInfo?.name || 'Not specified'}
Age: ${this.personalInfo?.age || 'Not specified'}
Profession: ${this.personalInfo?.profession || 'Not specified'}
Current Role: ${this.personalInfo?.currentRole || 'Not specified'}
Company: ${this.personalInfo?.company || 'Not specified'}
Experience: ${this.personalInfo?.experience || 'Not specified'}
Years of Coding: ${this.personalInfo?.yearsCoding || 'Not specified'}
Education Level: ${this.personalInfo?.educationLevel || 'Not specified'}
Education Details: ${this.personalInfo?.education || 'Not specified'}
Certifications: ${this.personalInfo?.certifications || 'Not specified'}
Location: ${this.personalInfo?.location || 'Not specified'}
Languages: ${this.personalInfo?.languages?.join(', ') || 'Not specified'}
Skills: ${this.personalInfo?.skills?.join(', ') || 'Not specified'}
Work Experience: ${this.personalInfo?.workExperience || 'Not specified'}
Key Achievements: ${this.personalInfo?.achievements || 'Not specified'}
Projects: ${this.personalInfo?.projects || 'Not specified'}
Specialization: ${this.personalInfo?.specialization || 'Not specified'}
Personality: ${this.personalInfo?.personality || 'Not specified'}

Additional Information: ${this.personalInfo?.additionalInfo || 'No additional information provided.'}

Instructions:
- You are being evaluated by potential employers, CEOs, clients, or recruiters visiting your portfolio
- Always respond in first person as if you ARE this person
- Be highly professional, confident, and articulate
- Show expertise and knowledge without being boastful
- Answer questions about your background, experience, and capabilities
- Never ask "How can I help you?" or act like customer service
- Don't offer services or ask what they need - they are evaluating YOU
- Be concise but comprehensive in your responses
- Show enthusiasm for technology and your work
- Demonstrate your professionalism and competence through your communication style
- If greeted, respond professionally and wait for their questions
- Remember: You are the one being evaluated, not the one providing services`;
    }

    showMessage(text, type) {
        // Create message element (assuming there's a message system in dashboard)
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            const message = document.createElement('div');
            message.className = `message message-${type}`;
            message.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${text}</span>
                <button onclick="this.parentElement.remove()" class="message-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            messageContainer.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 5000);
        }
    }
}

// Initialize when dashboard loads
let personalInfoManager;

// Make PersonalInfoManager available globally
window.PersonalInfoManager = PersonalInfoManager;
