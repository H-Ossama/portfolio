// Simple Mobile Navigation Override
// This ensures mobile navigation works even if other scripts conflict

(function() {
    'use strict';
    
    let isMenuOpen = false;
    
    function initSimpleMobileNav() {
        const toggle = document.querySelector('.mobile-nav-toggle');
        const menu = document.querySelector('.mobile-nav-menu');
        const overlay = document.querySelector('.mobile-nav-overlay');
        
        if (!toggle || !menu || !overlay) {
            console.log('Simple Mobile Nav: Missing elements, retrying in 500ms');
            setTimeout(initSimpleMobileNav, 500);
            return;
        }
        
        console.log('Simple Mobile Nav: All elements found, initializing');
        
        // Remove any existing event listeners by cloning the toggle
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        // Add click event to new toggle
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Simple Mobile Nav: Toggle clicked');
            
            if (isMenuOpen) {
                // Close menu
                menu.classList.remove('active');
                overlay.classList.remove('active');
                newToggle.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
                console.log('Simple Mobile Nav: Menu closed');
            } else {
                // Open menu
                menu.classList.add('active');
                overlay.classList.add('active');
                newToggle.classList.add('active');
                document.body.style.overflow = 'hidden';
                isMenuOpen = true;
                console.log('Simple Mobile Nav: Menu opened');
            }
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', function() {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            newToggle.classList.remove('active');
            document.body.style.overflow = '';
            isMenuOpen = false;
            console.log('Simple Mobile Nav: Menu closed via overlay');
        });
        
        // Close menu when clicking nav links
        const navLinks = menu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menu.classList.remove('active');
                overlay.classList.remove('active');
                newToggle.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
                console.log('Simple Mobile Nav: Menu closed via nav link');
            });
        });
        
        console.log('Simple Mobile Nav: Initialized successfully');
    }
    
    // Initialize after a short delay to ensure all elements are ready
    setTimeout(initSimpleMobileNav, 1000);
    
})();
