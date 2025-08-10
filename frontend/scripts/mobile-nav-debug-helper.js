/**
 * Mobile Navigation Debug Helper
 * Provides debugging tools for the unified mobile navigation system
 */

(function() {
    'use strict';
    
    // Debug configuration
    const DEBUG_CONFIG = {
        logPrefix: '🔧 [Mobile Nav Debug]',
        enableConsoleOutput: true,
        showElementInspector: true,
        autoCheck: true
    };
    
    // Debug state
    let debugInterval = null;
    let debugPanel = null;
    
    function log(message, type = 'info') {
        if (!DEBUG_CONFIG.enableConsoleOutput) return;
        
        const prefix = DEBUG_CONFIG.logPrefix;
        const timestamp = new Date().toLocaleTimeString();
        
        switch (type) {
            case 'error':
                console.error(`${prefix} [${timestamp}] ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} [${timestamp}] ${message}`);
                break;
            case 'success':
                console.log(`%c${prefix} [${timestamp}] ${message}`, 'color: #51cf66; font-weight: bold;');
                break;
            default:
                console.log(`%c${prefix} [${timestamp}] ${message}`, 'color: #ffd43b;');
        }
    }
    
    function checkScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = width <= 768;
        const isSmall = width <= 480;
        const isExtraSmall = width <= 320;
        
        return {
            width,
            height,
            isMobile,
            isSmall,
            isExtraSmall,
            category: isExtraSmall ? 'extra-small' : isSmall ? 'small' : isMobile ? 'mobile' : 'desktop'
        };
    }
    
    function checkElements() {
        const elements = {
            toggle: document.querySelector('.mobile-nav-toggle-unified'),
            overlay: document.querySelector('.mobile-nav-overlay'),
            menu: document.querySelector('.mobile-nav-menu'),
            oldToggles: document.querySelectorAll('.mobile-nav-toggle:not(.mobile-nav-toggle-unified)'),
            mobileHeader: document.querySelector('.mobile-header')
        };
        
        return elements;
    }
    
    function analyzeNavigation() {
        const screenInfo = checkScreenSize();
        const elements = checkElements();
        
        log(`Screen Analysis: ${screenInfo.width}x${screenInfo.height} (${screenInfo.category})`);
        
        // Check toggle button
        if (elements.toggle) {
            const rect = elements.toggle.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            const rightDistance = window.innerWidth - rect.right;
            
            log(`✅ Toggle button found and ${isVisible ? 'visible' : 'hidden'}`);
            log(`📍 Toggle position: ${rightDistance}px from right, ${rect.top}px from top`);
            
            if (elements.toggle.classList.contains('active')) {
                log(`🔓 Toggle is in active state (menu should be open)`);
            } else {
                log(`🔒 Toggle is in inactive state (menu should be closed)`);
            }
        } else {
            log(`❌ Unified toggle button not found!`, 'error');
        }
        
        // Check menu
        if (elements.menu) {
            const isActive = elements.menu.classList.contains('active');
            const transform = window.getComputedStyle(elements.menu).transform;
            log(`📋 Menu element found, active: ${isActive}`);
            log(`🎭 Menu transform: ${transform}`);
        } else {
            log(`❌ Menu element not found!`, 'error');
        }
        
        // Check overlay
        if (elements.overlay) {
            const isActive = elements.overlay.classList.contains('active');
            log(`🌫️ Overlay found, active: ${isActive}`);
        } else {
            log(`❌ Overlay not found!`, 'error');
        }
        
        // Check for conflicts
        if (elements.oldToggles.length > 0) {
            log(`⚠️ Found ${elements.oldToggles.length} old toggle button(s) - potential conflicts!`, 'warn');
        }
        
        if (elements.mobileHeader && window.getComputedStyle(elements.mobileHeader).display !== 'none') {
            log(`⚠️ Mobile header is still visible - potential conflicts!`, 'warn');
        }
        
        // Check unified nav instance
        if (window.unifiedMobileNav) {
            log(`✅ Unified mobile nav instance found`, 'success');
            log(`📊 Nav state: ${window.unifiedMobileNav.isOpen ? 'OPEN' : 'CLOSED'}`);
        } else {
            log(`❌ Unified mobile nav instance not found!`, 'error');
        }
        
        return {
            screenInfo,
            elements,
            hasConflicts: elements.oldToggles.length > 0 || (elements.mobileHeader && window.getComputedStyle(elements.mobileHeader).display !== 'none')
        };
    }
    
    function createDebugPanel() {
        if (debugPanel) return;
        
        debugPanel = document.createElement('div');
        debugPanel.id = 'mobile-nav-debug-panel';
        debugPanel.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: #fff;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 50000;
                max-width: 300px;
                border: 2px solid #d4af37;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            ">
                <div style="color: #d4af37; font-weight: bold; margin-bottom: 10px;">
                    🔧 Mobile Nav Debug
                </div>
                <div id="debug-screen-info">Screen: Checking...</div>
                <div id="debug-toggle-info">Toggle: Checking...</div>
                <div id="debug-menu-info">Menu: Checking...</div>
                <div id="debug-nav-info">Nav State: Checking...</div>
                <div style="margin-top: 10px;">
                    <button onclick="window.mobileNavDebug.testToggle()" style="
                        background: #d4af37;
                        border: none;
                        color: #000;
                        padding: 5px 10px;
                        margin: 2px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 10px;
                    ">Test Toggle</button>
                    <button onclick="window.mobileNavDebug.hidePanel()" style="
                        background: #ff4757;
                        border: none;
                        color: #fff;
                        padding: 5px 10px;
                        margin: 2px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 10px;
                    ">Hide</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(debugPanel);
    }
    
    function updateDebugPanel() {
        if (!debugPanel) return;
        
        const analysis = analyzeNavigation();
        const screenInfo = document.getElementById('debug-screen-info');
        const toggleInfo = document.getElementById('debug-toggle-info');
        const menuInfo = document.getElementById('debug-menu-info');
        const navInfo = document.getElementById('debug-nav-info');
        
        if (screenInfo) {
            screenInfo.textContent = `Screen: ${analysis.screenInfo.width}px (${analysis.screenInfo.category})`;
            screenInfo.style.color = analysis.screenInfo.isMobile ? '#51cf66' : '#ffa502';
        }
        
        if (toggleInfo) {
            toggleInfo.textContent = `Toggle: ${analysis.elements.toggle ? '✅' : '❌'}`;
            toggleInfo.style.color = analysis.elements.toggle ? '#51cf66' : '#ff4757';
        }
        
        if (menuInfo) {
            const isActive = analysis.elements.menu && analysis.elements.menu.classList.contains('active');
            menuInfo.textContent = `Menu: ${analysis.elements.menu ? '✅' : '❌'} ${isActive ? '(Open)' : '(Closed)'}`;
            menuInfo.style.color = analysis.elements.menu ? '#51cf66' : '#ff4757';
        }
        
        if (navInfo) {
            const navInstance = window.unifiedMobileNav;
            navInfo.textContent = `Nav: ${navInstance ? '✅' : '❌'} ${navInstance && navInstance.isOpen ? '(Open)' : '(Closed)'}`;
            navInfo.style.color = navInstance ? '#51cf66' : '#ff4757';
        }
    }
    
    function testToggle() {
        const toggle = document.querySelector('.mobile-nav-toggle-unified');
        if (toggle) {
            log('🧪 Testing toggle click...', 'info');
            toggle.click();
        } else {
            log('🧪 Cannot test toggle - element not found!', 'error');
        }
    }
    
    function hidePanel() {
        if (debugPanel) {
            debugPanel.remove();
            debugPanel = null;
        }
        
        if (debugInterval) {
            clearInterval(debugInterval);
            debugInterval = null;
        }
    }
    
    function startDebugging() {
        log('🚀 Starting mobile navigation debugging...', 'success');
        
        // Initial analysis
        analyzeNavigation();
        
        // Create debug panel if enabled
        if (DEBUG_CONFIG.showElementInspector) {
            createDebugPanel();
            updateDebugPanel();
        }
        
        // Auto-check if enabled
        if (DEBUG_CONFIG.autoCheck) {
            debugInterval = setInterval(() => {
                updateDebugPanel();
            }, 2000);
        }
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            setTimeout(() => {
                log('📏 Screen resized, re-analyzing...', 'info');
                analyzeNavigation();
                updateDebugPanel();
            }, 500);
        });
    }
    
    // Expose debug methods globally
    window.mobileNavDebug = {
        analyze: analyzeNavigation,
        testToggle,
        hidePanel,
        startDebugging,
        log
    };
    
    // Auto-start debugging on mobile screens
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (window.innerWidth <= 768) {
                    startDebugging();
                }
            }, 1000);
        });
    } else {
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                startDebugging();
            }
        }, 1000);
    }
    
    log('📱 Mobile Navigation Debug Helper loaded', 'success');
    
})();
