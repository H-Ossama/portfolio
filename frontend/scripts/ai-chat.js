// AI Chat Feature
class AIChat {
    constructor() {
        this.apiKey = 'AIzaSyDRXEHvUO5wMETMcyMzWF7gEQY4iIKKK6M';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.chatBox = document.getElementById('aiChatBox');
        this.messages = document.getElementById('aiMessages');
        this.input = document.getElementById('aiInput');
        this.sendBtn = document.getElementById('aiSendBtn');
        this.toggleBtn = document.getElementById('aiToggleBtn');
        this.isOpen = false;
        
        this.personalInfo = null;
        this.loadPersonalInfo();
        this.init();
    }

    async loadPersonalInfo() {
        try {
            const response = await fetch(config.getApiPath('/api/personal-info'));
            if (response.ok) {
                this.personalInfo = await response.json();
            }
        } catch (error) {
            console.log('Personal info not loaded, using default profile');
            this.personalInfo = {
                name: "Oussama Hattan",
                profession: "Backend Developer",
                experience: "3+ years",
                education: "Bachelor's in Web Development, Full Stack Engineering Bootcamp certification from ALX",
                skills: ["Node.js", "Python", "JavaScript", "PHP", "MySQL", "MongoDB", "Docker", "AWS"],
                location: "Azrou, Morocco",
                languages: ["Arabic", "French", "English"],
                projects: "15+ completed projects",
                specialization: "Backend development, API design, database optimization",
                personality: "Passionate about technology, continuous learner, problem solver"
            };
        }
    }

    init() {
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Header click to toggle (but not the toggle button itself)
        document.querySelector('.ai-chat-header').addEventListener('click', (e) => {
            // Don't toggle if clicking on the toggle button
            if (!e.target.closest('.ai-toggle-btn')) {
                this.toggleChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatBox.classList.toggle('active', this.isOpen);
        
        const icon = this.toggleBtn.querySelector('i');
        icon.className = this.isOpen ? 'fas fa-times' : 'fas fa-comment';
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // Disable input
        this.input.disabled = true;
        this.sendBtn.disabled = true;

        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            const response = await this.callGeminiAPI(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTyping();
            console.error('AI API Error:', error);
            
            // More specific error messages
            let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again later.';
            if (error.message.includes('404')) {
                errorMessage = 'AI service is temporarily unavailable. Please try again later.';
            } else if (error.message.includes('401') || error.message.includes('403')) {
                errorMessage = 'Authentication issue with AI service. Please contact the administrator.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            }
            
            this.addMessage(errorMessage, 'bot');
        }

        // Re-enable input
        this.input.disabled = false;
        this.sendBtn.disabled = false;
        this.input.focus();
    }

    async callGeminiAPI(userMessage) {
        const systemPrompt = this.createSystemPrompt();
        const fullPrompt = `${systemPrompt}\n\nPotential employer/evaluator says: "${userMessage}"\n\nRespond as Oussama Hattan in a professional, confident manner. Remember: you are being evaluated for your expertise and professionalism, not providing customer service.`;

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
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
                    maxOutputTokens: 500,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Better error handling for API response structure
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            console.error('Unexpected API response structure:', data);
            throw new Error('Invalid response structure from AI service');
        }
        
        return data.candidates[0].content.parts[0].text;
    }

    createSystemPrompt() {        
        if (!this.personalInfo) {
            console.warn('No personal info available, using basic prompt');
            return `You are Oussama Hattan, a backend developer. Please respond in first person professionally but in a friendly way.`;
        }

        return `You are Oussama Hattan, a backend developer. Here's your personal information:

Name: ${this.personalInfo.name}
Age: ${this.personalInfo.age || 'Not specified'}
Profession: ${this.personalInfo.profession}
Current Role: ${this.personalInfo.currentRole || 'Not specified'}
Company: ${this.personalInfo.company || 'Not specified'}
Experience: ${this.personalInfo.experience}
Years of Coding: ${this.personalInfo.yearsCoding || 'Not specified'}
Education Level: ${this.personalInfo.educationLevel || 'Not specified'}
Education Details: ${this.personalInfo.education}
Certifications: ${this.personalInfo.certifications || 'Not specified'}
Location: ${this.personalInfo.location}
Languages: ${this.personalInfo.languages?.join(', ') || 'Not specified'}
Skills: ${this.personalInfo.skills?.join(', ') || 'Not specified'}
Work Experience: ${this.personalInfo.workExperience || 'Not specified'}
Key Achievements: ${this.personalInfo.achievements || 'Not specified'}
Projects: ${this.personalInfo.projects}
Specialization: ${this.personalInfo.specialization}
Personality: ${this.personalInfo.personality}

Additional Information: ${this.personalInfo.additionalInfo || 'No additional information provided.'}

Instructions:
- You are being evaluated by potential employers, CEOs, clients, or recruiters visiting your portfolio
- Always respond in first person as if you ARE Oussama Hattan himself
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

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'ai-message-avatar';
        avatar.innerHTML = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'ai-message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message ai-message-bot ai-typing-indicator';
        typingDiv.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <div class="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messages.appendChild(typingDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    hideTyping() {
        const typing = this.messages.querySelector('.ai-typing-indicator');
        if (typing) typing.remove();
    }
}

// Initialize AI Chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('aiChatBox')) {
        new AIChat();
    }
});
