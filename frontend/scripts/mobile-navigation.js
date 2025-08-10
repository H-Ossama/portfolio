// Mobile Navigation System
class MobileNavigation {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.findMobileElements();
        this.bindEvents();
        this.updateActiveStates();
    }

    findMobileElements() {
        // Find existing mobile navigation elements
        this.mobileToggle = document.querySelector('.mobile-nav-toggle');
        this.mobileOverlay = document.querySelector('.mobile-nav-overlay');
        this.mobileMenu = document.querySelector('.mobile-nav-menu');
        this.mobileCloseBtn = document.querySelector('.mobile-nav-close');
        this.mobileLinks = document.querySelectorAll('.mobile-nav-link');
        this.mobileThemeToggle = document.querySelector('.mobile-theme-toggle');
        this.mobileLangToggle = document.querySelector('.mobile-lang-toggle');

        // If elements don't exist, create them
        if (!this.mobileToggle) {
            this.createMobileNavigation();
        }
    }

    createMobileNavigation() {
        // Create mobile nav toggle button
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-nav-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.setAttribute('aria-label', 'Toggle mobile navigation');
        mobileToggle.setAttribute('aria-expanded', 'false');

        // Create mobile nav overlay
        const mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-nav-overlay';

        // Create mobile nav menu
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-nav-menu';
        mobileMenu.setAttribute('role', 'navigation');
        mobileMenu.setAttribute('aria-label', 'Mobile navigation menu');

        // Get existing navigation links
        const existingNav = document.querySelector('nav .nav-links');
        const links = existingNav ? Array.from(existingNav.querySelectorAll('a')) : [];

        // Create mobile nav content
        mobileMenu.innerHTML = `
            <div class="mobile-nav-header">
                <div class="mobile-nav-logo">Oussama.dev</div>
                <div class="mobile-nav-subtitle">Backend Developer</div>
            </div>
            
            <ul class="mobile-nav-links">
                ${this.generateMobileNavLinks(links)}
            </ul>
            
            <div class="mobile-theme-controls">
                <button class="mobile-theme-toggle" onclick="mobileNav.toggleTheme()">
                    <i class="fas fa-moon"></i> Theme
                </button>
                <button class="mobile-lang-toggle" onclick="mobileNav.toggleLanguage()">
                    <i class="fas fa-globe"></i> <span class="mobile-current-lang">EN</span>
                </button>
            </div>
            
            <div class="mobile-nav-footer">
                <div class="mobile-social-links">
                    <a href="https://github.com/H-Ossama" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                        <i class="fab fa-github"></i>
                    </a>
                    <a href="https://www.linkedin.com/in/h-oussama/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
                        <i class="fab fa-linkedin-in"></i>
                    </a>
                    <a href="https://x.com/H_Oussama77" target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile">
                        <i class="fa-brands fa-x-twitter"></i>
                    </a>
                    <a href="mailto:ossamahattan@gmail.com" aria-label="Email Contact">
                        <i class="fas fa-envelope"></i>
                    </a>
                </div>
            </div>
        `;

        // Append elements to body
        document.body.appendChild(mobileToggle);
        document.body.appendChild(mobileOverlay);
        document.body.appendChild(mobileMenu);

        // Store references
        this.toggle = mobileToggle;
        this.overlay = mobileOverlay;
        this.menu = mobileMenu;
        this.navLinks = mobileMenu.querySelectorAll('.mobile-nav-links a');
    }

    generateMobileNavLinks(links) {
        const defaultLinks = [
            { href: '#home', text: 'Home', icon: 'fas fa-home' },
            { href: '#projects', text: 'Projects', icon: 'fas fa-folder-open' },
            { href: '#education', text: 'Education', icon: 'fas fa-graduation-cap' },
            { href: '#technologies', text: 'Skills', icon: 'fas fa-code' },
            { href: '#about', text: 'About', icon: 'fas fa-user' },
            { href: 'contact.html', text: 'Contact', icon: 'fas fa-envelope' }
        ];

        const linksToUse = links.length > 0 ? links.map(link => ({
            href: link.getAttribute('href'),
            text: link.textContent.trim(),
            icon: this.getIconForLink(link.textContent.trim())
        })) : defaultLinks;

        return linksToUse.map(link => `
            <li>
                <a href="${link.href}" class="mobile-nav-link">
                    <i class="${link.icon}"></i>
                    ${link.text}
                </a>
            </li>
        `).join('');
    }

    getIconForLink(text) {
        const iconMap = {
            'Home': 'fas fa-home',
            'Projects': 'fas fa-folder-open',
            'Education': 'fas fa-graduation-cap',
            'Skills': 'fas fa-code',
            'Technologies': 'fas fa-code',
            'About': 'fas fa-user',
            'Contact': 'fas fa-envelope'
        };
        return iconMap[text] || 'fas fa-link';
    }

    bindEvents() {
        // Toggle button click
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Overlay click to close
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Close button click
        if (this.mobileCloseBtn) {
            this.mobileCloseBtn.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Navigation links click
        if (this.mobileLinks) {
            this.mobileLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Only close menu for internal links (not external like contact.html)
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        this.closeMenu();
                        // Smooth scroll to section
                        this.smoothScrollToSection(href);
                    } else if (href.includes('contact.html')) {
                        this.closeMenu();
                        // Allow normal navigation to contact page
                    }
                });
            });
        }

        // Mobile theme toggle
        if (this.mobileThemeToggle) {
            this.mobileThemeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Mobile language toggle
        if (this.mobileLangToggle) {
            this.mobileLangToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close on window resize if open
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
        if (this.mobileToggle) {
            this.mobileToggle.classList.add('active');
            this.mobileToggle.setAttribute('aria-expanded', 'true');
        }
        if (this.mobileOverlay) {
            this.mobileOverlay.classList.add('active');
        }
        if (this.mobileMenu) {
            this.mobileMenu.classList.add('active');
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first link for accessibility
        setTimeout(() => {
            const firstLink = this.mobileMenu?.querySelector('.mobile-nav-links a');
            if (firstLink) firstLink.focus();
        }, 300);
    }

    closeMenu() {
        this.isOpen = false;
        if (this.mobileToggle) {
            this.mobileToggle.classList.remove('active');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
        }
        if (this.mobileOverlay) {
            this.mobileOverlay.classList.remove('active');
        }
        if (this.mobileMenu) {
            this.mobileMenu.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    smoothScrollToSection(target) {
        const element = document.querySelector(target);
        if (element) {
            const offset = 80; // Account for any fixed headers
            const elementPosition = element.offsetTop - offset;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    updateActiveStates() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        // Update active states in mobile nav
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSection}` || (currentSection === '' && href === '#home')) {
                link.classList.add('active');
            }
        });
    }

    toggleTheme() {
        // Get existing theme toggle functionality
        const existingThemeToggle = document.querySelector('.theme-toggle:not(.mobile-theme-toggle)');
        if (existingThemeToggle) {
            existingThemeToggle.click();
        } else {
            // Fallback theme toggle
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
        }
        
        // Update mobile theme button icon
        const themeBtn = this.mobileThemeToggle?.querySelector('i');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (themeBtn) {
            themeBtn.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleLanguage() {
        // Get existing language toggle functionality
        const existingLangToggle = document.querySelector('.lang-switch-btn:not(.mobile-lang-toggle)');
        if (existingLangToggle) {
            existingLangToggle.click();
        }
        
        // You can add more sophisticated language switching logic here
        console.log('Language toggle clicked');
    }

    // Public method to update current language display
    updateCurrentLanguage(lang) {
        const currentLangElement = this.mobileLangToggle?.querySelector('.mobile-current-lang');
        if (currentLangElement) {
            currentLangElement.textContent = lang.toUpperCase();
        }
    }
}

// Touch and Gesture Enhancements
class TouchEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addTouchFeedback();
        this.improveScrolling();
        this.addSwipeGestures();
    }

    addTouchFeedback() {
        // Add touch feedback to interactive elements
        const interactiveElements = document.querySelectorAll(
            'button, a, .cta-button, .project-card, .tech-item, .skill-item'
        );

        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.opacity = '0.8';
            }, { passive: true });

            element.addEventListener('touchend', function() {
                this.style.transform = '';
                this.style.opacity = '';
            }, { passive: true });

            element.addEventListener('touchcancel', function() {
                this.style.transform = '';
                this.style.opacity = '';
            }, { passive: true });
        });
    }

    improveScrolling() {
        // Improve scrolling performance on mobile
        const scrollableElements = document.querySelectorAll(
            '.mobile-nav-menu, .project-grid, .skills-grid'
        );

        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });
    }

    addSwipeGestures() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const endX = e.touches[0].clientX;
            const endY = e.touches[0].clientY;

            const diffX = startX - endX;
            const diffY = startY - endY;

            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - close mobile menu if open
                    if (window.mobileNav && window.mobileNav.isOpen) {
                        window.mobileNav.closeMenu();
                    }
                } else {
                    // Swipe right - open mobile menu if closed and swipe starts from edge
                    if (window.mobileNav && !window.mobileNav.isOpen && startX < 50) {
                        window.mobileNav.openMenu();
                    }
                }
            }

            startX = 0;
            startY = 0;
        }, { passive: true });
    }
}

// Viewport and Orientation Handling
class ViewportHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setViewportHeight();
        this.handleOrientationChange();
        this.handleResize();
    }

    setViewportHeight() {
        // Fix viewport height issues on mobile browsers
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Add small delay for orientation change to complete
            setTimeout(() => {
                this.setViewportHeight();
                if (window.mobileNav && window.mobileNav.isOpen) {
                    window.mobileNav.closeMenu();
                }
            }, 100);
        });
    }

    handleResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.setViewportHeight();
            }, 150);
        });
    }
}

// Image and Media Loading Optimization
class MediaOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.handleLazyLoading();
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading attribute for better performance
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // Add error handling
            img.addEventListener('error', function() {
                this.style.display = 'none';
                console.warn('Failed to load image:', this.src);
            });
        });
    }

    handleLazyLoading() {
        // Enhanced lazy loading for mobile
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
}

// Initialize mobile enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on mobile devices or small screens
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
        window.mobileNav = new MobileNavigation();
        new TouchEnhancements();
        new ViewportHandler();
        new MediaOptimizer();
        
        console.log('Mobile navigation and enhancements initialized');
    }
});

// Export for global access
window.MobileNavigation = MobileNavigation;
