// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI Elements
    const canvas = document.getElementById('background-canvas');
    const typingText = document.querySelector('.typing-text');
    const contactForm = document.getElementById('contact-form');
    const themeToggle = document.querySelector('.theme-toggle');
    const projectCards = document.querySelectorAll('.project-card');
    const counters = document.querySelectorAll('.counter');
    const yearElement = document.getElementById('current-year');
    const modal = document.getElementById('pro-user-modal');
    const modalForm = document.getElementById('pro-user-form');
    const modalCloseBtn = modal ? modal.querySelector('.close-btn') : null;

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
    if (canvas) {
        initCanvas(canvas);
    }

    // Pro User Modal Functionality
    if (modal && modalForm && modalCloseBtn) {
        initializeModal(modal, modalForm, modalCloseBtn);
    }

    // Typing Animation
    if (typingText) {
        initTypingAnimation(typingText);
    }

    // Contact Form
    if (contactForm) {
        initContactForm(contactForm);
    }

    // Theme Toggle
    initThemeToggle();

    // Project Cards
    if (projectCards.length > 0) {
        initProjectCards(projectCards);
    }

    // Counters
    if (counters.length > 0) {
        initCounters(counters);
    }

    // Copyright Year
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Smooth Scroll
    initSmoothScroll();

    // About Section Animations
    initAboutSection();

    // Smooth reveal of project tech stack
    const techStacks = document.querySelectorAll('.project-tech-stack');
    techStacks.forEach(stack => {
        const tags = stack.querySelectorAll('.tech-tag');
        tags.forEach((tag, index) => {
            tag.style.animationDelay = `${index * 0.1}s`;
        });
    });

    // Add mouse interaction with floating elements
    initFloatingElements();

    // Add parallax scrolling effect
    initParallaxEffect();

    // Add theme transition styles
    const style = document.createElement('style');
    style.textContent = `
        .theme-transition * {
            transition: background-color 0.3s ease,
                        color 0.3s ease,
                        border-color 0.3s ease,
                        box-shadow 0.3s ease,
                        transform 0.3s ease !important;
        }
        
        .theme-toggle-spin {
            animation: spin 0.3s ease-in-out;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});

// Helper Functions
function initCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
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
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}

function initializeModal(modal, form, closeBtn) {
    function openModal() {
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    closeBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Form submission logic here
    });
}

function initTypingAnimation(element) {
    const text = "Backend Developer";
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    
    typeWriter();
}

function initContactForm(form) {
    // Contact form initialization logic
}

// Theme Toggle with Enhanced Snow Effect
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    function loadWinterThemeCSS() {
        if (!document.getElementById('winter-theme-css')) {
            const link = document.createElement('link');
            link.id = 'winter-theme-css';
            link.rel = 'stylesheet';
            link.href = './styles/winter-theme.css';
            document.head.appendChild(link);
        }
    }

    function initSnowEffect() {
        const particlesContainer = document.getElementById('winter-particles');
        if (!particlesContainer) {
            const container = document.createElement('div');
            container.id = 'winter-particles';
            document.body.insertBefore(container, document.body.firstChild);
        }
        
        if (window.particlesJS) {
            window.particlesJS('winter-particles', winterParticlesConfig);
        }

        // Add section overlays for better snow visibility
        document.querySelectorAll('section').forEach(section => {
            if (!section.querySelector('.section-bg-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'section-bg-overlay';
                section.insertBefore(overlay, section.firstChild);
            }
        });
    }

    function removeSnowEffect() {
        const particlesContainer = document.getElementById('winter-particles');
        if (particlesContainer) {
            if (window.pJSDom && window.pJSDom[0]) {
                window.pJSDom[0].pJS.fn.vendors.destroyParticles();
                window.pJSDom = [];
            }
            particlesContainer.style.display = 'none';
        }

        // Remove section overlays
        document.querySelectorAll('.section-bg-overlay').forEach(overlay => {
            overlay.remove();
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        loadWinterThemeCSS();
        setTimeout(initSnowEffect, 100);
    }
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.classList.add('theme-transition');
        
        if (newTheme === 'light') {
            loadWinterThemeCSS();
            setTimeout(initSnowEffect, 100);
        } else {
            removeSnowEffect();
        }

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 300);
    });
}

// Update theme icon to reflect current theme
function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    if (theme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.setAttribute('title', 'Switch to Winter Theme');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('title', 'Switch to Dark Theme');
    }

    // Add animation class
    themeToggle.classList.add('theme-toggle-spin');
    setTimeout(() => {
        themeToggle.classList.remove('theme-toggle-spin');
    }, 300);
}

function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Tilt effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = -(x - centerX) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        // Reset transform on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
        
        // Add shine effect on hover
        const image = card.querySelector('.project-image');
        card.addEventListener('mousemove', (e) => {
            const rect = image.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const shine = card.querySelector('.shine') || document.createElement('div');
            shine.className = 'shine';
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`;
            
            if (!card.querySelector('.shine')) {
                image.appendChild(shine);
            }
        });
    });
}

