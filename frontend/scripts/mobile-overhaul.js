/**
 * Mobile Overhaul JavaScript
 * Provides complete mobile experience with profile dropdown and side drawer
 */

class MobileOverhaul {
    constructor() {
        this.isMenuOpen = false;
        this.isProfileDropdownOpen = false;
        
        // Wait for DOM to be loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupMobileHeader();
        this.setupMobileDrawer();
        this.setupProfileDropdown();
        this.bindEvents();
        
        console.log('Mobile Overhaul initialized');
    }

    setupMobileHeader() {
        // Create mobile header if it doesn't exist
        if (!document.querySelector('.mobile-header')) {
            const header = document.createElement('header');
            header.className = 'mobile-header';
            
            // Get profile image source from existing profile card
            let profileImageSrc = './assets/images/oussama.png';
            const existingProfileImg = document.querySelector('.profile-card img, .profile-frame img');
            
            if (existingProfileImg && existingProfileImg.src) {
                // If the image is a relative path, make it absolute
                if (existingProfileImg.src.indexOf('http') === 0 || existingProfileImg.src.indexOf('/') === 0) {
                    profileImageSrc = existingProfileImg.src;
                } else {
                    // Try to extract the path
                    const srcPath = existingProfileImg.src.split('/');
                    if (srcPath.length > 0) {
                        profileImageSrc = './assets/images/' + srcPath[srcPath.length - 1];
                    }
                }
            }
            
            // Get name from existing title
            const nameElement = document.querySelector('.name');
            const name = nameElement ? nameElement.textContent : 'Oussama Hattan';
            
            // Get title
            const titleElement = document.querySelector('.title');
            const title = titleElement ? titleElement.textContent : 'Backend Developer';
            
            header.innerHTML = `
                <div class="mobile-profile">
                    <div class="mobile-profile-pic" id="mobileProfilePic">
                        <img src="${profileImageSrc}" alt="${name}" onerror="this.src='./assets/images/oussama.png'">
                    </div>
                    <div class="mobile-profile-info">
                        <h3 class="mobile-name">${name.split(' ')[0]}</h3>
                        <p class="mobile-title">Developer</p>
                    </div>
                </div>
                <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu">
                    <span class="menu-line"></span>
                    <span class="menu-line"></span>
                    <span class="menu-line"></span>
                </button>
            `;
            
            // Insert at the beginning of body
            document.body.insertBefore(header, document.body.firstChild);
            
            // Add padding to the body to account for the fixed header
            document.body.style.paddingTop = 'var(--mobile-header-height)';
        }
    }

    setupMobileDrawer() {
        // Create mobile drawer if it doesn't exist
        if (!document.querySelector('.mobile-drawer')) {
            const drawer = document.createElement('nav');
            drawer.className = 'mobile-drawer';
            drawer.setAttribute('aria-label', 'Mobile navigation menu');
            
            // Get navigation links from existing nav
            const navLinks = [];
            const existingNavItems = document.querySelectorAll('nav:not(.mobile-nav-menu):not(.mobile-drawer) .nav-links li a');
            
            existingNavItems.forEach(item => {
                navLinks.push({
                    href: item.getAttribute('href'),
                    text: item.textContent.trim(),
                    icon: this.getIconForLink(item.textContent.trim())
                });
            });
            
            // If no links found, use defaults
            if (navLinks.length === 0) {
                navLinks.push(
                    { href: '#home', text: 'Home', icon: 'fas fa-home' },
                    { href: '#projects', text: 'Projects', icon: 'fas fa-folder-open' },
                    { href: '#education', text: 'Education', icon: 'fas fa-graduation-cap' },
                    { href: '#technologies', text: 'Skills', icon: 'fas fa-code' },
                    { href: '#about', text: 'About', icon: 'fas fa-user' },
                    { href: 'contact.html', text: 'Contact', icon: 'fas fa-envelope' }
                );
            }
            
            // Generate drawer HTML
            drawer.innerHTML = `
                <div class="drawer-header">
                    <h2 class="drawer-title">Navigation</h2>
                    <button class="drawer-close" id="drawerClose" aria-label="Close menu">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <nav class="drawer-nav">
                    <ul class="drawer-nav-list">
                        ${navLinks.map(link => `
                            <li class="drawer-nav-item">
                                <a href="${link.href}" class="drawer-nav-link ${link.href === '#home' ? 'active' : ''}">
                                    <i class="${link.icon} drawer-nav-icon"></i>
                                    <span class="drawer-nav-text">${link.text}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </nav>
                <div class="drawer-settings">
                    <h3 class="settings-title">Appearance</h3>
                    <div class="settings-group">
                        <button class="settings-btn" id="mobileThemeToggle">
                            <i class="fas fa-moon settings-btn-icon"></i>
                            <span class="settings-btn-text">Theme</span>
                        </button>
                        <button class="settings-btn" id="mobileParticlesToggle">
                            <i class="fas fa-snowflake settings-btn-icon"></i>
                            <span class="settings-btn-text">Particles</span>
                        </button>
                    </div>
                    
                    <h3 class="settings-title">Administration</h3>
                    <div class="settings-group">
                        <button class="settings-btn" id="mobileAdminToggle">
                            <i class="fas fa-lock settings-btn-icon"></i>
                            <span class="settings-btn-text">Admin</span>
                        </button>
                        <button class="settings-btn" id="mobileDebugToggle">
                            <i class="fas fa-bug settings-btn-icon"></i>
                            <span class="settings-btn-text">Debug</span>
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(drawer);
            
            // Create backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'mobile-backdrop';
            document.body.appendChild(backdrop);
        }
    }

