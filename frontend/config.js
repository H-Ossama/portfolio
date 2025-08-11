// Frontend Configuration
const config = {
    // Backend API base URL
    API_BASE_URL: 'http://localhost:3001',
    
    // Environment
    ENVIRONMENT: 'production', // 'development' or 'production'
    
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
    PRODUCTION_API_URL: 'https://portfolio-backend-production-05d3.up.railway.app',
    
    // Get the appropriate API URL based on environment
    getApiUrl() {
        return this.ENVIRONMENT === 'production' 
            ? this.PRODUCTION_API_URL 
            : this.API_BASE_URL;
    },
    
    // Get full endpoint URL
    getEndpoint(endpoint) {
        return this.getApiUrl() + this.API_ENDPOINTS[endpoint];
    },
    
    // Helper function to get full API URL for any path
    getApiPath(path) {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return this.getApiUrl() + cleanPath;
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
