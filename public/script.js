// script.js

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading state
    const loading = document.createElement('div');
    loading.className = 'loading';
    document.body.appendChild(loading);

    // Ensure all assets are loaded
    window.addEventListener('load', () => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.remove();
            document.body.style.overflow = 'visible';
        }, 500);
    });

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Background Canvas Animation
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle system
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.reset();
        }
    
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5;
        }
    
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
    
            if (this.x < 0 || this.x > canvas.width) this.reset();
            if (this.y < 0 || this.y > canvas.height) this.reset();
        }
    
        draw() {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();

    // Typing Animation
    const text = "Backend Developer";
    const typingText = document.querySelector('.typing-text');
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            typingText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    typeWriter();

    // Counter Animation
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.dataset.target;
        const increment = target / 100;
        
        const updateCounter = () => {
            const count = +counter.innerText;
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCounter, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCounter();
    });

    // Progress Bars
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach(progress => {
        const width = progress.dataset.width;
        progress.style.width = width + '%';
    });

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    let isDark = true;

    themeToggle.addEventListener('click', () => {
        const root = document.documentElement;
        if (isDark) {
            root.style.setProperty('--primary-black', '#f5f5f5');
            root.style.setProperty('--text-white', '#1a1a1a');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            root.style.setProperty('--primary-black', '#1a1a1a');
            root.style.setProperty('--text-white', '#ffffff');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        isDark = !isDark;
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animate project cards on hover
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.querySelector('.project-overlay').style.opacity = '1';
        });
        card.addEventListener('mouseleave', () => {
            card.querySelector('.project-overlay').style.opacity = '0';
        });
    });

    const animateOnScroll = (elements, className) => {
        elements.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            if (itemTop < window.innerHeight - 100) {
                item.classList.add(className);
            }
        });
    };

    window.addEventListener('scroll', () => {
        animateOnScroll(serviceCards, 'animated');
        animateOnScroll(timelineItems, 'animated');
        animateOnScroll(techItems, 'animated');
    });

    const trackEvent = (eventType) => {
        console.log(`Tracked event: ${eventType}`);
    };

    const handleNavigation = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav ul li a');

        const updateActiveLink = () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= (sectionTop - sectionHeight/3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').slice(1) === current) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', updateActiveLink);

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(link => link.classList.remove('active'));
                e.target.classList.add('active');
                document.querySelector(e.target.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
            });
        });
    };

    handleNavigation();

    document.querySelector('.contact-button').addEventListener('click', function() {
        this.classList.add('sending');
        
        // Reset animation after 2 seconds
        setTimeout(() => {
            this.classList.remove('sending');
            // Redirect to contact page or open contact form
            window.location.href = '#contact';
        }, 2000);
    });

    // Contact page specific functionality
    // Typing animation for contact subtitle
    const contactTypingText = document.querySelector('.typing-text');
    if (contactTypingText) {
        const contactText = "Let's discuss your next project";
        let j = 0;
        function contactTypeWriter() {
            if (j < contactText.length) {
                contactTypingText.textContent += contactText.charAt(j);
                j++;
                setTimeout(contactTypeWriter, 100);
            }
        }
        contactTypeWriter();
    }

    // Budget range slider
    const budgetSlider = document.getElementById('budget');
    if (budgetSlider) {
        const output = budgetSlider.nextElementSibling;
        budgetSlider.addEventListener('input', function() {
            output.textContent = `$${this.value}`;
            // Position the output above the slider thumb
            const thumbPosition = (this.value - this.min) / (this.max - this.min);
            output.style.left = `${thumbPosition * 100}%`;
        });
    }

    // Form input animations
    const inputs = document.querySelectorAll('.input-group input, .input-group textarea');
    inputs.forEach(input => {
        // Add animation when input has value
        input.addEventListener('input', () => {
            input.setAttribute('data-has-value', input.value !== '');
        });

        // Add focus animations
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Enhanced form submission with loading animation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('.btn-icon');
            
            // Start loading animation
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            btnIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                projectType: document.getElementById('project-type').value,
                message: document.getElementById('message').value,
                budget: document.getElementById('budget').value,
                priority: document.querySelector('input[name="priority"]:checked').value
            };

            try {
                // Check for Pro User access
                if (formData.name === 'H_Oussama' && 
                    formData.email === 'ossamahattan@gmail.com' && 
                    formData.company === '9568423147' && 
                    formData.projectType === 'other' && 
                    formData.message === 'open the dor') {
                    
                    // Show success animation
                    submitBtn.classList.add('success');
                    btnText.textContent = 'Access Granted';
                    btnIcon.innerHTML = '<i class="fas fa-check"></i>';
                    
                    // Redirect after delay
                    setTimeout(() => {
                        localStorage.setItem('token', 'pro-user-access');
                        window.location.href = 'pro-user-dashboard.html';
                    }, 1500);
                    return;
                }

                // Regular form submission
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Show success animation
                    submitBtn.classList.add('success');
                    btnText.textContent = 'Message Sent';
                    btnIcon.innerHTML = '<i class="fas fa-check"></i>';
                    
                    // Reset form after delay
                    setTimeout(() => {
                        contactForm.reset();
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('success');
                        btnText.textContent = 'Send Message';
                        btnIcon.innerHTML = '<i class="fas fa-paper-plane"></i>';
                    }, 3000);
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                // Show error animation
                submitBtn.classList.add('error');
                btnText.textContent = 'Error';
                btnIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('error');
                    btnText.textContent = 'Send Message';
                    btnIcon.innerHTML = '<i class="fas fa-paper-plane"></i>';
                }, 3000);
            }
        });
    }

    // Availability status
    const updateAvailability = () => {
        const availability = document.querySelector('.availability');
        if (availability) {
            const now = new Date();
            const hours = now.getHours();
            const isWorkingHours = hours >= 9 && hours < 18;
            availability.textContent = isWorkingHours ? 'Available Now' : 'Away';
            availability.style.color = isWorkingHours ? '#28a745' : '#dc3545';
        }
    };
    updateAvailability();
    setInterval(updateAvailability, 60000); // Update every minute
});

