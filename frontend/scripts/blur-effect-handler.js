/**
 * Enhanced blur effect for bottom navigation on scroll
 * This script creates a dynamic blur effect that allows content to appear
 * through the navigation as the user scrolls
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get bottom navigation
    const bottomNav = document.querySelector('nav:not(.drawer-nav):not(.mobile-nav-menu)');
    
    if (!bottomNav) return; // Exit if not present
    
    // Track scroll direction
    let lastScrollTop = 0;
    let isScrollingDown = true;
    
    // Create an observer to detect when elements are behind the nav
    const createIntersectionObserver = () => {
        // Get elements that might pass behind the navbar
        const potentialElements = document.querySelectorAll('.section-title, h2, .project-card, .skill-card, .education-item, button.primary-button, button.secondary-button, img');
        
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Element is visible - check if it's close to the navbar
                    const elementRect = entry.target.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const distanceFromBottom = viewportHeight - elementRect.bottom;
                    
                    // If element is near the bottom where navbar is
                    if (distanceFromBottom < 100 && distanceFromBottom > -100) {
                        // Reduce blur to show element through
                        bottomNav.classList.add('reduced-blur');
                        setTimeout(() => {
                            bottomNav.classList.remove('reduced-blur');
                        }, 1200); // Remove after element passes
                    }
                }
            });
        }, options);
        
        // Observe all potential elements
        potentialElements.forEach(element => {
            observer.observe(element);
        });
    };
    
    // Handle scroll events
    function handleScroll() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Check scroll direction
        isScrollingDown = scrollPosition > lastScrollTop;
        lastScrollTop = scrollPosition;
        
        // Check if we're near the bottom of the page
        if (scrollPosition + windowHeight >= documentHeight - 100) {
            document.documentElement.classList.add('at-bottom');
        } else {
            document.documentElement.classList.remove('at-bottom');
        }
        
        // Calculate how far we've scrolled down the page (as a percentage)
        const scrollPercent = Math.min((scrollPosition / (documentHeight - windowHeight)) * 100, 100);
        
        // Base blur varies based on scroll direction
        // When scrolling down, reduce blur to let content "pass through"
        const baseBlur = isScrollingDown ? 6 : 10;
        const maxBlurAddition = isScrollingDown ? 2 : 8;
        
        // Calculate blur value
        let blurValue = baseBlur + (maxBlurAddition * (scrollPercent / 100));
        
        // If scrolling fast, temporarily reduce blur more dramatically
        const scrollSpeed = Math.abs(scrollPosition - lastScrollTop);
        if (scrollSpeed > 10 && isScrollingDown) {
            blurValue = Math.max(4, blurValue - (scrollSpeed / 10));
        }
        
        // Apply calculated blur
        bottomNav.style.backdropFilter = `blur(${blurValue}px)`;
        bottomNav.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        
        // Adjust opacity based on scroll position
        const baseOpacity = 0.5;
        const opacityAdjustment = isScrollingDown ? -0.2 : 0.2;
        const opacity = Math.min(0.75, Math.max(0.35, baseOpacity + opacityAdjustment * (scrollSpeed / 50)));
        bottomNav.style.backgroundColor = `rgba(10, 10, 10, ${opacity})`;
        
        // Add scrolled class for additional styling
        if (scrollPercent > 20) {
            bottomNav.classList.add('scrolled');
        } else {
            bottomNav.classList.remove('scrolled');
        }
    }
    
    // Listen for scroll
    window.addEventListener('scroll', handleScroll);
    
    // Initial setup
    handleScroll();
    createIntersectionObserver();
});
