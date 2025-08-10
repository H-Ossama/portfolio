// Mobile Animation Speed Fix - JavaScript Override
// Ensures proper animation speeds on mobile devices

(function() {
    'use strict';
    
    // Detect mobile screen size
    function isMobileScreen() {
        return window.innerWidth <= 768;
    }
    
    // Detect small mobile screens
    function isSmallMobileScreen() {
        return window.innerWidth <= 674;
    }
    
    // Apply animation speed fixes
    function applyAnimationSpeedFixes() {
        if (!isMobileScreen()) return;
        
        // Get profile card and related elements
        const profileCards = document.querySelectorAll('.profile-card, .hero-profile');
        const scrollIndicator = document.querySelector('.scroll-indicator');
        const wheels = document.querySelectorAll('.scroll-indicator .wheel');
        const arrows = document.querySelectorAll('.scroll-indicator .arrows span');
        const floatingShapes = document.querySelectorAll('.floating-shapes .shape');
        const badges = document.querySelectorAll('.experience-badge');
        
        // Determine animation durations based on screen size
        const profileDuration = isSmallMobileScreen() ? '8s' : '6s';
        const scrollDuration = isSmallMobileScreen() ? '3s' : '2.5s';
        const shapeDuration = isSmallMobileScreen() ? '8s' : '6s';
        const badgeDuration = isSmallMobileScreen() ? '4s' : '3s';
        
        // Apply profile card animation speeds
        profileCards.forEach(card => {
            if (card) {
                card.style.animationDuration = profileDuration;
                card.style.animationTimingFunction = 'ease-in-out';
            }
        });
        
        // Apply scroll indicator speeds
        wheels.forEach(wheel => {
            if (wheel) {
                wheel.style.animationDuration = scrollDuration;
                wheel.style.animationTimingFunction = 'ease-in-out';
            }
        });
        
        arrows.forEach(arrow => {
            if (arrow) {
                arrow.style.animationDuration = scrollDuration;
                arrow.style.animationTimingFunction = 'ease-in-out';
            }
        });
        
        // Apply floating shapes speeds
        floatingShapes.forEach(shape => {
            if (shape) {
                shape.style.animationDuration = shapeDuration;
                shape.style.animationTimingFunction = 'ease-in-out';
            }
        });
        
        // Apply badge speeds
        badges.forEach(badge => {
            if (badge) {
                badge.style.animationDuration = badgeDuration;
                badge.style.animationTimingFunction = 'ease-in-out';
            }
        });
        
        console.log(`Mobile animation speeds applied: Profile(${profileDuration}), Scroll(${scrollDuration}), Shapes(${shapeDuration})`);
    }
    
    // Apply fixes when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyAnimationSpeedFixes);
        } else {
            applyAnimationSpeedFixes();
        }
        
        // Reapply on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(applyAnimationSpeedFixes, 300);
        });
    }
    
    // Initialize
    init();
    
    // Expose to global scope for debugging
    window.mobileAnimationSpeedFix = {
        apply: applyAnimationSpeedFixes,
        isMobile: isMobileScreen,
        isSmallMobile: isSmallMobileScreen
    };
    
})();