function initCounters(counters) {
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
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const targetId = anchor.getAttribute('href');
        // Skip if href is just "#"
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    });
}

// About Section Animations
function initAboutSection() {
    // Animate stats numbers
    const stats = document.querySelectorAll('.stat-number');
    
    const animateStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.getAttribute('data-count'));
                let current = 0;
                const increment = Math.ceil(count / 50);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= count) {
                        current = count;
                        clearInterval(timer);
                    }
                    target.textContent = current;
                }, 30);
                observer.unobserve(target);
            }
        });
    };

    const statsObserver = new IntersectionObserver(animateStats, {
        threshold: 0.5
    });

    stats.forEach(stat => statsObserver.observe(stat));

    // Image tilt effect
    const imageFrame = document.querySelector('.image-frame');
    if (imageFrame) {
        imageFrame.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = imageFrame.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            
            const tiltX = (y - 0.5) * 10;
            const tiltY = (x - 0.5) * -10;
            
            imageFrame.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        imageFrame.addEventListener('mouseleave', () => {
            imageFrame.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }
}

// Add mouse interaction with floating elements
function initFloatingElements() {
    const sections = ['projects', 'about', 'technologies', 'education'];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const container = section.querySelector('.projects-container, .about-wrapper, .tech-container, .education-container');
        if (!container) return;

        section.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = section.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;

            const beforeElement = container.querySelector('::before');
            const afterElement = container.querySelector('::after');

            if (beforeElement) {
                beforeElement.style.transform = `translate(${x * 30}px, ${y * 30}px) rotate(${x * y * 10}deg)`;
            }
            if (afterElement) {
                afterElement.style.transform = `translate(${-x * 30}px, ${-y * 30}px) rotate(${-x * y * 10}deg)`;
            }

            const ambientLight = section.querySelector('.section-ambient-light');
            if (ambientLight) {
                ambientLight.style.background = `
                    radial-gradient(circle at ${e.clientX - left}px ${e.clientY - top}px, 
                    rgba(212, 175, 55, 0.05) 0%, 
                    transparent 60%)
                `;
            }
        });

        section.addEventListener('mouseleave', () => {
            const ambientLight = section.querySelector('.section-ambient-light');
            if (ambientLight) {
                ambientLight.style.background = '';
            }
        });
    });
}

// Add parallax scrolling effect
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const sections = document.querySelectorAll('.projects, .about, .technologies, .education');

        sections.forEach(section => {
            const container = section.querySelector('.projects-container, .about-wrapper, .tech-container, .education-container');
            if (!container) return;

            const speed = 0.5;
            const yPos = -(scrolled * speed);
            
            const beforeElement = container.querySelector('::before');
            const afterElement = container.querySelector('::after');

            if (beforeElement) {
                beforeElement.style.transform = `translate3d(0, ${yPos}px, 0) rotate(${yPos * 0.02}deg)`;
            }
            if (afterElement) {
                afterElement.style.transform = `translate3d(0, ${-yPos}px, 0) rotate(${-yPos * 0.02}deg)`;
            }

            const ambientLight = section.querySelector('.section-ambient-light');
            if (ambientLight) {
                ambientLight.style.transform = `translate3d(0, ${yPos * 0.3}px, 0)`;
            }
        });
    });
}

