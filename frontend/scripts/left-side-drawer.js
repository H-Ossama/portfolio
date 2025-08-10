// Left Side Drawer Navigation
// Controls the mobile navigation drawer that slides from the left

(function() {
    'use strict';
    
    // Track menu state
    let isMenuOpen = false;
    
    function initLeftSideDrawer() {
        // Find all required elements
        const mobileNavMenu = document.querySelector('.mobile-nav-menu');
        const mobileNavToggle = document.querySelector('.mobile-nav-menu .mobile-nav-toggle');
        const openDrawerToggle = document.querySelector('.open-drawer-toggle');
        const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        
        // Check if elements exist
        if (!mobileNavMenu || !openDrawerToggle || !mobileNavOverlay) {
            console.error('Left Side Drawer: Missing required elements');
            return;
        }
        
        console.log('Left Side Drawer: Initializing');
        
        // Open drawer from header button
        openDrawerToggle.addEventListener('click', function(e) {
            e.preventDefault();
            openMenu();
        });
        
        // Close drawer from X button inside drawer
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', function(e) {
                e.preventDefault();
                closeMenu();
            });
        }
        
        // Close when clicking overlay
        mobileNavOverlay.addEventListener('click', function() {
            closeMenu();
        });
        
        // Close when clicking nav links
        mobileNavLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });
        
        // Helper functions
        function openMenu() {
            if (isMenuOpen) return;
            
            mobileNavMenu.classList.add('active');
            mobileNavOverlay.classList.add('active');
            if (mobileNavToggle) mobileNavToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
            isMenuOpen = true;
            
            // Focus management - focus first element in drawer for accessibility
            setTimeout(function() {
                if (mobileNavToggle) mobileNavToggle.focus();
            }, 300);
        }
        
        function closeMenu() {
            if (!isMenuOpen) return;
            
            mobileNavMenu.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            if (mobileNavToggle) mobileNavToggle.classList.remove('active');
            document.body.style.overflow = '';
            isMenuOpen = false;
            
            // Return focus to header toggle for accessibility
            setTimeout(function() {
                openDrawerToggle.focus();
            }, 300);
        }
        
        // Force close on resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMenu();
            }
        });
        
        console.log('Left Side Drawer: Initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLeftSideDrawer);
    } else {
        initLeftSideDrawer();
    }
})();
