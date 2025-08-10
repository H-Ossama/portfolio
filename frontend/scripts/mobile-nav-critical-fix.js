// Simple Mobile Navigation Fix
// Ensures mobile navigation drawer works reliably on all screen sizes

(function() {
    'use strict';
    
    console.log('Simple Mobile Navigation Fix loaded');
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Simple Mobile Navigation Fix initializing');
        
        // Get elements
        const navMenu = document.querySelector('.mobile-nav-menu');
        const navOverlay = document.querySelector('.mobile-nav-overlay');
        const openButton = document.querySelector('.open-drawer-toggle');
        const closeButton = document.querySelector('.mobile-nav-toggle');
        
        // Check if elements exist
        if (!navMenu || !navOverlay || !openButton) {
            console.error('Simple Mobile Navigation Fix: Required elements not found');
            return;
        }
        
        console.log('Simple Mobile Navigation Fix: Found all required elements');
        
        // Open menu function
        function openMenu() {
            console.log('Opening menu');
            navMenu.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
        
        // Close menu function
        function closeMenu() {
            console.log('Closing menu');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
        
        // Add event listeners
        openButton.addEventListener('click', function(e) {
            e.preventDefault();
            openMenu();
        });
        
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                closeMenu();
            });
        }
        
        navOverlay.addEventListener('click', closeMenu);
        
        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.mobile-nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Debug info
        console.log('Window width:', window.innerWidth);
        if (window.innerWidth <= 768) {
            console.log('Mobile view detected');
        }
        
        console.log('Simple Mobile Navigation Fix initialized');
    });
})();
