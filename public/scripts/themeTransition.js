// Theme transition manager
class ThemeTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.isShowingPopup = false;
        this.loadingScreen = document.querySelector('.theme-loading-screen');
        this.sun = document.querySelector('.theme-transition-sun');
        this.moon = document.querySelector('.theme-transition-moon');
        this.rays = document.querySelector('.theme-rays');
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
        if (this.backdrop) this.backdrop.classList.remove('sunrise', 'sunset');
        if (this.sun) this.sun.style.display = 'none';
        if (this.moon) this.moon.style.display = 'none';
        if (this.rays) this.rays.style.opacity = '0';
        this.isTransitioning = false;
        this.isShowingPopup = false;
    }

    async showWinterWarning() {
        if (this.isShowingPopup) return Promise.resolve(false);
        this.isShowingPopup = true;

        return new Promise((resolve) => {
            const previewBtn = this.popup.querySelector('.popup-preview');
            const closeBtn = this.popup.querySelector('.popup-close');
            
            const cleanup = () => {
                this.popup.classList.remove('show');
                this.isShowingPopup = false;
                previewBtn.removeEventListener('click', handlePreview);
                closeBtn.removeEventListener('click', handleClose);
            };

            const handlePreview = () => {
                cleanup();
                resolve(true);
            };

            const handleClose = () => {
                cleanup();
                resolve(false);
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
        
        // Show and animate moon
        if (this.moon) {
            this.moon.style.display = 'block';
            this.moon.style.transform = 'translate(-50%, -50%) scale(0)';
            await new Promise(resolve => setTimeout(resolve, 50));
            this.moon.style.transform = 'translate(-50%, -50%) scale(1)';
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Change theme
        this.root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // End transition
        this.loadingScreen.classList.remove('active');
        if (this.moon) this.moon.style.display = 'none';
        delete this.loadingScreen.dataset.transition;
        this.isTransitioning = false;
    }

    async transitionToLight() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Reset any previous transitions
        this.reset();

        // Start transition
        this.loadingScreen.dataset.transition = 'to-light';
        this.loadingScreen.classList.add('active');
        
        // Show and animate sun
        if (this.sun) {
            this.sun.style.display = 'block';
            this.sun.style.transform = 'translate(-50%, -50%) scale(0)';
            await new Promise(resolve => setTimeout(resolve, 50));
            this.sun.style.transform = 'translate(-50%, -50%) scale(1)';
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Change theme
        this.root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // End transition
        this.loadingScreen.classList.remove('active');
        if (this.sun) this.sun.style.display = 'none';
        delete this.loadingScreen.dataset.transition;
        this.isTransitioning = false;
    }
}

// Initialize theme transition manager
window.ThemeTransitionManager = ThemeTransitionManager;