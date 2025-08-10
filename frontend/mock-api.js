// Mock API for testing dashboard functionality
// This simulates the API endpoints until the real backend is available

const mockProjects = [
    {
        id: "1709422726001",
        title: "E-Commerce API",
        description: "A robust RESTful API for e-commerce platforms with advanced authentication, payment integration, and order management.",
        technologies: ["Node.js", "Express", "MongoDB", "JWT"],
        image: "/assets/images/project1.jpg",
        githubLink: "https://github.com/H-Ossama/project1",
        liveLink: "https://project1-demo.com",
        createdAt: "2024-02-11T01:32:07.634Z",
        status: "active"
    },
    {
        id: "1709422726002",
        title: "Social Media Platform",
        description: "Full-stack social media application with real-time messaging, notifications, and content sharing capabilities.",
        technologies: ["React", "Node.js", "Socket.IO", "Redis"],
        image: "/assets/images/project2.jpg",
        githubLink: "https://github.com/H-Ossama/project2",
        liveLink: "https://project2-demo.com",
        createdAt: "2024-02-12T01:32:07.634Z",
        status: "active"
    },
    {
        id: "1709422726003",
        title: "Analytics Dashboard",
        description: "Interactive data visualization platform with real-time analytics, custom reports, and automated insights generation.",
        technologies: ["Python", "Django", "D3.js", "PostgreSQL"],
        image: "/assets/images/project3.jpg",
        githubLink: "https://github.com/H-Ossama/project3",
        liveLink: "https://project3-demo.com",
        createdAt: "2024-02-13T01:32:07.634Z",
        status: "active"
    },
    {
        id: "1709422726004",
        title: "AI Chatbot System",
        description: "Advanced conversational AI system with natural language processing and machine learning capabilities.",
        technologies: ["Python", "TensorFlow", "Flask", "WebSocket"],
        image: "/assets/images/project4.jpg",
        githubLink: "https://github.com/H-Ossama/project4",
        liveLink: "https://project4-demo.com",
        createdAt: "2024-02-14T01:32:07.634Z",
        status: "active"
    }
];

const mockSkills = {
    skills: [
        {
            id: "1",
            name: "JavaScript",
            category: "frontend",
            icon: "fab fa-js-square",
            level: 90,
            description: "Advanced proficiency in modern JavaScript, ES6+, and frontend frameworks",
            tags: ["ES6+", "DOM", "Async/Await", "Modules"]
        },
        {
            id: "2",
            name: "React",
            category: "frontend",
            icon: "fab fa-react",
            level: 85,
            description: "Experienced in building complex React applications with hooks and state management",
            tags: ["Hooks", "Redux", "Context API", "Testing"]
        },
        {
            id: "3",
            name: "Node.js",
            category: "backend",
            icon: "fab fa-node-js",
            level: 80,
            description: "Backend development with Node.js, Express, and various databases",
            tags: ["Express", "APIs", "Authentication", "Middleware"]
        }
    ]
};

