// Language state management
let translations = {};
let currentLang = localStorage.getItem('language') || 'en';

// Load translations from JSON file
async function loadTranslations() {
    try {
        const response = await fetch('./data/translations.json');
        if (!response.ok) throw new Error('Failed to load translations');
        translations = await response.json();
        await setLanguage(currentLang, false); // Apply saved language without animation
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

// Initialize language switcher UI and events
function initLanguageSwitcher() {
    const langSwitch = document.querySelector('.lang-switch');
    const langSwitchBtn = document.querySelector('.lang-switch-btn');
    const currentLangSpan = document.querySelector('.current-lang');
    const langOptions = document.querySelectorAll('.lang-option');

    if (!langSwitch || !langSwitchBtn || !currentLangSpan) return;

    // Toggle language dropdown
    langSwitchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langSwitch.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        langSwitch.classList.remove('active');
    });

    // Handle language selection
    langOptions.forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newLang = option.dataset.lang;
            if (newLang !== currentLang) {
                // First apply translations
                await setLanguage(newLang, true);
                // Then store the selection
                localStorage.setItem('language', newLang);
            }
            langSwitch.classList.remove('active');
        });
    });

    // Set initial UI state
    updateLanguageUI(currentLang);
}

// Update UI elements based on selected language
function updateLanguageUI(lang) {
    // Update text direction - German is LTR, like English and French
    document.documentElement.dir = 'ltr'; // Set to LTR by default now
    document.documentElement.setAttribute('lang', lang);
    document.body.style.direction = 'ltr'; // Set to LTR by default now
    
    // Update language display
    const currentLangSpan = document.querySelector('.current-lang');
    if (currentLangSpan) {
        currentLangSpan.textContent = lang.toUpperCase();
    }

    // Update active language button
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.lang === lang);
    });
}

// Apply translations to the page
async function setLanguage(lang, animate = true) {
    if (!translations[lang]) return;
    
    if (animate) {
        // Fade out
        document.body.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    currentLang = lang;
    updateLanguageUI(lang);

    // Update all translatable content
    updateNavigation(lang);
    updateHeroSection(lang);
    updateSections(lang);
    updateButtons(lang);
    updateProfileCard(lang);
    updateContactPage(lang);

    if (animate) {
        // Fade in
        document.body.style.opacity = '1';
    }
}

// Update specific sections
function updateNavigation(lang) {
    if (!translations[lang].nav) return;
    Object.entries(translations[lang].nav).forEach(([key, value]) => {
        // Exclude .logo-text and .portfolio-tag from translation
        const links = document.querySelectorAll(`[href="#${key}"]:not(.logo-text):not(.portfolio-tag)`);
        links.forEach(link => {
            // Skip if the link is part of the logo
            if (!link.closest('.logo') && !link.classList.contains('nav-exclude')) {
                link.textContent = value;
            }
        });
    });
}

function updateHeroSection(lang) {
    const hero = translations[lang].hero;
    if (!hero) return;

    // Update greeting
    const greeting = document.querySelector('.greeting');
    if (greeting) greeting.textContent = hero.greeting;

    // Update dynamic text items
    const dynamicTexts = document.querySelectorAll('.dynamic-text .text');
    if (dynamicTexts && hero.roles) {
        dynamicTexts.forEach((text, index) => {
            if (hero.roles[index]) {
                text.textContent = hero.roles[index];
            }
        });
    }

    // Update description
    const heroDesc = document.querySelector('.hero-description');
    if (heroDesc && hero.description) {
        heroDesc.textContent = hero.description;
    }
}

function updateSections(lang) {
    const sections = translations[lang].sections;
    if (!sections) return;

    // Update section titles and subtitles
    Object.entries(sections).forEach(([sectionId, content]) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const title = section.querySelector('.section-title');
        const subtitle = section.querySelector('.section-subtitle');

        if (title && content.title) title.textContent = content.title;
        if (subtitle && content.subtitle) subtitle.textContent = content.subtitle;

        // Update specific section content
        if (content.items) {
            updateSectionItems(section, content.items);
        }
    });
}

function updateSectionItems(section, items) {
    // Update project cards, education cards, etc.
    const itemElements = section.querySelectorAll('.project-card, .edu-card, .tech-category');
    itemElements.forEach((element, index) => {
        if (!items[index]) return;

        const title = element.querySelector('.project-title, .edu-title, .category-title');
        const description = element.querySelector('.project-description, .edu-description, .tech-description');

        if (title) title.textContent = items[index].title;
        if (description) description.textContent = items[index].description;
    });
}

function updateButtons(lang) {
    const buttons = translations[lang].buttons;
    if (!buttons) return;

    Object.entries(buttons).forEach(([className, text]) => {
        const btns = document.querySelectorAll(`.${className}`);
        btns.forEach(btn => {
            // Target the specific inner span containing the text
            const textSpan = btn.querySelector('.button-content > span'); 
            if (textSpan) {
                textSpan.textContent = text;
            } else {
                // Fallback for buttons without the specific structure
                const directSpan = btn.querySelector('span');
                if (directSpan) {
                    directSpan.textContent = text;
                } else {
                    btn.textContent = text;
                }
            }
        });
    });
}

function updateProfileCard(lang) {
    const profile = translations[lang].profile;
    if (!profile) return;

    const card = document.querySelector('.profile-card');
    if (!card) return;

    // Update profession
    const profession = card.querySelector('.profession');
    if (profession) profession.textContent = profile.profession;

    // Update info items
    const infoItems = card.querySelectorAll('.info-item');
    infoItems.forEach(item => {
        const type = item.dataset.type;
        if (!type || !profile[type]) return;

        const label = item.querySelector('.label');
        const value = item.querySelector('.value');

        if (label) label.textContent = profile[type].label;
        if (value) value.textContent = profile[type].value;
    });

    // Update stats
    const stats = card.querySelectorAll('.stat');
    stats.forEach((stat, index) => {
        if (!profile.stats || !profile.stats[index]) return;

        const label = stat.querySelector('.stat-label');
        if (label) label.textContent = profile.stats[index];
    });

    // Update contact button
    const contactBtn = card.querySelector('.contact-link span');
    if (contactBtn && profile.contactBtn) {
        contactBtn.textContent = profile.contactBtn;
    }
}

function updateContactPage(lang) {
    const contact = translations[lang].contact;
    if (!contact) return;

    // Update contact form labels and placeholders
    Object.entries(contact.form || {}).forEach(([field, content]) => {
        const input = document.querySelector(`#contact-${field}`);
        if (input) {
            if (content.label) {
                const label = document.querySelector(`label[for="contact-${field}"]`);
                if (label) label.textContent = content.label;
            }
            if (content.placeholder) {
                input.placeholder = content.placeholder;
            }
        }
    });

    // Update contact info
    const info = document.querySelector('.contact-info');
    if (info && contact.info) {
        const title = info.querySelector('h3');
        if (title) title.textContent = contact.info.title;

        const items = info.querySelectorAll('.contact-info-item');
        items.forEach((item, index) => {
            if (!contact.info.items || !contact.info.items[index]) return;
            const text = item.querySelector('span');
            if (text) text.textContent = contact.info.items[index];
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();
    initLanguageSwitcher();
});