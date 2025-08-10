// Contact Page Mobile Navigation Emergency Fix
// This ensures mobile navigation works on contact page

(function() {
    'use strict';
    
    function initMobileNav() {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const mobileNavMenu = document.querySelector('.mobile-nav-menu');
        const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
        
        if (!mobileNavToggle || !mobileNavMenu || !mobileNavOverlay) {
            console.log('Mobile navigation elements not found');
            return;
        }
        
        // Toggle mobile menu
        function toggleMobileMenu() {
            const isActive = mobileNavMenu.classList.contains('active');
            
            if (isActive) {
                mobileNavMenu.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                mobileNavToggle.classList.remove('active'); // Remove X state
                document.body.style.overflow = '';
            } else {
                mobileNavMenu.classList.add('active');
                mobileNavOverlay.classList.add('active');
                mobileNavToggle.classList.add('active'); // Add X state
                document.body.style.overflow = 'hidden';
            }
        }
        
        // Close mobile menu
        function closeMobileMenu() {
            mobileNavMenu.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            mobileNavToggle.classList.remove('active'); // Remove X state
            document.body.style.overflow = '';
        }
        
        // Event listeners
        mobileNavToggle.addEventListener('click', toggleMobileMenu);
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
        
        // Close menu when clicking on nav links
        const navLinks = mobileNavMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });
        
        console.log('Mobile navigation initialized for contact page');
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
    
    // Force show mobile header on mobile screens
    function enforceMobileLayout() {
        if (window.innerWidth <= 768) {
            const mobileHeader = document.querySelector('.mobile-header');
            if (mobileHeader) {
                mobileHeader.style.display = 'flex';
                mobileHeader.style.visibility = 'visible';
                mobileHeader.style.opacity = '1';
            }
            
            // Hide desktop elements
            const desktopNav = document.querySelector('nav:not(.mobile-nav-menu)');
            const bottomNavbar = document.querySelector('.bottom-navbar');
            
            if (desktopNav) desktopNav.style.display = 'none';
            if (bottomNavbar) bottomNavbar.style.display = 'none';
        }
    }
    
    // Enforce on load and resize
    window.addEventListener('load', enforceMobileLayout);
    window.addEventListener('resize', enforceMobileLayout);
    
})();