// Mock API functions
window.mockAPI = {
    // Projects endpoints
    async getProjects() {
        await this.delay(500); // Simulate network delay
        // Get the latest project data from localStorage or use default
        const savedProjects = localStorage.getItem('mockProjects');
        if (savedProjects) {
            return JSON.parse(savedProjects);
        }
        return mockProjects;
    },

    async getProject(id) {
        await this.delay(300);
        const projects = await this.getProjects();
        const project = projects.find(p => p.id === id);
        if (!project) throw new Error('Project not found');
        return project;
    },

    async createProject(data) {
        await this.delay(800);
        const projects = await this.getProjects();
        const newProject = {
            id: Date.now().toString(),
            ...data,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        projects.push(newProject);
        // Save to localStorage
        localStorage.setItem('mockProjects', JSON.stringify(projects));
        return newProject;
    },

    async updateProject(id, data) {
        await this.delay(600);
        const projects = await this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Project not found');
        
        // Handle technologies array if it comes as a string
        if (typeof data.technologies === 'string') {
            data.technologies = data.technologies.split(',').map(tech => tech.trim()).filter(Boolean);
        }
        
        projects[index] = { 
            ...projects[index], 
            ...data, 
            updatedAt: new Date().toISOString() 
        };
        
        // Save to localStorage
        localStorage.setItem('mockProjects', JSON.stringify(projects));
        return projects[index];
    },

    async deleteProject(id) {
        await this.delay(400);
        const projects = await this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Project not found');
        projects.splice(index, 1);
        // Save to localStorage
        localStorage.setItem('mockProjects', JSON.stringify(projects));
        return { success: true };
    },

    // Skills endpoints
    async getSkills() {
        await this.delay(400);
        return mockSkills;
    },

    async getSkill(id) {
        await this.delay(300);
        const skill = mockSkills.skills.find(s => s.id === id);
        if (!skill) throw new Error('Skill not found');
        return { skill };
    },

    // Education endpoints
    async getEducation() {
        await this.delay(300);
        // Get the latest education data from localStorage or use default
        const savedEducation = localStorage.getItem('mockEducation');
        if (savedEducation) {
            return JSON.parse(savedEducation);
        }
        // Default education data
        const defaultEducation = [
            {
                id: "1",
                year: 2025,
                title: "European (EFED) Bachelor in Web Development",
                institution: "MULTIHEXA Meknes",
                isCurrent: true,
                description: "",
                highlights: [
                  "Advanced web development studies with European standards",
                  "Modern web technologies and frameworks",
                  "Full-stack development practices",
                  "Currently pursuing (2024-2025)"
                ],
                skills: [
                  "Full-Stack Development",
                  "European Standards",
                  "Web Technologies"
                ],
                updatedAt: "2025-07-30T04:30:02.364Z"
            },
            {
                id: "2",
                year: 2024,
                title: "Computer Networks and Network Security",
                institution: "Coursera",
                highlights: [
                  "Network security fundamentals",
                  "Computer networking principles",
                  "Security protocols and best practices",
                  "Professional certification"
                ],
                skills: [
                  "Network Security",
                  "Computer Networks",
                  "Security Protocols"
                ],
                description: "",
                isCurrent: false,
                updatedAt: "2025-07-30T04:08:37.418Z",
                certificate: "/assets/certificates/1753848517412-Coursera EQIGIS8IV9VK.pdf"
            },
            {
                id: "3",
                year: 2024,
                title: "Software Engineering Bootcamp",
                institution: "ALX AFRICA",
                highlights: [
                  "Intensive software engineering training",
                  "Modern development practices",
                  "Full-stack application development",
                  "Project-based learning"
                ],
                skills: [
                  "Software Engineering",
                  "Full-Stack Development",
                  "Modern Practices"
                ],
                description: "",
                isCurrent: false,
                updatedAt: "2025-07-30T04:07:09.312Z",
                certificate: "/assets/certificates/1753848429304-17-short-specializations-certificate-oussama-hattan.png"
            },
            {
                id: "4",
                year: 2023,
                title: "Technicien Spécialisé en Système et Réseau Informatique",
                institution: "EFET (Ecole Française D'enseignement Technique)",
                highlights: [
                  "IT systems administration",
                  "Network infrastructure management",
                  "Hardware and software integration",
                  "Technical specialization (2021-2023)"
                ],
                skills: [
                  "IT Systems",
                  "Network Administration",
                  "System Integration"
                ],
                description: "",
                isCurrent: false,
                updatedAt: "2025-07-30T04:09:26.938Z",
                certificate: "/assets/certificates/1753848566922-WhatsApp Image 2024-12-26 Ã  20.58.55_50216c56.jpg"
            }
        ];
        // Save default data to localStorage if not exists
        localStorage.setItem('mockEducation', JSON.stringify(defaultEducation));
        return defaultEducation;
    },

    async getEducationById(id) {
        await this.delay(300);
        // Get education data
        const mockEducation = await this.getEducation();
        // Find the specific education record
        const education = mockEducation.find(edu => edu.id === id);
        if (!education) throw new Error('Education not found');
        return education;
    },

    async createEducation(data) {
        await this.delay(500);
        const education = await this.getEducation();
        
        // Handle highlights and skills arrays if they come as strings
        if (typeof data.highlights === 'string') {
            data.highlights = data.highlights.split(',').map(h => h.trim()).filter(Boolean);
        }
        if (typeof data.skills === 'string') {
            data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        const newEducation = {
            id: Date.now().toString(),
            ...data,
            certificate: null,
            updatedAt: new Date().toISOString()
        };
        education.push(newEducation);
        // Save to localStorage
        localStorage.setItem('mockEducation', JSON.stringify(education));
        return newEducation;
    },

    async updateEducation(id, data) {
        await this.delay(400);
        const education = await this.getEducation();
        const index = education.findIndex(edu => edu.id === id);
        if (index === -1) throw new Error('Education not found');
        
        // Handle highlights and skills arrays if they come as strings
        if (typeof data.highlights === 'string') {
            data.highlights = data.highlights.split(',').map(h => h.trim()).filter(Boolean);
        }
        if (typeof data.skills === 'string') {
            data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        education[index] = { 
            ...education[index], 
            ...data, 
            updatedAt: new Date().toISOString() 
        };
        
        // Save to localStorage
        localStorage.setItem('mockEducation', JSON.stringify(education));
        return education[index];
    },

    async deleteEducation(id) {
        await this.delay(300);
        const education = await this.getEducation();
        const index = education.findIndex(edu => edu.id === id);
        if (index === -1) throw new Error('Education not found');
        education.splice(index, 1);
        // Save to localStorage
        localStorage.setItem('mockEducation', JSON.stringify(education));
        return { success: true };
    },

    // Stats endpoints
    async getStats() {
        await this.delay(200);
        return {
            visitors: 1250,
            cvViews: 89,
            cvDownloads: 34,
            messageCount: 12
        };
    },

    // User profile endpoints
    async getUserProfile() {
        await this.delay(200);
        return {
            username: "Oussama Hattan",
            email: "ossamahattan@gmail.com",
            avatar: "assets/images/profile-pic.svg",
            role: "Full Stack Developer",
            bio: "Passionate developer with expertise in modern web technologies"
        };
    },

    async getUserSettings() {
        await this.delay(200);
        return {
            username: "Oussama Hattan",
            email: "ossamahattan@gmail.com",
            avatar: "assets/images/profile-pic.svg",
            role: "Full Stack Developer"
        };
    },

    // Utility function to simulate network delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Override fetch for API calls to use mock data
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    // Check if this is an API call
    if (url.startsWith('/api/')) {
        console.log(`Mock API Call: ${url}, Method: ${options.method || 'GET'}`);
        
        const token = localStorage.getItem('token');
        
        // Simple auth check for demo
        if (!token && !url.includes('/login')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const method = options.method || 'GET';
        const endpoint = url.replace('/api/', '');

        try {
            let result;
            
            if (endpoint === 'projects') {
                if (method === 'GET') {
                    result = await window.mockAPI.getProjects();
                } else if (method === 'POST') {
                    let data;
                    if (options.body instanceof FormData) {
                        // Handle FormData for file uploads
                        data = {};
                        for (let [key, value] of options.body.entries()) {
                            if (key === 'technologies') {
                                // Handle technologies as comma-separated string
                                data[key] = value.split(',').map(tech => tech.trim()).filter(Boolean);
                            } else {
                                data[key] = value;
                            }
                        }
                    } else {
                        data = JSON.parse(options.body);
                    }
                    result = await window.mockAPI.createProject(data);
                }
            } else if (endpoint.startsWith('projects/')) {
                const id = endpoint.split('/')[1];
                if (method === 'GET') {
                    result = await window.mockAPI.getProject(id);
                } else if (method === 'PUT') {
                    let data;
                    if (options.body instanceof FormData) {
                        // Handle FormData for file uploads
                        data = {};
                        for (let [key, value] of options.body.entries()) {
                            if (key === 'technologies') {
                                // Handle technologies as comma-separated string
                                data[key] = value.split(',').map(tech => tech.trim()).filter(Boolean);
                            } else {
                                data[key] = value;
                            }
                        }
                    } else {
                        data = JSON.parse(options.body);
                    }
                    result = await window.mockAPI.updateProject(id, data);
                } else if (method === 'DELETE') {
                    result = await window.mockAPI.deleteProject(id);
                }
            } else if (endpoint === 'skills') {
                result = await window.mockAPI.getSkills();
            } else if (endpoint.startsWith('skills/')) {
                const id = endpoint.split('/')[1];
                result = await window.mockAPI.getSkill(id);
            } else if (endpoint === 'education') {
                if (method === 'GET') {
                    result = await window.mockAPI.getEducation();
                } else if (method === 'POST') {
                    let data;
                    if (options.body instanceof FormData) {
                        // Handle FormData
                        data = {};
                        for (let [key, value] of options.body.entries()) {
                            data[key] = value;
                        }
                    } else {
                        data = JSON.parse(options.body);
                    }
                    result = await window.mockAPI.createEducation(data);
                }
            } else if (endpoint.startsWith('education/')) {
                const id = endpoint.split('/')[1];
                if (method === 'GET') {
                    result = await window.mockAPI.getEducationById(id);
                } else if (method === 'PUT') {
                    let data;
                    if (options.body instanceof FormData) {
                        // Handle FormData
                        data = {};
                        for (let [key, value] of options.body.entries()) {
                            data[key] = value;
                        }
                    } else {
                        data = JSON.parse(options.body);
                    }
                    result = await window.mockAPI.updateEducation(id, data);
                } else if (method === 'DELETE') {
                    result = await window.mockAPI.deleteEducation(id);
                }
            } else if (endpoint === 'stats') {
                result = await window.mockAPI.getStats();
            } else if (endpoint === 'user/profile') {
                result = await window.mockAPI.getUserProfile();
            } else if (endpoint === 'user/settings') {
                result = await window.mockAPI.getUserSettings();
            } else {
                throw new Error('API endpoint not found');
            }

            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // For non-API calls, use original fetch
    return originalFetch.apply(this, arguments);
};

// Set a demo token for testing
if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'demo-token-12345');
}

// Initialize default project data in localStorage if not exists
if (!localStorage.getItem('mockProjects')) {
    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
}

console.log('Mock API loaded successfully. Dashboard should now work with simulated data.');
