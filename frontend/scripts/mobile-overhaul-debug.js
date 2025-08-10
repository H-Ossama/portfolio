/**
 * Mobile Overhaul Debug Script
 * Helps test and debug the mobile overhaul functionality
 */

// Function to test mobile detection
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (navigator.userAgent.match(/Android/i)) || 
           (navigator.userAgent.match(/webOS/i)) || 
           (navigator.userAgent.match(/iPhone/i)) || 
           (navigator.userAgent.match(/iPad/i)) || 
           (navigator.userAgent.match(/iPod/i)) || 
           (navigator.userAgent.match(/BlackBerry/i)) || 
           (navigator.userAgent.match(/Windows Phone/i));
}

// Create debug panel
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.className = 'mobile-debug-panel';
    debugPanel.innerHTML = `
        <div class="debug-header">
            <h3>Mobile Overhaul Debug</h3>
            <button class="debug-close-btn">×</button>
        </div>
        <div class="debug-content">
            <div class="debug-section">
                <h4>Device Info</h4>
                <div class="debug-info">
                    <div>Width: <span id="debug-width">${window.innerWidth}px</span></div>
                    <div>Height: <span id="debug-height">${window.innerHeight}px</span></div>
                    <div>User Agent: <span id="debug-ua">${navigator.userAgent.substring(0, 50)}...</span></div>
                    <div>Is Mobile: <span id="debug-is-mobile">${isMobileDevice()}</span></div>
                </div>
            </div>
            <div class="debug-section">
                <h4>Component Status</h4>
                <div class="debug-info">
                    <div>Mobile Header: <span id="debug-header">Not tested</span></div>
                    <div>Drawer Menu: <span id="debug-drawer">Not tested</span></div>
                    <div>Profile Dropdown: <span id="debug-dropdown">Not tested</span></div>
                </div>
            </div>
            <div class="debug-section">
                <h4>Element Visibility</h4>
                <div class="debug-toggle-list">
                    <label class="debug-toggle">
                        <input type="checkbox" id="debug-toggle-header">
                        <span class="toggle-label">Toggle Header</span>
                    </label>
                    <label class="debug-toggle">
                        <input type="checkbox" id="debug-toggle-drawer">
                        <span class="toggle-label">Toggle Drawer</span>
                    </label>
                    <label class="debug-toggle">
                        <input type="checkbox" id="debug-toggle-dropdown">
                        <span class="toggle-label">Toggle Dropdown</span>
                    </label>
                    <label class="debug-toggle">
                        <input type="checkbox" id="debug-toggle-backdrop">
                        <span class="toggle-label">Toggle Backdrop</span>
                    </label>
                </div>
            </div>
            <div class="debug-section">
                <h4>Actions</h4>
                <div class="debug-actions">
                    <button id="debug-force-mobile">Force Mobile Mode</button>
                    <button id="debug-reset-mobile">Reset Mobile Mode</button>
                    <button id="debug-reload">Reload Page</button>
                </div>
            </div>
            <div class="debug-section">
                <h4>Log</h4>
                <div class="debug-log" id="debug-log"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Add styles
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .mobile-debug-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.85);
            color: #fff;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            overflow: hidden;
            font-family: monospace;
            font-size: 12px;
            display: flex;
            flex-direction: column;
        }
        
        .debug-header {
            background: #1e1e1e;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
        }
        
        .debug-header h3 {
            margin: 0;
            font-size: 14px;
            color: #3498db;
        }
        
        .debug-close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
        }
        
        .debug-content {
            padding: 10px;
            overflow-y: auto;
            flex-grow: 1;
        }
        
        .debug-section {
            margin-bottom: 15px;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
        }
        
        .debug-section h4 {
            margin: 0 0 10px 0;
            color: #f1c40f;
            font-size: 13px;
        }
        
        .debug-info {
            display: grid;
            grid-template-columns: 1fr;
            gap: 5px;
        }
        
        .debug-info div {
            display: flex;
            justify-content: space-between;
        }
        
        .debug-info span {
            color: #2ecc71;
        }
        
        .debug-toggle-list {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
        }
        
        .debug-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }
        
        .debug-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        
        .debug-actions button {
            background: #2c3e50;
            border: none;
            color: #fff;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-family: monospace;
            transition: background 0.2s;
        }
        
        .debug-actions button:hover {
            background: #3498db;
        }
        
        #debug-force-mobile {
            grid-column: 1 / 2;
        }
        
        #debug-reset-mobile {
            grid-column: 2 / 3;
        }
        
        #debug-reload {
            grid-column: 1 / 3;
            margin-top: 5px;
            background: #e74c3c;
        }
        
        .debug-log {
            background: #1e1e1e;
            padding: 5px;
            border-radius: 4px;
            max-height: 100px;
            overflow-y: auto;
            font-size: 11px;
            line-height: 1.4;
        }
        
        .log-entry {
            margin-bottom: 3px;
            border-bottom: 1px dashed #333;
            padding-bottom: 3px;
        }
        
        .log-time {
            color: #95a5a6;
        }
        
        .log-message {
            color: #ecf0f1;
        }
        
        .log-error {
            color: #e74c3c;
        }
        
        .log-success {
            color: #2ecc71;
        }
    `;
    document.head.appendChild(styleEl);
    
    // Bind events
    document.querySelector('.debug-close-btn').addEventListener('click', () => {
        debugPanel.style.display = 'none';
    });
    
    // Toggle header
    document.getElementById('debug-toggle-header').addEventListener('change', (e) => {
        const header = document.querySelector('.mobile-header');
        if (header) {
            header.style.display = e.target.checked ? 'none' : 'flex';
            logDebugMessage(`Mobile header ${e.target.checked ? 'hidden' : 'shown'}`);
        } else {
            logDebugMessage('Mobile header not found', true);
        }
    });
    
    // Toggle drawer
    document.getElementById('debug-toggle-drawer').addEventListener('change', (e) => {
        const drawer = document.querySelector('.mobile-drawer');
        if (drawer) {
            drawer.style.display = e.target.checked ? 'block' : 'none';
            logDebugMessage(`Mobile drawer ${e.target.checked ? 'shown' : 'hidden'}`);
            if (e.target.checked) {
                drawer.classList.add('active');
            } else {
                drawer.classList.remove('active');
            }
        } else {
            logDebugMessage('Mobile drawer not found', true);
        }
    });
    
    // Toggle dropdown
    document.getElementById('debug-toggle-dropdown').addEventListener('change', (e) => {
        const dropdown = document.querySelector('.profile-dropdown');
        if (dropdown) {
            dropdown.style.display = e.target.checked ? 'block' : 'none';
            logDebugMessage(`Profile dropdown ${e.target.checked ? 'shown' : 'hidden'}`);
            if (e.target.checked) {
                dropdown.classList.add('active');
            } else {
                dropdown.classList.remove('active');
            }
        } else {
            logDebugMessage('Profile dropdown not found', true);
        }
    });
    
    // Toggle backdrop
    document.getElementById('debug-toggle-backdrop').addEventListener('change', (e) => {
        const backdrop = document.querySelector('.mobile-backdrop');
        if (backdrop) {
            backdrop.style.display = e.target.checked ? 'block' : 'none';
            logDebugMessage(`Backdrop ${e.target.checked ? 'shown' : 'hidden'}`);
            if (e.target.checked) {
                backdrop.classList.add('active');
            } else {
                backdrop.classList.remove('active');
            }
        } else {
            logDebugMessage('Backdrop not found', true);
        }
    });
    
    // Force mobile mode
    document.getElementById('debug-force-mobile').addEventListener('click', () => {
        document.body.classList.add('force-mobile');
        document.documentElement.style.setProperty('--viewport-width', '390px');
        logDebugMessage('Forced mobile mode enabled');
        checkComponents();
    });
    
    // Reset mobile mode
    document.getElementById('debug-reset-mobile').addEventListener('click', () => {
        document.body.classList.remove('force-mobile');
        document.documentElement.style.removeProperty('--viewport-width');
        logDebugMessage('Reset mobile mode');
        checkComponents();
    });
    
    // Reload page
    document.getElementById('debug-reload').addEventListener('click', () => {
        window.location.reload();
    });
    
    // Update device info on resize
    window.addEventListener('resize', updateDeviceInfo);
    
    // Add CSS for forced mobile mode
    const forceMobileStyle = document.createElement('style');
    forceMobileStyle.textContent = `
        body.force-mobile {
            max-width: var(--viewport-width, 390px);
            margin: 0 auto;
            border-left: 5px solid #e74c3c;
            border-right: 5px solid #e74c3c;
            overflow-x: hidden;
            height: 100vh;
            position: relative;
        }
        
        body.force-mobile:after {
            content: "Mobile Debug Mode: " var(--viewport-width, "390px");
            position: fixed;
            top: 0;
            right: 0;
            background: #e74c3c;
            color: white;
            padding: 5px 10px;
            font-size: 12px;
            z-index: 10001;
            font-family: monospace;
        }
    `;
    document.head.appendChild(forceMobileStyle);
    
    // Initial checks
    updateDeviceInfo();
    checkComponents();
    logDebugMessage('Debug panel initialized');
}

