// Frontend Configuration
const config = {
    // Backend API base URL
    API_BASE_URL: 'http://localhost:3001',
    
    // Environment
    ENVIRONMENT: 'development', // 'development' or 'production'
    
    // Frontend settings
    FRONTEND_PORT: 8080,
    
    // API endpoints
    API_ENDPOINTS: {
        PERSONAL_INFO: '/api/personal-info',
        PROJECTS: '/api/projects',
        SKILLS: '/api/skills',
        EDUCATION: '/api/public/education',
        CONTACT: '/api/contact',
        MESSAGES: '/api/messages',
        VISITOR_STATS: '/api/stats/visitor',
        TEST_AI: '/api/test-ai'
    },
    
    // Production API URL (update this when deploying)
    PRODUCTION_API_URL: 'https://your-portfolio-api.herokuapp.com',
    
    // Get the appropriate API URL based on environment
    getApiUrl() {
        return this.ENVIRONMENT === 'production' 
            ? this.PRODUCTION_API_URL 
            : this.API_BASE_URL;
    },
    
    // Get full endpoint URL
    getEndpoint(endpoint) {
        return this.getApiUrl() + this.API_ENDPOINTS[endpoint];
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.config = config;
}
