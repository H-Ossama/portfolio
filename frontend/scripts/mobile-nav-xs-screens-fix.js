// Extra Small Screen Navigation Fix
// Ensures mobile navigation drawer works reliably on very small screens (<400px)

(function() {
    'use strict';
    
    console.log('XS Screen Navigation Fix loaded');
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('XS Screen Navigation Fix initializing');
        
        // Get elements
        const navMenu = document.querySelector('.mobile-nav-menu');
        const navOverlay = document.querySelector('.mobile-nav-overlay');
        const openButtons = document.querySelectorAll('.open-drawer-toggle, .mobile-nav-toggle:not(.active)');
        const closeButtons = document.querySelectorAll('.mobile-nav-toggle.active, .mobile-nav-close');
        
        // Check if elements exist
        if (!navMenu || !navOverlay) {
            console.error('XS Screen Navigation Fix: Required elements not found');
            return;
        }
        
        // Check screen size
        const isExtraSmallScreen = window.innerWidth <= 400;
        console.log('Screen width:', window.innerWidth, 'Is XS:', isExtraSmallScreen);
        
        if (!isExtraSmallScreen) {
            console.log('Not an extra small screen, XS fixes not applied');
            return;
        }
        
        console.log('XS Screen Navigation Fix: Applying extra small screen fixes');
        
        // Force create the open button if it doesn't exist
        if (openButtons.length === 0) {
            console.log('Creating hamburger button');
            const hamburgerBtn = document.createElement('button');
            hamburgerBtn.className = 'open-drawer-toggle';
            hamburgerBtn.innerHTML = `
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            `;
            document.body.appendChild(hamburgerBtn);
            
            // Add click event
            hamburgerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openMenu();
            });
        }
        
        // Open menu function with console debugging
        function openMenu() {
            console.log('Opening menu on XS screen');
            navMenu.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Add debugging info to see if the menu is actually displayed
            console.log('Menu active classes added');
            console.log('Menu visibility:', getComputedStyle(navMenu).visibility);
            console.log('Menu opacity:', getComputedStyle(navMenu).opacity);
            console.log('Menu transform:', getComputedStyle(navMenu).transform);
            console.log('Menu z-index:', getComputedStyle(navMenu).zIndex);
            
            // Force show the menu with inline styles as a last resort
            navMenu.style.cssText = 'transform: translateX(0) !important; visibility: visible !important; opacity: 1 !important; z-index: 999999 !important;';
        }
        
        // Close menu function
        function closeMenu() {
            console.log('Closing menu on XS screen');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Remove inline styles
            navMenu.style.cssText = '';
        }
        
        // Add event listeners to all open buttons
        openButtons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openMenu();
            });
        });
        
        // Add event listeners to all close buttons
        closeButtons.forEach(function(btn) {
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    closeMenu();
                });
            }
        });
        
        // Close on overlay click
        navOverlay.addEventListener('click', closeMenu);
        
        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-links a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Add a forced check after a short delay to ensure everything is working
        setTimeout(function() {
            console.log('XS Screen Navigation Fix: Checking menu state after delay');
            
            // Get all toggle buttons again (in case DOM has changed)
            const allToggles = document.querySelectorAll('.open-drawer-toggle, .mobile-nav-toggle');
            
            console.log('Found toggle buttons:', allToggles.length);
            
            // Make sure at least one is visible
            let visibleToggle = false;
            allToggles.forEach(function(toggle) {
                const style = getComputedStyle(toggle);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    visibleToggle = true;
                }
            });
            
            if (!visibleToggle) {
                console.warn('No visible toggle buttons found! Creating emergency button');
                
                // Create emergency toggle button
                const emergencyBtn = document.createElement('button');
                emergencyBtn.className = 'emergency-nav-toggle';
                emergencyBtn.innerHTML = '<i class="fas fa-bars"></i>';
                emergencyBtn.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 999999; background: #d4af37; color: #000; border: none; width: 40px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 20px;';
                document.body.appendChild(emergencyBtn);
                
                emergencyBtn.addEventListener('click', function() {
                    openMenu();
                });
            }
        }, 1000);
        
        console.log('XS Screen Navigation Fix initialized');
    });
    
    // Also check on resize
    window.addEventListener('resize', function() {
        const isExtraSmallScreen = window.innerWidth <= 400;
        console.log('Window resized. Width:', window.innerWidth, 'Is XS:', isExtraSmallScreen);
    });
})();