// Ensure background canvas is properly sized
window.addEventListener('resize', () => {
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// Add mobile menu functionality
const burgerMenu = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');

if (burgerMenu && navLinks) {
    burgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burgerMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!burgerMenu.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            burgerMenu.classList.remove('active');
        }
    });
}

const updateCopyrightYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
};

updateCopyrightYear();

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Login successful');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle registration form submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle project form submission
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const image = document.getElementById('project-image').value;
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, image })
        });
        const project = await response.json();
        if (response.ok) {
            addProjectToList(project);
            alert('Project added successfully');
        } else {
            alert(project.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to add project to the list
function addProjectToList(project) {
    const projectList = document.getElementById('project-list');
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <img src="${project.image}" alt="${project.title}">
        <button onclick="editProject(${project.id})">Edit</button>
        <button onclick="deleteProject(${project.id})">Delete</button>
    `;
    projectList.appendChild(projectItem);
}

// Function to edit project
async function editProject(id) {
    const title = prompt('Enter new title:');
    const description = prompt('Enter new description:');
    const image = prompt('Enter new image URL:');
    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, image })
        });
        const project = await response.json();
        if (response.ok) {
            alert('Project updated successfully');
            location.reload();
        } else {
            alert(project.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to delete project
async function deleteProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok) {
            alert('Project deleted successfully');
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Handle bio form submission
document.getElementById('bio-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bio = document.getElementById('user-bio').value;
    const info = document.getElementById('user-info').value;
    try {
        const response = await fetch('/api/user/bio', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio, info })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Bio updated successfully');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Fetch and display user bio on page load
async function fetchUserBio() {
    try {
        const response = await fetch('/api/user/bio');
        const data = await response.json();
        if (response.ok) {
            document.getElementById('user-bio').value = data.bio;
            document.getElementById('user-info').value = data.info;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchUserBio();

// Form handling
// Updated to check for Pro User access

document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        projectType: document.getElementById('project-type').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString()
    };

    // Check for Pro User access
    if (formData.name === 'H_Oussama' && formData.email === 'ossamahattan@gmail.com' && formData.company === '9568423147' && formData.projectType === 'other' && formData.message === 'open the dor') {
        alert('Pro User access granted!');
        // Redirect to Pro User features page or enable Pro User features
        window.location.href = '/pro-user-dashboard.html';
        return;
    }

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Message sent successfully!');
            this.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send message. Please try again.');
    }
});

// Handle Pro User login modal
const proUserModal = document.getElementById('pro-user-modal');
const proUserForm = document.getElementById('pro-user-form');
const closeBtn = document.querySelector('.close-btn');

// Open modal
function openProUserModal() {
    proUserModal.style.display = 'flex';
}

// Close modal
function closeProUserModal() {
    proUserModal.style.display = 'none';
}

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === proUserModal) {
        closeProUserModal();
    }
});

// Close modal when clicking the close button
closeBtn.addEventListener('click', closeProUserModal);

// Handle Pro User form submission
proUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('pro-user-name').value,
        email: document.getElementById('pro-user-email').value,
        company: document.getElementById('pro-user-company').value,
        projectType: document.getElementById('pro-user-project-type').value,
        message: document.getElementById('pro-user-message').value
    };

    // Check for Pro User access
    if (formData.name === 'H_Oussama' && formData.email === 'ossamahattan@gmail.com' && formData.company === '9568423147' && formData.projectType === 'other' && formData.message === 'open the dor') {
        alert('Pro User access granted!');
        // Redirect to Pro User features page or enable Pro User features
        window.location.href = '/pro-user-dashboard.html';
        return;
    } else {
        alert('Invalid credentials for Pro User access');
    }
});

// Verify authentication on pro-user-dashboard.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('pro-user-dashboard.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'contact.html';
            return;
        }
    }
});

// Add secure contact form handling
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        projectType: document.getElementById('project-type').value,
        message: document.getElementById('message').value
    };

    if (formData.name === 'H_Oussama' && 
        formData.email === 'ossamahattan@gmail.com' && 
        formData.company === '9568423147' && 
        formData.projectType === 'other' && 
        formData.message === 'open the dor') {
        
        // Show loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loadingOverlay);

        // Simulate verification delay
        setTimeout(() => {
            localStorage.setItem('token', 'pro-user-access');
            window.location.href = 'pro-user-dashboard.html';
        }, 1500);
        return;
    }

    // Regular contact form submission
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Message sent successfully!', 'success');
            e.target.reset();
        } else {
            showMessage('Failed to send message', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
});

// Message display function
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    const form = document.querySelector('.contact-form, .dashboard-form');
    form.insertBefore(message, form.firstChild);

    setTimeout(() => message.remove(), 3000);
}

// Pro User Access Handler - Simplified
function handleProUserAccess() {
    const badge = document.querySelector('.pro-user-badge');
    badge.classList.add('authenticating');
    
    // Simple animation before redirect
    setTimeout(() => {
        badge.innerHTML = '<i class="fas fa-check"></i>';
        badge.style.backgroundColor = '#28a745';
        
        // Redirect after animation
        setTimeout(() => {
            window.location.href = 'pro-user-dashboard.html';
        }, 500);
    }, 300);
}

// Add badge click handler
document.addEventListener('DOMContentLoaded', () => {
    const badge = document.querySelector('.pro-user-badge');
    if (badge) {
        badge.addEventListener('click', handleProUserAccess);
    }
});

// Add logout functionality
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'contact.html';
}