/**
 * Mobile Overhaul Auto-Fix
 * This script runs automatically to fix common mobile issues
 */

(function() {
    // Only run this script on mobile devices or if force-mobile is in the URL
    const isMobile = window.innerWidth <= 768 || window.location.href.includes('force-mobile');
    if (!isMobile) return;
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Mobile Overhaul Auto-Fix running...');
        
        // Fix 1: Hide problematic elements
        const elementsToHide = [
            '.particle-controls',
            '.theme-toggle:not(.mobile-theme-toggle)',
            '.lang-switch:not(.mobile-lang-toggle)',
            '.mobile-nav-toggle',
            '.mobile-nav-menu',
            '.mobile-nav-overlay',
            '.logo-container'
        ];
        
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
                console.log(`Hidden: ${selector}`);
            });
        });
        
        // Fix 2: Adjust padding for body
        document.body.style.paddingTop = 'var(--mobile-header-height)';
        
        // Fix 3: Fix hero section padding
        const heroSection = document.getElementById('home');
        if (heroSection) {
            heroSection.style.paddingTop = '0';
            heroSection.style.marginTop = '0';
            console.log('Fixed hero section padding');
        }
        
        // Fix 4: Make sure mobile elements are shown
        const mobileHeader = document.querySelector('.mobile-header');
        if (mobileHeader) {
            mobileHeader.style.display = 'flex';
            console.log('Mobile header display set to flex');
        }
        
        // Fix 5: Check if the profile card exists in the header
        setTimeout(() => {
            const mobileProfilePic = document.getElementById('mobileProfilePic');
            if (!mobileProfilePic) {
                console.error('Mobile profile pic not found, forcing re-initialization');
                if (window.mobileOverhaul) {
                    window.mobileOverhaul.setupMobileHeader();
                    window.mobileOverhaul.setupMobileDrawer();
                    window.mobileOverhaul.setupProfileDropdown();
                    window.mobileOverhaul.bindEvents();
                }
            }
        }, 500);
        
        // Fix 6: Ensure proper z-index for mobile elements
        const zIndexFixes = [
            { selector: '.mobile-header', zIndex: 10001 },
            { selector: '.mobile-drawer', zIndex: 10002 },
            { selector: '.profile-dropdown', zIndex: 10003 },
            { selector: '.mobile-backdrop', zIndex: 10000 }
        ];
        
        zIndexFixes.forEach(({selector, zIndex}) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.zIndex = zIndex;
                console.log(`Set z-index ${zIndex} for ${selector}`);
            }
        });
        
        console.log('Mobile Overhaul Auto-Fix complete');
    });
})();
