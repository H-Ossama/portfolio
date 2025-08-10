// Mobile Compatibility Testing and Debug Tools
class MobileCompatibilityTester {
    constructor() {
        this.isDebugMode = window.location.search.includes('debug=true');
        this.testResults = [];
        this.init();
    }

    init() {
        if (this.isDebugMode) {
            this.createDebugPanel();
        }
        this.runTests();
        this.setupContinuousMonitoring();
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'mobile-debug-panel';
        panel.innerHTML = `
            <div class="debug-header">
                <h3>Mobile Debug Panel</h3>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="debug-content">
                <div class="debug-section">
                    <h4>Device Info</h4>
                    <div id="device-info"></div>
                </div>
                <div class="debug-section">
                    <h4>Viewport Info</h4>
                    <div id="viewport-info"></div>
                </div>
                <div class="debug-section">
                    <h4>Touch Support</h4>
                    <div id="touch-info"></div>
                </div>
                <div class="debug-section">
                    <h4>Performance</h4>
                    <div id="performance-info"></div>
                </div>
                <div class="debug-section">
                    <h4>Test Results</h4>
                    <div id="test-results"></div>
                </div>
            </div>
        `;

        const styles = `
            #mobile-debug-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 300px;
                max-height: 80vh;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                font-family: monospace;
                font-size: 12px;
                border-radius: 8px;
                z-index: 10000;
                overflow-y: auto;
                border: 2px solid #d4af37;
            }
            
            .debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: #d4af37;
                color: black;
                font-weight: bold;
            }
            
            .debug-header button {
                background: none;
                border: none;
                color: black;
                font-size: 16px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            }
            
            .debug-content {
                padding: 10px;
            }
            
            .debug-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #333;
            }
            
            .debug-section h4 {
                margin: 0 0 8px 0;
                color: #d4af37;
            }
            
            .debug-section div {
                line-height: 1.4;
            }
            
            .test-pass {
                color: #4CAF50;
            }
            
            .test-fail {
                color: #f44336;
            }
            
            .test-warning {
                color: #ff9800;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        document.body.appendChild(panel);

        this.updateDebugInfo();
    }

    updateDebugInfo() {
        // Device Info
        const deviceInfo = document.getElementById('device-info');
        if (deviceInfo) {
            deviceInfo.innerHTML = `
                User Agent: ${navigator.userAgent}<br>
                Platform: ${navigator.platform}<br>
                Screen: ${screen.width}x${screen.height}<br>
                Window: ${window.innerWidth}x${window.innerHeight}<br>
                Device Pixel Ratio: ${window.devicePixelRatio}
            `;
        }

        // Viewport Info
        const viewportInfo = document.getElementById('viewport-info');
        if (viewportInfo) {
            viewportInfo.innerHTML = `
                Inner Width: ${window.innerWidth}px<br>
                Inner Height: ${window.innerHeight}px<br>
                Outer Width: ${window.outerWidth}px<br>
                Outer Height: ${window.outerHeight}px<br>
                Orientation: ${screen.orientation ? screen.orientation.type : 'Unknown'}
            `;
        }

        // Touch Support
        const touchInfo = document.getElementById('touch-info');
        if (touchInfo) {
            touchInfo.innerHTML = `
                Touch Events: ${'ontouchstart' in window ? 'Supported' : 'Not Supported'}<br>
                Pointer Events: ${'onpointerdown' in window ? 'Supported' : 'Not Supported'}<br>
                Max Touch Points: ${navigator.maxTouchPoints || 'Unknown'}<br>
                Hover Support: ${window.matchMedia('(hover: hover)').matches ? 'Yes' : 'No'}
            `;
        }

        // Performance Info
        const performanceInfo = document.getElementById('performance-info');
        if (performanceInfo && 'memory' in performance) {
            const memory = performance.memory;
            performanceInfo.innerHTML = `
                Used JS Heap: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB<br>
                Total JS Heap: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB<br>
                JS Heap Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
            `;
        }
    }

    runTests() {
        this.testViewportMeta();
        this.testTouchTargets();
        this.testTextSizes();
        this.testMobileNavigation();
        this.testFormElements();
        this.testImageOptimization();
        this.testPerformance();
        
        if (this.isDebugMode) {
            this.displayTestResults();
        }
    }

    testViewportMeta() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const test = {
            name: 'Viewport Meta Tag',
            status: 'fail',
            message: 'Viewport meta tag not found'
        };

        if (viewportMeta) {
            const content = viewportMeta.getAttribute('content');
            if (content && content.includes('width=device-width')) {
                test.status = 'pass';
                test.message = 'Viewport meta tag properly configured';
            } else {
                test.status = 'warning';
                test.message = 'Viewport meta tag found but may not be optimal';
            }
        }

        this.testResults.push(test);
    }

    testTouchTargets() {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        let failedElements = 0;

        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const minSize = 44; // Minimum touch target size in pixels
            
            if (rect.width < minSize || rect.height < minSize) {
                failedElements++;
                if (this.isDebugMode) {
                    element.style.outline = '2px solid red';
                    element.title = `Touch target too small: ${rect.width}x${rect.height}`;
                }
            }
        });

        this.testResults.push({
            name: 'Touch Target Size',
            status: failedElements === 0 ? 'pass' : 'warning',
            message: failedElements === 0 ? 
                'All touch targets are adequate size' : 
                `${failedElements} elements have small touch targets`
        });
    }

    testTextSizes() {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        let smallTextCount = 0;

        textElements.forEach(element => {
            const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
            if (fontSize < 14) {
                smallTextCount++;
                if (this.isDebugMode) {
                    element.style.outline = '1px dashed orange';
                }
            }
        });

        this.testResults.push({
            name: 'Text Size',
            status: smallTextCount === 0 ? 'pass' : 'warning',
            message: smallTextCount === 0 ? 
                'All text is readable size' : 
                `${smallTextCount} elements have very small text`
        });
    }

    testMobileNavigation() {
        const mobileNav = document.querySelector('.mobile-nav-toggle');
        const desktopNav = document.querySelector('nav');
        
        let test = {
            name: 'Mobile Navigation',
            status: 'fail',
            message: 'Mobile navigation not implemented'
        };

        if (window.innerWidth <= 768) {
            if (mobileNav) {
                test.status = 'pass';
                test.message = 'Mobile navigation is present';
            }
        } else {
            test.status = 'pass';
            test.message = 'Desktop view - mobile nav not needed';
        }

        this.testResults.push(test);
    }

    testFormElements() {
        const inputs = document.querySelectorAll('input, textarea, select');
        let issueCount = 0;

        inputs.forEach(input => {
            const fontSize = parseFloat(window.getComputedStyle(input).fontSize);
            
            // Check for iOS zoom prevention
            if (fontSize < 16 && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
                issueCount++;
                if (this.isDebugMode) {
                    input.style.outline = '2px solid orange';
                    input.title = 'Font size too small - may cause zoom on iOS';
                }
            }
        });

        this.testResults.push({
            name: 'Form Elements',
            status: issueCount === 0 ? 'pass' : 'warning',
            message: issueCount === 0 ? 
                'Form elements are optimized' : 
                `${issueCount} form elements may cause iOS zoom`
        });
    }

    testImageOptimization() {
        const images = document.querySelectorAll('img');
        let unoptimizedCount = 0;

        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                unoptimizedCount++;
            }
            if (!img.hasAttribute('alt')) {
                unoptimizedCount++;
            }
        });

        this.testResults.push({
            name: 'Image Optimization',
            status: unoptimizedCount === 0 ? 'pass' : 'warning',
            message: unoptimizedCount === 0 ? 
                'Images are properly optimized' : 
                `${unoptimizedCount} images need optimization`
        });
    }

    testPerformance() {
        const animatedElements = document.querySelectorAll('*');
        let heavyAnimationCount = 0;

        animatedElements.forEach(element => {
            const style = window.getComputedStyle(element);
            if (style.animation !== 'none' || style.transition !== 'all 0s ease 0s') {
                const rect = element.getBoundingClientRect();
                if (rect.width > 500 || rect.height > 500) {
                    heavyAnimationCount++;
                }
            }
        });

        this.testResults.push({
            name: 'Animation Performance',
            status: heavyAnimationCount < 5 ? 'pass' : 'warning',
            message: heavyAnimationCount < 5 ? 
                'Animation performance looks good' : 
                `${heavyAnimationCount} large elements have animations`
        });
    }

    displayTestResults() {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;

        const html = this.testResults.map(test => {
            const className = test.status === 'pass' ? 'test-pass' : 
                            test.status === 'warning' ? 'test-warning' : 'test-fail';
            const icon = test.status === 'pass' ? '✓' : 
                        test.status === 'warning' ? '⚠' : '✗';
            
            return `<div class="${className}">${icon} ${test.name}: ${test.message}</div>`;
        }).join('');

        resultsContainer.innerHTML = html;
    }

    setupContinuousMonitoring() {
        // Monitor viewport changes
        window.addEventListener('resize', () => {
            if (this.isDebugMode) {
                this.updateDebugInfo();
            }
        });

        // Monitor orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.isDebugMode) {
                    this.updateDebugInfo();
                }
            }, 100);
        });

        // Monitor performance issues
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint' && entry.startTime > 2500) {
                        console.warn('Large Contentful Paint is slow:', entry.startTime);
                    }
                }
            });
            
            observer.observe({entryTypes: ['largest-contentful-paint']});
        }
    }

    // Manual test methods
    testMobileMenu() {
        if (window.mobileNav) {
            window.mobileNav.openMenu();
            setTimeout(() => {
                window.mobileNav.closeMenu();
            }, 2000);
            return true;
        }
        return false;
    }

    testThemeToggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        setTimeout(() => {
            document.documentElement.setAttribute('data-theme', currentTheme);
        }, 1000);
        return true;
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            devicePixelRatio: window.devicePixelRatio,
            testResults: this.testResults,
            recommendations: this.generateRecommendations()
        };

        console.log('Mobile Compatibility Report:', report);
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        this.testResults.forEach(test => {
            if (test.status === 'fail') {
                switch (test.name) {
                    case 'Viewport Meta Tag':
                        recommendations.push('Add proper viewport meta tag');
                        break;
                    case 'Mobile Navigation':
                        recommendations.push('Implement mobile navigation menu');
                        break;
                }
            } else if (test.status === 'warning') {
                switch (test.name) {
                    case 'Touch Target Size':
                        recommendations.push('Increase size of touch targets to at least 44px');
                        break;
                    case 'Text Size':
                        recommendations.push('Increase font size for better readability');
                        break;
                    case 'Form Elements':
                        recommendations.push('Set form input font-size to 16px to prevent iOS zoom');
                        break;
                }
            }
        });

        return recommendations;
    }
}

// Initialize tester
document.addEventListener('DOMContentLoaded', () => {
    window.mobileTester = new MobileCompatibilityTester();
    
    // Add global methods for manual testing
    window.testMobileCompatibility = () => {
        return window.mobileTester.generateReport();
    };
    
    window.toggleMobileDebug = () => {
        const panel = document.getElementById('mobile-debug-panel');
        if (panel) {
            panel.remove();
        } else {
            window.mobileTester.createDebugPanel();
        }
    };
    
    // Auto-run report after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.location.search.includes('mobile-report=true')) {
                console.log('🔍 Mobile Compatibility Report Generated');
                console.log('Run testMobileCompatibility() for detailed report');
                console.log('Add ?debug=true to URL for visual debug panel');
            }
        }, 2000);
    });
});

console.log('Mobile Compatibility Tester loaded. Add ?debug=true to URL for debug panel.');
