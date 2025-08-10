// Theme transition manager
class ThemeTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.isShowingPopup = false;
        this.loadingScreen = document.querySelector('.theme-loading-screen');
        this.sun = document.querySelector('.theme-transition-sun');
        this.moon = document.querySelector('.theme-transition-moon');
        this.rays = document.querySelector('.theme-rays');
        this.horizon = document.querySelector('.theme-horizon');
        this.backdrop = document.querySelector('.theme-transition-backdrop');
        this.popup = document.querySelector('.theme-warning-popup');
        this.root = document.documentElement;
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.root.setAttribute('data-theme', savedTheme);
        
        // Update icon immediately
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    reset() {
        if (this.loadingScreen) this.loadingScreen.classList.remove('active');
        if (this.sun) {
            this.sun.style.opacity = '0';
            this.sun.style.transform = 'translateX(-50%) scale(0)';
            this.sun.style.bottom = '-100px';
        }
        if (this.moon) {
            this.moon.style.opacity = '0';
            this.moon.style.transform = 'translateX(-50%) scale(0)';
            this.moon.style.top = '-100px';
        }
        if (this.rays) {
            this.rays.style.opacity = '0';
            this.rays.style.bottom = '-140px';
        }
        if (this.horizon) {
            this.horizon.style.transform = 'scaleX(0)';
        }
        delete this.loadingScreen.dataset.transition;
        this.isTransitioning = false;
        this.isShowingPopup = false;
    }

    async showThemePopup() {
        if (this.isShowingPopup) return Promise.resolve(false);
        this.isShowingPopup = true;

        // Update popup text based on current theme
        const currentTheme = this.root.getAttribute('data-theme');
        const title = this.popup.querySelector('.popup-title');
        const message = this.popup.querySelector('.popup-message');
        const previewBtn = this.popup.querySelector('.popup-preview');
        const closeBtn = this.popup.querySelector('.popup-close');
        
        if (currentTheme === 'dark') {
            title.textContent = 'Switch to Light Theme?';
            message.textContent = 'Experience our bright light theme with beautiful animations.';
            closeBtn.textContent = 'Stay Dark';
        } else {
            title.textContent = 'Switch to Dark Theme?';
            message.textContent = 'Return to our sleek dark mode interface.';
            closeBtn.textContent = 'Stay Light';
        }

        return new Promise((resolve) => {
            const handlePreview = () => {
                cleanup();
                resolve(true);
            };

            const handleClose = () => {
                cleanup();
                resolve(false);
            };
            
            const cleanup = () => {
                this.popup.classList.remove('show');
                this.isShowingPopup = false;
                previewBtn.removeEventListener('click', handlePreview);
                closeBtn.removeEventListener('click', handleClose);
            };

            previewBtn.addEventListener('click', handlePreview, { once: true });
            closeBtn.addEventListener('click', handleClose, { once: true });
            
            this.popup.classList.add('show');
        });
    }

    async transitionToDark() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Reset any previous transitions
        this.reset();

        // Start transition
        this.loadingScreen.dataset.transition = 'to-dark';
        this.loadingScreen.classList.add('active');
        
        // Update theme toggle icon
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = 'fas fa-moon';
        }
        
        // Allow CSS animations to take effect - longer time
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Change theme
        this.root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // End transition
        this.loadingScreen.classList.remove('active');
        this.reset();
    }

    async transitionToLight() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Reset any previous transitions
        this.reset();

        // Start transition
        this.loadingScreen.dataset.transition = 'to-light';
        this.loadingScreen.classList.add('active');
        
        // Update theme toggle icon
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = 'fas fa-sun';
        }
        
        // Allow CSS animations to take effect - longer time
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Change theme
        this.root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // End transition
        this.loadingScreen.classList.remove('active');
        this.reset();
    }
}

// Initialize theme transition manager
window.ThemeTransitionManager = ThemeTransitionManager;

// Initialize theme toggling
document.addEventListener('DOMContentLoaded', () => {
    const transitionManager = new ThemeTransitionManager();
    
    // Set up theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', async () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            // Show confirmation popup first
            const confirmed = await transitionManager.showThemePopup();
            
            if (confirmed) {
                if (currentTheme === 'dark') {
                    transitionManager.transitionToLight();
                } else {
                    transitionManager.transitionToDark();
                }
            }
        });
    }
});