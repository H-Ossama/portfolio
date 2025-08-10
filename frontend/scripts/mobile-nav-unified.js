/**
 * Unified Mobile Navigation System
 * - Right-side burger menu
 * - Works on all screen sizes including smallest
 * - Single toggle button for open/close
 * - Clean, conflict-free implementation
 */

class UnifiedMobileNav {
    constructor() {
        this.isOpen = false;
        this.toggle = null;
        this.overlay = null;
        this.menu = null;
        this.isInitialized = false;
        
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
        console.log('🔧 Setting up unified mobile navigation...');
        
        // Only initialize on mobile screens
        if (window.innerWidth > 768) {
            console.log('📱 Not a mobile screen, skipping mobile nav');
            return;
        }
        
        this.createToggleButton();
        this.setupElements();
        this.bindEvents();
        this.isInitialized = true;
        
        console.log('✅ Unified mobile navigation initialized successfully');
    }
    
    createToggleButton() {
        // Remove any existing unified toggle
        const existingToggle = document.querySelector('.mobile-nav-toggle-unified');
        if (existingToggle) {
            existingToggle.remove();
        }
        
        // Create new unified toggle button
        const toggle = document.createElement('button');
        toggle.className = 'mobile-nav-toggle-unified';
        toggle.setAttribute('aria-label', 'Toggle mobile navigation');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = `
            <div class="hamburger-line"></div>
            <div class="hamburger-line"></div>
            <div class="hamburger-line"></div>
        `;
        
        document.body.appendChild(toggle);
        this.toggle = toggle;
        
        console.log('🍔 Created unified mobile nav toggle');
    }
    
    setupElements() {
        // Get or create overlay
        this.overlay = document.querySelector('.mobile-nav-overlay');
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'mobile-nav-overlay';
            document.body.appendChild(this.overlay);
        }
        
        // Get menu
        this.menu = document.querySelector('.mobile-nav-menu');
        
        console.log('📋 Elements setup:', {
            toggle: !!this.toggle,
            overlay: !!this.overlay,
            menu: !!this.menu
        });
    }
    
    bindEvents() {
        // Toggle button click
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
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            } else if (window.innerWidth <= 768 && !this.isInitialized) {
                this.setup();
            }
        });
        
        // Close menu when clicking on nav links
        if (this.menu) {
            const navLinks = this.menu.querySelectorAll('.mobile-nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    // Small delay to allow navigation to start
                    setTimeout(() => this.closeMenu(), 100);
                });
            });
        }
        
        console.log('🔗 Event listeners bound');
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        
        // Update toggle button
        if (this.toggle) {
            this.toggle.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
        }
        
        // Show overlay
        if (this.overlay) {
            this.overlay.classList.add('active');
        }
        
        // Show menu
        if (this.menu) {
            this.menu.classList.add('active');
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
        
        console.log('📱 Menu opened');
    }
    
    closeMenu() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Update toggle button
        if (this.toggle) {
            this.toggle.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
        }
        
        // Hide overlay
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        // Hide menu
        if (this.menu) {
            this.menu.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.classList.remove('mobile-nav-open');
        
        console.log('📱 Menu closed');
    }
    
    destroy() {
        // Remove toggle button
        if (this.toggle) {
            this.toggle.remove();
        }
        
        // Remove overlay if created by this instance
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.remove();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleEscapeKey);
        window.removeEventListener('resize', this.handleResize);
        
        // Reset state
        document.body.classList.remove('mobile-nav-open');
        this.isInitialized = false;
        
        console.log('🗑️ Unified mobile nav destroyed');
    }
}

// Initialize unified mobile navigation
let unifiedMobileNav = null;

// Function to initialize or reinitialize
function initUnifiedMobileNav() {
    // Destroy existing instance
    if (unifiedMobileNav) {
        unifiedMobileNav.destroy();
    }
    
    // Create new instance
    unifiedMobileNav = new UnifiedMobileNav();
    // Expose globally for debugging/other scripts
    window.unifiedMobileNav = unifiedMobileNav;
}

// Theme toggle functionality for mobile
function setupMobileThemeToggle() {
    const mobileThemeToggle = document.querySelector('.mobile-theme-toggle');
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Update icon
            const icon = mobileThemeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            // Save preference
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Language toggle functionality for mobile
function setupMobileLangToggle() {
    const mobileLangToggle = document.querySelector('.mobile-lang-toggle');
    if (mobileLangToggle) {
        mobileLangToggle.addEventListener('click', () => {
            // Add your language switching logic here
            console.log('Language toggle clicked');
        });
    }
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initUnifiedMobileNav();
        setupMobileThemeToggle();
        setupMobileLangToggle();
    });
} else {
    initUnifiedMobileNav();
    setupMobileThemeToggle();
    setupMobileLangToggle();
}

// Re-initialize on window resize if needed
window.addEventListener('resize', () => {
    clearTimeout(window.mobileNavResizeTimeout);
    window.mobileNavResizeTimeout = setTimeout(() => {
        if (window.innerWidth <= 768 && (!unifiedMobileNav || !unifiedMobileNav.isInitialized)) {
            initUnifiedMobileNav();
        }
    }, 250);
});

// Ensure global reference remains accurate
window.unifiedMobileNav = unifiedMobileNav;
