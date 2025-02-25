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
        
        // Ensure we start in dark mode
        this.root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }

    reset() {
        this.loadingScreen.classList.remove('active');
        this.backdrop.classList.remove('sunrise', 'sunset');
        this.sun.style.display = 'none';
        this.moon.style.display = 'none';
        if (this.rays) this.rays.style.opacity = '0';
        this.isTransitioning = false;
        this.isShowingPopup = false;
    }

    showWinterWarning() {
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

        this.loadingScreen.classList.add('active');
        this.backdrop.classList.remove('sunrise');
        this.backdrop.classList.add('sunset');
        
        // Show moon and hide sun
        this.moon.style.display = 'block';
        this.sun.style.display = 'none';
        if (this.rays) this.rays.style.opacity = '0';

        // Apply theme change
        requestAnimationFrame(() => {
            this.root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        });

        // Complete transition
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.reset();
    }

    async transitionToLight() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        this.loadingScreen.classList.add('active');
        this.backdrop.classList.remove('sunset');
        this.backdrop.classList.add('sunrise');

        // Show sun and hide moon
        this.sun.style.display = 'block';
        this.moon.style.display = 'none';
        
        // Start rays animation after a small delay
        setTimeout(() => {
            if (this.rays) this.rays.style.opacity = '1';
        }, 500);

        // Apply theme change
        requestAnimationFrame(() => {
            this.root.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        });

        // Complete transition
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.reset();
    }
}

// Initialize theme transition manager
window.ThemeTransitionManager = ThemeTransitionManager;