// Hero Section Animations
document.addEventListener('DOMContentLoaded', () => {
    // Dynamic text animation
    const texts = document.querySelectorAll('.dynamic-text .text');
    let currentText = 0;
    
    function animateText() {
        texts[currentText].style.display = 'none';
        currentText = (currentText + 1) % texts.length;
        texts[currentText].style.display = 'block';
    }

    setInterval(animateText, 2000);

    // Parallax effect for profile card
    const profileCard = document.querySelector('.profile-card');
    const shapes = document.querySelectorAll('.shape');

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const x = (window.innerWidth / 2 - clientX) / 50;
        const y = (window.innerHeight / 2 - clientY) / 50;

        if (profileCard) {
            profileCard.style.transform = `translate(${x}px, ${y}px) rotateY(${x}deg) rotateX(${-y}deg)`;
        }

        shapes.forEach((shape, index) => {
            const factor = (index + 1) * 0.2;
            shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });

    // Number counter animation for experience badge
    const experienceBadge = document.querySelector('.experience-badge .years');
    if (experienceBadge) {
        const targetNumber = parseInt(experienceBadge.textContent);
        let currentNumber = 0;
        
        const counter = setInterval(() => {
            if (currentNumber >= targetNumber) {
                clearInterval(counter);
            } else {
                currentNumber++;
                experienceBadge.textContent = currentNumber + '+';
            }
        }, 100);
    }

    // Smooth scroll for scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.querySelector('#projects');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Tech stack hover effect
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            item.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseout', () => {
            item.style.transform = 'translateY(0)';
        });
    });
});

// Custom cursor effect
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Add custom cursor interactions
const interactiveElements = document.querySelectorAll('a, button, .tech-item');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
    });
    
    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.hero-content > *').forEach(element => {
    observer.observe(element);
});

// Navigation behavior
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Scroll handling
    function updateNavigation() {
        const scrollPosition = window.scrollY;
        
        // Nav shrink effect
        if (scrollPosition > 50) {
            nav.classList.add('nav-shrink');
        } else {
            nav.classList.remove('nav-shrink');
        }

        // Active section tracking
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Initialize and update on events
    updateNavigation();
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateNavigation);
    });

    // Smooth scrolling with offset
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const navHeight = nav.offsetHeight;
                const targetPosition = targetSection.offsetTop - (navHeight + 20);
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Initialize theme-specific particles
function initThemeParticles() {
    const particlesContainer = document.getElementById('winter-particles');
    
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        // Initialize winter particles
        if (window.particlesJS) {
            particlesContainer.style.display = 'block';
            particlesJS('winter-particles', winterParticlesConfig);
        }
    } else {
        // Hide winter particles for dark theme
        particlesContainer.style.display = 'none';
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.fn.vendors.destroyParticles();
            window.pJSDom = [];
        }
    }
}

// Update the theme toggle function
const originalThemeToggle = initThemeToggle;
initThemeToggle = function() {
    originalThemeToggle();
    initThemeParticles();
    
    // Add particle switch on theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(initThemeParticles, 100);
        });
    }
}

// Add winter particles styles
const winterParticlesStyles = document.createElement('style');
winterParticlesStyles.textContent = `
    #winter-particles {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 0;
        pointer-events: none;
        display: none;
    }

    [data-theme="light"] #winter-particles {
        display: block;
    }
`;
document.head.appendChild(winterParticlesStyles);

// Track mouse position for theme transition effect
document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});

