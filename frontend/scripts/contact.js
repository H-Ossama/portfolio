document.addEventListener('DOMContentLoaded', function() {
    // Theme switching
    const themeToggle = document.querySelector('.theme-toggle');
    const moonIcon = themeToggle.querySelector('i');
    
    // Set initial icon state
    updateThemeIcon(document.documentElement.getAttribute('data-theme'));
    
    themeToggle.addEventListener('click', async () => {
        moonIcon.classList.add('theme-toggle-spin');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            await themeManager.transitionToLight();
            updateThemeIcon('light');
        } else {
            await themeManager.transitionToDark();
            updateThemeIcon('dark');
        }
        
        setTimeout(() => moonIcon.classList.remove('theme-toggle-spin'), 300);
    });

    function updateThemeIcon(theme) {
        moonIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Form handling
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.submit-btn');

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show apology popup
        showApologyPopup();

        // Reset form
        form.reset();
    });

    function showApologyPopup() {
        const popup = document.createElement('div');
        popup.className = 'apology-popup';
        popup.innerHTML = `
            <div class="apology-content">
                <div class="apology-header">
                    <i class="fas fa-tools"></i>
                    <h3>Maintenance Notice</h3>
                </div>
                <p>I apologize for the inconvenience. The contact form is currently undergoing maintenance.</p>
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
                <button class="close-popup">Got it</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Add animation class after a small delay
        setTimeout(() => popup.classList.add('show'), 10);

        // Close button handler
        const closeBtn = popup.querySelector('.close-popup');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        });
    }

    // Notification system
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Typing animation for subtitle
    const typingText = document.querySelector('.typing-text');
    const cursor = document.querySelector('.cursor');
    
    if (typingText && cursor) {
        const text = typingText.dataset.text;
        let charIndex = 0;
        
        function type() {
            if (charIndex < text.length) {
                typingText.textContent = text.slice(0, charIndex + 1);
                charIndex++;
                setTimeout(type, 100);
            }
        }

        // Start typing animation
        type();

        // Cursor blink animation
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }

    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true
    });

    // Check working hours and update availability status
    function updateAvailabilityStatus() {
        const now = new Date();
        const hours = now.getHours();
        const availability = document.querySelector('.availability');
        
        if (availability) {
            // Check if current time is between 9 AM and 6 PM
            const isWorkingHours = hours >= 9 && hours < 18;
            
            availability.classList.toggle('available', isWorkingHours);
            const icon = availability.querySelector('i');
            const text = availability.textContent.trim();
            
            if (isWorkingHours) {
                icon.className = 'fas fa-circle';
                availability.innerHTML = `
                    <i class="fas fa-circle"></i>
                    Available Now
                `;
            } else {
                icon.className = 'far fa-circle';
                availability.innerHTML = `
                    <i class="far fa-circle"></i>
                    Currently Unavailable
                `;
            }
        }
    }

    // Update availability status on page load
    updateAvailabilityStatus();

    // Update availability every minute
    setInterval(updateAvailabilityStatus, 60000);
});

const contactFormHandler = {
    init() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
            this.setupFormValidation();
        }
    },

    setupFormValidation() {
        const inputs = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });
    },

    validateField(field) {
        const errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            const error = document.createElement('div');
            error.className = 'error-message';
            field.parentNode.insertBefore(error, field.nextSibling);
        }

        let isValid = field.checkValidity();
        let errorMessage = '';

        if (!isValid) {
            if (field.validity.valueMissing) {
                errorMessage = `${field.name} is required`;
            } else if (field.validity.typeMismatch) {
                errorMessage = `Please enter a valid ${field.type}`;
            }
        }

        errorElement.textContent = errorMessage;
        field.classList.toggle('invalid', !isValid);
        return isValid;
    },

    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;

        // Check maintenance status first
        if (window.maintenanceHandler && window.maintenanceHandler.isInMaintenance('contact')) {
            window.maintenanceHandler.showMaintenancePopup('contact');
            return;
        }

        if (!this.validateForm(form)) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                projectType: formData.get('projectType'),
                timeline: formData.get('timeline'),
                message: formData.get('message'),
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                read: false
            };

            const response = await fetch('/api/contact', { // Changed endpoint from /api/messages
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Show success message
            this.showNotification('Message sent successfully! I will get back to you soon.', 'success');
            form.reset();

        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    },

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    contactFormHandler.init();
});