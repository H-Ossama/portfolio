// script.js

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Create the background canvas
    // ... (rest of the canvas animation code)

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
});

const updateCopyrightYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
};

updateCopyrightYear();