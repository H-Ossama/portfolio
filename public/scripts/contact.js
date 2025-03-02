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
    const budgetInput = document.getElementById('budget');
    const budgetOutput = form.querySelector('output[for="budget"]');

    // Update budget range display
    budgetInput.addEventListener('input', (e) => {
        budgetOutput.textContent = `$${e.target.value}`;
    });

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