// Enhanced theme toggle with transition effect
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    function switchTheme(theme) {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = theme || (currentTheme === 'dark' ? 'light' : 'dark');
        
        // Add transition overlay
        root.classList.add('theme-transition');
        
        // Switch theme after short delay for smooth transition
        setTimeout(() => {
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            if (newTheme === 'light') {
                loadWinterTheme();
                initSnowEffect();
            } else {
                removeWinterEffects();
            }
            
            updateThemeIcon(newTheme);
        }, 50);

        // Remove transition class
        setTimeout(() => {
            root.classList.remove('theme-transition');
        }, 500);
    }

    themeToggle.addEventListener('click', () => switchTheme());

    // Initialize theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        switchTheme(savedTheme);
    }
}

function loadWinterTheme() {
    // Load winter theme styles if not already loaded
    ['winter-theme.css', 'winter-animations.css', 'theme-transition.css'].forEach(file => {
        if (!document.querySelector(`link[href*="${file}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `./styles/${file}`;
            document.head.appendChild(link);
        }
    });
}

function removeWinterEffects() {
    const winterOverlay = document.querySelector('.winter-overlay');
    if (winterOverlay) {
        winterOverlay.addEventListener('animationend', () => {
            winterOverlay.remove();
        });
        winterOverlay.style.animation = 'fadeOut 0.5s forwards';
    }
}

// Theme switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const root = document.documentElement;
    const winterParticles = document.getElementById('winter-particles');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Set initial theme
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        const root = document.documentElement;
        const overlay = document.querySelector('.theme-transition-overlay');

        // Show loading overlay
        overlay.classList.add('active');

        // Add transition class
        root.classList.add('theme-transition');
        
        // Wait for overlay animation
        setTimeout(() => {
            // Update theme
            root.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            // Update theme toggle icon
            const themeToggle = document.querySelector('.theme-toggle');
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

            if (theme === 'light') {
                // Initialize winter effects
                if (!document.querySelector('link[href*="winter-animations.css"]')) {
                    const winterStyles = document.createElement('link');
                    winterStyles.rel = 'stylesheet';
                    winterStyles.href = './styles/winter-animations.css';
                    document.head.appendChild(winterStyles);
                }

                initSnowEffect();
            } else {
                removeWinterEffects();
            }

            // Hide loading overlay after theme is loaded
            setTimeout(() => {
                overlay.classList.remove('active');
                root.classList.remove('theme-transition');
            }, 500);
        }, 300);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // Initialize page wrapper for rain effect
    if (!document.querySelector('.page-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'page-wrapper';
        // Move all body children into wrapper
        while (document.body.firstChild) {
            wrapper.appendChild(document.body.firstChild);
        }
        document.body.appendChild(wrapper);
    }
    
    // Set initial theme
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    function setTheme(theme) {
        root.classList.add('theme-transition');
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.setAttribute('data-tooltip', 'Switch to Rain Theme');
            cleanupRainEffect();
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.setAttribute('data-tooltip', 'Switch to Dark Theme');
            initRainEffect();
            
            // Add rain blur effect
            if (!document.querySelector('.rain-blur')) {
                const rainBlur = document.createElement('div');
                rainBlur.className = 'rain-blur';
                document.body.appendChild(rainBlur);
            }
        }

        setTimeout(() => {
            root.classList.remove('theme-transition');
        }, 500);
    }

    // Track mouse for interactive effects
    document.addEventListener('mousemove', (e) => {
        if (root.getAttribute('data-theme') === 'light') {
            const x = e.clientX;
            const y = e.clientY;
            root.style.setProperty('--mouse-x', `${x}px`);
            root.style.setProperty('--mouse-y', `${y}px`);

            // Add ripple effect on mouse move
            if (Math.random() > 0.85) { // Occasionally create ripples
                createRipple(x, y);
            }
        }
    });

    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'rain-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        document.body.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    }
});

// Add scroll progress tracking
function updateNavbarProgress() {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = Math.min((window.scrollY / windowHeight) * 100, 100);
        document.documentElement.style.setProperty('--scroll-percentage', `${scrolled}%`);
    }
}

// Add scroll event listener for progress bar
window.addEventListener('scroll', updateNavbarProgress);
window.addEventListener('resize', updateNavbarProgress);
window.addEventListener('load', updateNavbarProgress);

// Update progress when theme changes
document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    setTimeout(updateNavbarProgress, 100);
});