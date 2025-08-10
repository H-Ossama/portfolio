// Medium-Mobile Separation Script
// Ensures mobile navigation is completely disabled on medium screens

class MediumMobileSeparator {
    constructor() {
        this.init();
    }

    init() {
        this.setupBreakpointListener();
        this.disableMobileOnMedium();
        this.bindEvents();
    }

    setupBreakpointListener() {
        // Create media query listeners
        this.mobileQuery = window.matchMedia('(max-width: 768px)');
        this.mediumQuery = window.matchMedia('(min-width: 769px) and (max-width: 1350px)');
        this.desktopQuery = window.matchMedia('(min-width: 1351px)');

        // Listen for changes
        this.mobileQuery.addListener((e) => this.handleBreakpointChange(e, 'mobile'));
        this.mediumQuery.addListener((e) => this.handleBreakpointChange(e, 'medium'));
        this.desktopQuery.addListener((e) => this.handleBreakpointChange(e, 'desktop'));

        // Initial check
        this.checkCurrentBreakpoint();
    }

    checkCurrentBreakpoint() {
        if (this.mobileQuery.matches) {
            this.enableMobileMode();
        } else if (this.mediumQuery.matches || this.desktopQuery.matches) {
            this.disableMobileMode();
        }
    }

    handleBreakpointChange(e, type) {
        console.log(`Breakpoint change: ${type} - ${e.matches ? 'matches' : 'no match'}`);
        
        if (type === 'mobile' && e.matches) {
            this.enableMobileMode();
        } else if ((type === 'medium' || type === 'desktop') && e.matches) {
            this.disableMobileMode();
        }
    }

    enableMobileMode() {
        console.log('Enabling mobile mode');
        // Mobile navigation is allowed to function
        document.body.classList.add('mobile-mode');
        document.body.classList.remove('medium-mode', 'desktop-mode');
    }

    disableMobileMode() {
        console.log('Disabling mobile mode');
        
        // Force close any open mobile navigation
        this.closeMobileNavigation();
        
        // Hide all mobile elements
        this.hideMobileElements();
        
        // Disable mobile event listeners
        this.disableMobileEvents();
        
        // Set body class
        if (this.mediumQuery.matches) {
            document.body.classList.add('medium-mode');
            document.body.classList.remove('mobile-mode', 'desktop-mode');
        } else if (this.desktopQuery.matches) {
            document.body.classList.add('desktop-mode');
            document.body.classList.remove('mobile-mode', 'medium-mode');
        }
    }

    closeMobileNavigation() {
        // Close mobile navigation if it's open
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const mobileDrawer = document.querySelector('.mobile-drawer');
        const mobileOverlay = document.querySelector('.mobile-nav-overlay');
        const mobileMenu = document.querySelector('.mobile-nav-menu');

        // Remove active classes
        if (mobileNavToggle) {
            mobileNavToggle.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
        }

        if (mobileDrawer) {
            mobileDrawer.classList.remove('active');
        }

        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
        }

        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }

        // Remove body classes
        document.body.classList.remove('mobile-nav-open');

        // Close any mobile dropdowns
        const mobileDropdowns = document.querySelectorAll('.profile-dropdown');
        mobileDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    hideMobileElements() {
        const mobileElements = [
            '.mobile-header',
            '.mobile-nav-toggle',
            '.mobile-header-avatar',
            '.mobile-header-right',
            '.mobile-profile-card',
            '.mobile-nav-overlay',
            '.mobile-nav-menu',
            '.mobile-drawer',
            '.mobile-backdrop',
            '.drawer-header',
            '.drawer-nav',
            '.drawer-settings',
            '.profile-dropdown'
        ];

        mobileElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                element.style.zIndex = '-1';
            });
        });
    }

    disableMobileEvents() {
        // Disable mobile navigation events on medium screens
        const mobileToggle = document.querySelector('.mobile-nav-toggle');
        if (mobileToggle) {
            // Clone the element to remove all event listeners
            const newToggle = mobileToggle.cloneNode(true);
            mobileToggle.parentNode.replaceChild(newToggle, mobileToggle);
            
            // Hide it
            newToggle.style.display = 'none';
        }

        // Disable mobile menu clicks
        const mobileMenuItems = document.querySelectorAll('.mobile-nav-link, .drawer-nav-link');
        mobileMenuItems.forEach(item => {
            item.style.pointerEvents = 'none';
        });
    }

    disableMobileOnMedium() {
        // Prevent mobile navigation from functioning on medium+ screens
        if (window.innerWidth >= 769) {
            this.disableMobileMode();
        }
    }

    bindEvents() {
        // Override any mobile navigation events on medium screens
        document.addEventListener('click', (e) => {
            if (window.innerWidth >= 769) {
                // Prevent any mobile navigation clicks
                if (e.target.matches('.mobile-nav-toggle, .mobile-nav-toggle *, .mobile-header *, .mobile-drawer *')) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('Mobile navigation click prevented on medium screen');
                    return false;
                }
            }
        }, true); // Use capture phase

        // Prevent mobile navigation keyboard events
        document.addEventListener('keydown', (e) => {
            if (window.innerWidth >= 769 && e.target.matches('.mobile-nav-toggle, .mobile-drawer *, .mobile-header *')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile navigation keyboard event prevented on medium screen');
                return false;
            }
        }, true);

        // Force check on window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.checkCurrentBreakpoint();
            }, 100);
        });

        // Force check on orientation change (mobile devices)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.checkCurrentBreakpoint();
            }, 300);
        });
    }
}

// Initialize the separator
document.addEventListener('DOMContentLoaded', () => {
    window.mediumMobileSeparator = new MediumMobileSeparator();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    window.mediumMobileSeparator = new MediumMobileSeparator();
}

// Export for debugging
window.MediumMobileSeparator = MediumMobileSeparator;
