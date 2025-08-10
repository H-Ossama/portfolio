/**
 * Bottom navigation handler script
 * Hides the bottom navigation when user scrolls to the bottom of the page
 */

document.addEventListener('DOMContentLoaded', function() {
    function checkScrollPosition() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Check if we're near the bottom of the page
        if (scrollPosition + windowHeight >= documentHeight - 100) {
            document.documentElement.classList.add('at-bottom');
        } else {
            document.documentElement.classList.remove('at-bottom');
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', checkScrollPosition);
    
    // Initial check
    checkScrollPosition();
});
