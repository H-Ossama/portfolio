// Maintenance mode handler
class MaintenanceManager {
    constructor() {
        this.state = this.loadMaintenanceState();
        this.initializeMaintenanceChecks();
    }

    loadMaintenanceState() {
        try {
            const savedSettings = localStorage.getItem('portfolioSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                return settings.maintenanceMode || {};
            }
        } catch (error) {
            console.error('Error loading maintenance state:', error);
        }
        return {};
    }

    isInMaintenance(feature) {
        this.state = this.loadMaintenanceState(); // Refresh state
        return this.state[feature]?.enabled || false;
    }

    getMaintenanceMessage(feature) {
        return this.state[feature]?.message || 'This feature is currently under maintenance.';
    }

    showMaintenancePopup(feature) {
        const message = this.getMaintenanceMessage(feature);
        const popup = document.createElement('div');
        popup.className = 'apology-popup';
        popup.innerHTML = `
            <div class="apology-content">
                <div class="apology-header">
                    <i class="fas fa-tools"></i>
                    <h3>Maintenance Notice</h3>
                </div>
                <p>${message}</p>
                <p>Please reach out to me directly at:</p>
                <div class="contact-alternatives">
                    <a href="mailto:ossamahattan@gmail.com" class="alt-contact">
                        <i class="fas fa-envelope"></i>
                        ossamahattan@gmail.com
                    </a>
                    <a href="https://www.linkedin.com/in/h-oussama/" target="_blank" class="alt-contact">
                        <i class="fab fa-linkedin"></i>
                        LinkedIn
                    </a>
                </div>
                <button class="close-popup">Close</button>
            </div>
        `;

        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('show'), 10);

        const closeBtn = popup.querySelector('.close-popup');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        });
    }

    initializeMaintenanceChecks() {
        // Contact form maintenance check
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form') && this.isInMaintenance('contact')) {
                e.preventDefault();
                this.showMaintenancePopup('contact');
            }
        }, true);

        // Theme toggle maintenance check
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle') && this.isInMaintenance('winter')) {
                e.preventDefault();
                this.showMaintenancePopup('winter');
            }
        }, true);
    }
}

// Initialize maintenance manager
window.maintenanceHandler = new MaintenanceManager();
