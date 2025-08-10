// Mobile Navigation Debug Script
// This script helps debug mobile navigation issues

(function() {
    'use strict';
    
    console.log('🔧 Mobile Navigation Debug Script Starting...');
    
    function debugMobileNav() {
        // Check if elements exist
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const mobileNavMenu = document.querySelector('.mobile-nav-menu');
        const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
        const mobileHeader = document.querySelector('.mobile-header');
        
        console.log('📱 Mobile Navigation Elements Check:');
        console.log('Toggle:', mobileNavToggle ? '✅ Found' : '❌ Missing');
        console.log('Menu:', mobileNavMenu ? '✅ Found' : '❌ Missing');
        console.log('Overlay:', mobileNavOverlay ? '✅ Found' : '❌ Missing');
        console.log('Header:', mobileHeader ? '✅ Found' : '❌ Missing');
        
        if (mobileNavToggle) {
            console.log('Toggle position:', window.getComputedStyle(mobileNavToggle).position);
            console.log('Toggle display:', window.getComputedStyle(mobileNavToggle).display);
            console.log('Toggle visibility:', window.getComputedStyle(mobileNavToggle).visibility);
            console.log('Toggle z-index:', window.getComputedStyle(mobileNavToggle).zIndex);
        }
        
        if (mobileNavMenu) {
            console.log('Menu position:', window.getComputedStyle(mobileNavMenu).position);
            console.log('Menu right:', window.getComputedStyle(mobileNavMenu).right);
            console.log('Menu transform:', window.getComputedStyle(mobileNavMenu).transform);
            console.log('Menu z-index:', window.getComputedStyle(mobileNavMenu).zIndex);
        }
        
        // Test click functionality
        if (mobileNavToggle) {
            console.log('🖱️ Adding test click listener to toggle');
            mobileNavToggle.addEventListener('click', function(e) {
                console.log('🖱️ Mobile nav toggle clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = mobileNavMenu.classList.contains('active');
                console.log('Current menu state:', isActive ? 'OPEN' : 'CLOSED');
                
                if (isActive) {
                    mobileNavMenu.classList.remove('active');
                    mobileNavOverlay.classList.remove('active');
                    mobileNavToggle.classList.remove('active');
                    console.log('🔒 Menu closed');
                } else {
                    mobileNavMenu.classList.add('active');
                    mobileNavOverlay.classList.add('active');
                    mobileNavToggle.classList.add('active');
                    console.log('🔓 Menu opened');
                }
            });
        }
        
        // Check screen size
        console.log('📱 Screen info:');
        console.log('Width:', window.innerWidth + 'px');
        console.log('Height:', window.innerHeight + 'px');
        console.log('Is mobile?', window.innerWidth <= 768 ? 'YES' : 'NO');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', debugMobileNav);
    } else {
        debugMobileNav();
    }
    
    // Re-check on resize
    window.addEventListener('resize', function() {
        console.log('📱 Screen resized to:', window.innerWidth + 'x' + window.innerHeight);
        setTimeout(debugMobileNav, 100);
    });
    
    console.log('🔧 Mobile Navigation Debug Script Loaded!');
})();
