// Simple Mobile Navigation Implementation
class SimpleMobileNav {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.bindElements();
        this.bindEvents();
        this.updateActiveStates();
    }

    bindElements() {
        this.toggle = document.querySelector('.mobile-nav-toggle');
        this.overlay = document.querySelector('.mobile-nav-overlay');
        this.menu = document.querySelector('.mobile-nav-menu');
        this.closeBtn = document.querySelector('.mobile-nav-close');
        this.links = document.querySelectorAll('.mobile-nav-link');
        this.themeToggle = document.querySelector('.mobile-theme-toggle');
        this.langToggle = document.querySelector('.mobile-lang-toggle');

        // Log for debugging
        console.log('Mobile Nav Elements Found:', {
            toggle: !!this.toggle,
            overlay: !!this.overlay,
            menu: !!this.menu,
            closeBtn: !!this.closeBtn,
            links: this.links.length,
            themeToggle: !!this.themeToggle,
            langToggle: !!this.langToggle
        });

        // If toggle doesn't exist, create it
        if (!this.toggle) {
            this.createToggleButton();
        }
    }

    createToggleButton() {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle mobile navigation');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = `
            <div class="hamburger-line"></div>
            <div class="hamburger-line"></div>
            <div class="hamburger-line"></div>
        `;
        
        document.body.appendChild(toggle);
        this.toggle = toggle;
        
        console.log('Created mobile nav toggle button');
    }

    bindEvents() {
        // Toggle button
        if (this.toggle) {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Overlay click to close
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Navigation links
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Close menu for all clicks
                this.closeMenu();
                
                // Handle internal links with smooth scroll
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollToSection(href);
                }
            });
        });

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.handleThemeToggle();
            });
        }

        // Language toggle
        if (this.langToggle) {
            this.langToggle.addEventListener('click', () => {
                this.handleLanguageToggle();
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });

        // Update active states on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveStates();
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        
        if (this.toggle) {
            this.toggle.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
        }
        
        if (this.overlay) {
            this.overlay.classList.add('active');
        }
        
        if (this.menu) {
            this.menu.classList.add('active');
        }
        
        // Add active class to mobile header
        const mobileHeader = document.querySelector('.mobile-header');
        if (mobileHeader) {
            mobileHeader.classList.add('nav-open');
        }
        
        // Prevent body scroll
        document.body.classList.add('mobile-nav-open');
        
        // Focus management for accessibility
        setTimeout(() => {
            if (this.menu) {
                const firstLink = this.menu.querySelector('.mobile-nav-link');
                if (firstLink) {
                    firstLink.focus();
                }
            }
        }, 300);
        
        console.log('Menu opened');
    }

    closeMenu() {
        this.isOpen = false;
        
        if (this.toggle) {
            this.toggle.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
        }
        
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        if (this.menu) {
            this.menu.classList.remove('active');
        }
        
        // Remove active class from mobile header
        const mobileHeader = document.querySelector('.mobile-header');
        if (mobileHeader) {
            mobileHeader.classList.remove('nav-open');
        }
        
        // Restore body scroll
        document.body.classList.remove('mobile-nav-open');
        
        console.log('Menu closed');
    }

    smoothScrollToSection(target) {
        const element = document.querySelector(target);
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    updateActiveStates() {
        if (!this.links.length) return;

        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        this.links.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');

            // Check for active link
            if (href === currentPath || href === currentHash || 
                (href === '#home' && (!currentHash || currentHash === '#'))) {
                link.classList.add('active');
            }
        });

        // Highlight based on scroll position
        if (currentHash || window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            this.updateScrollBasedActive();
        }
    }

    updateScrollBasedActive() {
        const sections = ['home', 'projects', 'education', 'technologies', 'about'];
        const scrollPosition = window.scrollY + 100;

        let activeSection = 'home';

        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId) || 
                          document.querySelector(`.${sectionId}`) ||
                          document.querySelector(`[data-section="${sectionId}"]`);
            
            if (element && element.offsetTop <= scrollPosition) {
                activeSection = sectionId;
            }
        });

        // Update active states
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            
            if (href === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }

    handleThemeToggle() {
        // Find and trigger the main theme toggle
        const mainThemeToggle = document.querySelector('.theme-toggle:not(.mobile-theme-toggle)');
        if (mainThemeToggle) {
            mainThemeToggle.click();
        } else {
            // Fallback theme toggle
            this.toggleThemeFallback();
        }
    }

    toggleThemeFallback() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        
        // Update theme toggle icon
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    handleLanguageToggle() {
        // Find and trigger the main language toggle
        const mainLangToggle = document.querySelector('.lang-switch-btn:not(.mobile-lang-toggle)');
        if (mainLangToggle) {
            mainLangToggle.click();
        } else {
            console.log('Language toggle clicked - implement language switching logic');
        }
    }
}

// Initialize mobile navigation
let mobileNav;

// Wait for DOM content to be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mobileNav = new SimpleMobileNav();
    });
} else {
    mobileNav = new SimpleMobileNav();
}

// Export for global access
window.SimpleMobileNav = SimpleMobileNav;
window.mobileNav = mobileNav;