function updateDeviceInfo() {
    document.getElementById('debug-width').textContent = `${window.innerWidth}px`;
    document.getElementById('debug-height').textContent = `${window.innerHeight}px`;
    document.getElementById('debug-is-mobile').textContent = isMobileDevice();
}

function checkComponents() {
    // Check mobile header
    const header = document.querySelector('.mobile-header');
    const headerStatus = document.getElementById('debug-header');
    if (header) {
        headerStatus.textContent = 'Present';
        headerStatus.style.color = '#2ecc71';
    } else {
        headerStatus.textContent = 'Missing';
        headerStatus.style.color = '#e74c3c';
    }
    
    // Check drawer
    const drawer = document.querySelector('.mobile-drawer');
    const drawerStatus = document.getElementById('debug-drawer');
    if (drawer) {
        drawerStatus.textContent = 'Present';
        drawerStatus.style.color = '#2ecc71';
    } else {
        drawerStatus.textContent = 'Missing';
        drawerStatus.style.color = '#e74c3c';
    }
    
    // Check dropdown
    const dropdown = document.querySelector('.profile-dropdown');
    const dropdownStatus = document.getElementById('debug-dropdown');
    if (dropdown) {
        dropdownStatus.textContent = 'Present';
        dropdownStatus.style.color = '#2ecc71';
    } else {
        dropdownStatus.textContent = 'Missing';
        dropdownStatus.style.color = '#e74c3c';
    }
}

function logDebugMessage(message, isError = false) {
    const log = document.getElementById('debug-log');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="log-message ${isError ? 'log-error' : ''}">${message}</span>
    `;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Initialize debug panel on URL parameter ?debug-mobile=true
if (window.location.search.includes('debug-mobile=true')) {
    document.addEventListener('DOMContentLoaded', createDebugPanel);
    console.log('Mobile Overhaul Debug enabled');
}

// Export debug panel creation for direct access
window.createMobileOverhaulDebugPanel = createDebugPanel;