    setupProfileDropdown() {
        // Create profile dropdown if it doesn't exist
        if (!document.querySelector('.profile-dropdown')) {
            const dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            
            // Get current language
            const currentLang = document.documentElement.getAttribute('lang') || 'en';
            
            dropdown.innerHTML = `
                <div class="dropdown-header">
                    <h3 class="dropdown-title">Settings</h3>
                </div>
                <div class="dropdown-options">
                    <div class="dropdown-option" id="toggleTheme">
                        <i class="fas fa-moon dropdown-option-icon"></i>
                        <span class="dropdown-option-text">Toggle Theme</span>
                    </div>
                </div>
                <div class="dropdown-header">
                    <h3 class="dropdown-title">Language</h3>
                </div>
                <div class="dropdown-language-options">
                    <button class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                    <button class="lang-option ${currentLang === 'fr' ? 'active' : ''}" data-lang="fr">FR</button>
                    <button class="lang-option ${currentLang === 'de' ? 'active' : ''}" data-lang="de">DE</button>
                </div>
            `;
            
            document.body.appendChild(dropdown);
        }
    }

    bindEvents() {
        // Mobile menu button
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleMenu());
        }
        
        // Drawer close button
        const closeBtn = document.getElementById('drawerClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeMenu());
        }
        
        // Backdrop click
        const backdrop = document.querySelector('.mobile-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                this.closeMenu();
                this.closeProfileDropdown();
            });
        }
        
        // Profile pic click
        const profilePic = document.getElementById('mobileProfilePic');
        if (profilePic) {
            profilePic.addEventListener('click', () => this.toggleProfileDropdown());
        }
        
        // Navigation links
        const navLinks = document.querySelectorAll('.drawer-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close menu for internal links
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.closeMenu();
                    this.scrollToSection(href);
                } else {
                    // Allow normal navigation for external links
                    this.closeMenu();
                }
            });
        });
        
        // Theme toggle
        const themeToggle = document.getElementById('mobileThemeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Profile dropdown theme toggle
        const dropdownThemeToggle = document.getElementById('toggleTheme');
        if (dropdownThemeToggle) {
            dropdownThemeToggle.addEventListener('click', () => {
                this.toggleTheme();
                this.closeProfileDropdown();
            });
        }
        
        // Language options
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                this.setLanguage(lang);
                langOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.closeProfileDropdown();
            });
        });
        
        // Particles toggle
        const particlesToggle = document.getElementById('mobileParticlesToggle');
        if (particlesToggle) {
            particlesToggle.addEventListener('click', () => this.toggleParticles());
        }
        
        // Admin toggle
        const adminToggle = document.getElementById('mobileAdminToggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => this.toggleAdmin());
        }
        
        // Debug toggle
        const debugToggle = document.getElementById('mobileDebugToggle');
        if (debugToggle) {
            debugToggle.addEventListener('click', () => this.toggleDebug());
        }
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
                this.closeProfileDropdown();
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 674) {
                this.closeMenu();
                this.closeProfileDropdown();
            }
        });
        
        // Update active link on scroll
        window.addEventListener('scroll', () => this.updateActiveLink());
    }

    toggleMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const drawer = document.querySelector('.mobile-drawer');
        const backdrop = document.querySelector('.mobile-backdrop');
        
        if (this.isMenuOpen) {
            menuBtn?.classList.remove('active');
            drawer?.classList.remove('active');
            backdrop?.classList.remove('active');
            document.body.classList.remove('no-scroll');
            this.isMenuOpen = false;
        } else {
            menuBtn?.classList.add('active');
            drawer?.classList.add('active');
            backdrop?.classList.add('active');
            document.body.classList.add('no-scroll');
            this.closeProfileDropdown();
            this.isMenuOpen = true;
        }
    }

    closeMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const drawer = document.querySelector('.mobile-drawer');
        const backdrop = document.querySelector('.mobile-backdrop');
        
        menuBtn?.classList.remove('active');
        drawer?.classList.remove('active');
        backdrop?.classList.remove('active');
        document.body.classList.remove('no-scroll');
        this.isMenuOpen = false;
    }

    toggleProfileDropdown() {
        const dropdown = document.querySelector('.profile-dropdown');
        const backdrop = document.querySelector('.mobile-backdrop');
        
        if (this.isProfileDropdownOpen) {
            dropdown?.classList.remove('active');
            backdrop?.classList.remove('active');
            this.isProfileDropdownOpen = false;
        } else {
            dropdown?.classList.add('active');
            backdrop?.classList.add('active');
            this.closeMenu();
            this.isProfileDropdownOpen = true;
        }
    }

    closeProfileDropdown() {
        const dropdown = document.querySelector('.profile-dropdown');
        
        if (this.isProfileDropdownOpen) {
            dropdown?.classList.remove('active');
            if (!this.isMenuOpen) {
                document.querySelector('.mobile-backdrop')?.classList.remove('active');
            }
            this.isProfileDropdownOpen = false;
        }
    }

    scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            const headerOffset = 70; // Account for mobile header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateActiveLink() {
        const sections = ['home', 'projects', 'education', 'technologies', 'about'];
        const scrollPosition = window.scrollY + 100;
        
        // Find the current section
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]) || document.querySelector(`.${sections[i]}`);
            if (section && section.offsetTop <= scrollPosition) {
                // Update active link
                const links = document.querySelectorAll('.drawer-nav-link');
                links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sections[i]}`) {
                        link.classList.add('active');
                    }
                });
                break;
            }
        }
    }

    toggleTheme() {
        // Find and trigger the main theme toggle
        const mainThemeToggle = document.querySelector('.theme-toggle');
        if (mainThemeToggle) {
            // Simulate click on main theme toggle
            mainThemeToggle.click();
        } else {
            // Fallback theme toggle
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            
            // Update theme toggle icon
            const toggleIcon = document.querySelector('#mobileThemeToggle i');
            if (toggleIcon) {
                toggleIcon.className = `fas fa-${newTheme === 'dark' ? 'sun' : 'moon'} settings-btn-icon`;
            }
            
            // Update dropdown theme icon
            const dropdownIcon = document.querySelector('#toggleTheme i');
            if (dropdownIcon) {
                dropdownIcon.className = `fas fa-${newTheme === 'dark' ? 'sun' : 'moon'} dropdown-option-icon`;
            }
        }
    }

    setLanguage(lang) {
        // Try to find and trigger existing language switch
        const langButtons = document.querySelectorAll('.lang-option[data-lang]');
        langButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.click();
            }
        });
        
        // Fallback: manually set language
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('portfolio-language', lang);
        
        // If there's a language system in the site, try to access it
        if (window.LanguageManager && typeof window.LanguageManager.setLanguage === 'function') {
            window.LanguageManager.setLanguage(lang);
        }
    }

    toggleParticles() {
        // Find particles container
        const particles = document.getElementById('particles-js') || document.getElementById('winter-particles');
        
        if (particles) {
            if (particles.style.display === 'none') {
                particles.style.display = 'block';
            } else {
                particles.style.display = 'none';
            }
        }
        
        // Try to find and trigger existing particles toggle if available
        const particlesToggle = document.querySelector('.particles-toggle');
        if (particlesToggle) {
            particlesToggle.click();
        }
    }

    toggleAdmin() {
        // Try to find and trigger admin button/link
        const adminBtn = document.querySelector('[data-admin], .admin-toggle, #adminToggle');
        if (adminBtn) {
            adminBtn.click();
        }
    }

    toggleDebug() {
        // Toggle debug mode by adding query parameter
        const url = new URL(window.location.href);
        if (url.searchParams.has('debug')) {
            url.searchParams.delete('debug');
        } else {
            url.searchParams.set('debug', 'true');
        }
        window.location.href = url.toString();
    }

    getIconForLink(text) {
        // Map navigation text to Font Awesome icons
        const iconMap = {
            'Home': 'fas fa-home',
            'Projects': 'fas fa-folder-open',
            'Education': 'fas fa-graduation-cap',
            'Skills': 'fas fa-code',
            'Technologies': 'fas fa-laptop-code',
            'About': 'fas fa-user',
            'Contact': 'fas fa-envelope',
            'Blog': 'fas fa-blog',
            'Services': 'fas fa-concierge-bell',
            'Portfolio': 'fas fa-briefcase',
            'Gallery': 'fas fa-images',
            'Team': 'fas fa-users',
            'Testimonials': 'fas fa-quote-right',
            'FAQ': 'fas fa-question-circle',
            'Pricing': 'fas fa-tags',
        };
        
        return iconMap[text] || 'fas fa-link';
    }
}

// Initialize the mobile overhaul
let mobileOverhaul;

// Wait for DOM content to be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mobileOverhaul = new MobileOverhaul();
    });
} else {
    mobileOverhaul = new MobileOverhaul();
}

// Make it available globally
window.mobileOverhaul = mobileOverhaul;
