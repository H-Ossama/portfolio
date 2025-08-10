// Mobile Performance Optimizations
class MobilePerformanceOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.init();
    }

    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        if (this.isMobile) {
            this.optimizeAnimations();
            this.optimizeParticles();
            this.optimizeImages();
            this.preventZoom();
            this.optimizeScrolling();
            this.handleNetworkOptimization();
            this.addMobileSpecificEvents();
        }
    }

    optimizeAnimations() {
        // Reduce animation complexity on mobile
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (max-width: 768px) {
                * {
                    animation-duration: 0.3s !important;
                    transition-duration: 0.3s !important;
                }
                
                .floating-shapes,
                .snow-particles,
                .winter-particles {
                    display: none !important;
                }
                
                .section-ambient-light {
                    opacity: 0.3 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    optimizeParticles() {
        // Reduce particle count and complexity
        if (window.particlesJS) {
            const originalParticles = window.particlesJS;
            window.particlesJS = function(id, config) {
                if (window.innerWidth <= 768) {
                    // Reduce particle count for mobile
                    if (config && config.particles && config.particles.number) {
                        config.particles.number.value = Math.min(config.particles.number.value, 30);
                    }
                    // Simplify particle movements
                    if (config && config.particles && config.particles.move) {
                        config.particles.move.speed = Math.min(config.particles.move.speed, 2);
                    }
                }
                return originalParticles(id, config);
            };
        }
    }

    optimizeImages() {
        // Add loading optimization for images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading attribute
            img.setAttribute('loading', 'lazy');
            
            // Add size attributes if missing
            if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
                img.style.aspectRatio = '16/9'; // Default aspect ratio
            }
            
            // Optimize image loading
            if (img.src && !img.complete) {
                img.addEventListener('load', function() {
                    this.style.opacity = '1';
                }, { once: true });
                
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
            }
        });
    }

    preventZoom() {
        // Prevent accidental zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Prevent zoom on form inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.getAttribute('type') !== 'range') {
                input.style.fontSize = '16px'; // Prevents zoom on iOS
            }
        });
    }

    optimizeScrolling() {
        // Optimize scroll performance
        let ticking = false;
        
        function updateScrollPosition() {
            // Throttle scroll events
            ticking = false;
        }
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }, { passive: true });

        // Add momentum scrolling for iOS
        document.body.style.webkitOverflowScrolling = 'touch';
    }

    handleNetworkOptimization() {
        // Check connection type and adapt content
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Disable heavy animations and effects
                this.disableHeavyEffects();
            }
            
            // Listen for connection changes
            connection.addEventListener('change', () => {
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    this.disableHeavyEffects();
                }
            });
        }
    }

    disableHeavyEffects() {
        // Disable resource-intensive effects
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.style.display = 'none';
        }

        const winterParticles = document.getElementById('winter-particles');
        if (winterParticles) {
            winterParticles.style.display = 'none';
        }

        // Disable complex animations
        const style = document.createElement('style');
        style.textContent = `
            .profile-card,
            .project-card,
            .tech-item {
                animation: none !important;
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    addMobileSpecificEvents() {
        // Add touch-specific event handlers
        this.handleTouchFeedback();
        this.handleOrientationChange();
        this.handleViewportChanges();
    }

    handleTouchFeedback() {
        // Add visual feedback for touch interactions
        const touchElements = document.querySelectorAll('button, a, .cta-button, .project-card');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        });

        // Add CSS for touch feedback
        const style = document.createElement('style');
        style.textContent = `
            .touch-active {
                opacity: 0.7 !important;
                transform: scale(0.98) !important;
                transition: all 0.1s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Recalculate viewport height
            setTimeout(() => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
                
                // Trigger a reflow to fix any layout issues
                document.body.style.display = 'none';
                document.body.offsetHeight; // Trigger reflow
                document.body.style.display = '';
            }, 100);
        });
    }

    handleViewportChanges() {
        // Handle dynamic viewport changes (virtual keyboard, etc.)
        const initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentViewportHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentViewportHeight;
            
            // If significant height change (likely keyboard)
            if (heightDifference > 150) {
                document.body.classList.add('keyboard-open');
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });

        // Add CSS for keyboard handling
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-open {
                position: fixed;
                width: 100%;
            }
            
            .keyboard-open .mobile-nav-menu {
                height: 100vh;
                height: calc(100vh - env(keyboard-inset-height, 0px));
            }
        `;
        document.head.appendChild(style);
    }
}

// Font Loading Optimization
class FontOptimizer {
    constructor() {
        this.optimizeFonts();
    }

    optimizeFonts() {
        // Add font-display: swap for better performance
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'FontAwesome';
                font-display: swap;
            }
            
            body {
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }
}

// Memory Management for Mobile
class MobileMemoryManager {
    constructor() {
        this.init();
    }

    init() {
        this.cleanupUnusedElements();
        this.optimizeEventListeners();
        this.handleMemoryWarnings();
    }

    cleanupUnusedElements() {
        // Remove unused elements on mobile
        if (window.innerWidth <= 768) {
            const elementsToRemove = [
                '.desktop-only',
                '.large-screen-only'
            ];
            
            elementsToRemove.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
        }
    }

    optimizeEventListeners() {
        // Use passive listeners where possible
        const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];
        
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (passiveEvents.includes(type) && typeof options !== 'object') {
                options = { passive: true };
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
    }

    handleMemoryWarnings() {
        // Handle memory pressure warnings
        if ('memory' in performance) {
            const checkMemory = () => {
                const memInfo = performance.memory;
                const memoryUsage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
                
                if (memoryUsage > 0.8) {
                    // High memory usage - cleanup
                    this.performMemoryCleanup();
                }
            };
            
            // Check memory every 30 seconds
            setInterval(checkMemory, 30000);
        }
    }

    performMemoryCleanup() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear any cached data
        if (window.portfolioCache) {
            window.portfolioCache.clear();
        }
        
        console.log('Mobile memory cleanup performed');
    }
}

// Battery Optimization
class BatteryOptimizer {
    constructor() {
        this.init();
    }

    async init() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                this.optimizeForBattery(battery);
                
                battery.addEventListener('levelchange', () => {
                    this.optimizeForBattery(battery);
                });
            } catch (error) {
                console.log('Battery API not available');
            }
        }
    }

    optimizeForBattery(battery) {
        if (battery.level < 0.2) {
            // Low battery - reduce animations and effects
            this.enablePowerSaveMode();
        } else if (battery.level > 0.5) {
            // Good battery - enable full experience
            this.disablePowerSaveMode();
        }
    }

    enablePowerSaveMode() {
        document.body.classList.add('power-save-mode');
        
        // Add CSS for power save mode
        if (!document.getElementById('power-save-styles')) {
            const style = document.createElement('style');
            style.id = 'power-save-styles';
            style.textContent = `
                .power-save-mode * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
                
                .power-save-mode #particles-js,
                .power-save-mode .floating-shapes,
                .power-save-mode .snow-particles {
                    display: none !important;
                }
                
                .power-save-mode .section-ambient-light {
                    opacity: 0 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    disablePowerSaveMode() {
        document.body.classList.remove('power-save-mode');
    }
}

// Initialize all mobile optimizations
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Only run on mobile devices
        if (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            new MobilePerformanceOptimizer();
            new FontOptimizer();
            new MobileMemoryManager();
            new BatteryOptimizer();
            
            console.log('Mobile performance optimizations initialized');
        }
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MobilePerformanceOptimizer,
        FontOptimizer,
        MobileMemoryManager,
        BatteryOptimizer
    };
}
