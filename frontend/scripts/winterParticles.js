const winterParticlesConfig = {
    particles: {
        number: {
            value: 100,            // Increased number of particles
            density: { enable: true, value_area: 800 }
        },
        color: { 
            value: "#ffffff"      // Pure white for better visibility
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.9,           // Increased opacity
            random: true,
            anim: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.3, // Higher minimum opacity
                sync: false
            }
        },
        size: {
            value: 4,             // Slightly larger particles
            random: true,
            anim: {
                enable: true,
                speed: 1,
                minimumValue: 1,   // Larger minimum size
                sync: false
            }
        },
        line_linked: {
            enable: false
        },
        move: {
            enable: true,
            speed: 1.5,           // Slightly slower for more snow-like effect
            direction: "bottom",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "repulse"
            },
            onclick: {
                enable: false
            },
            resize: true
        },
        modes: {
            repulse: {
                distance: 100,
                duration: 0.4
            }
        }
    },
    retina_detect: true
};

// Light theme particles configuration
const lightParticlesConfig = {
    particles: {
        number: {
            value: 120,
            density: { enable: true, value_area: 800 }
        },
        color: {
            value: ["#2b6cb0", "#4299e1", "#63b3ed"]
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.6,
            random: true,
            anim: {
                enable: true,
                speed: 0.8,
                minimumValue: 0.2,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                minimumValue: 0.5,
                sync: false
            }
        },
        line_linked: {
            enable: false
        },
        move: {
            enable: true,
            speed: 2,
            direction: "bottom",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "repulse"
            },
            onclick: {
                enable: true,
                mode: "push"
            },
            resize: true
        },
        modes: {
            repulse: {
                distance: 80,
                duration: 0.4
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
};

// Rain configuration
const rainParticlesConfig = {
    particles: {
        number: {
            value: 100,
            density: { enable: true, value_area: 800 }
        },
        color: {
            value: ["#2b6cb0", "#4299e1"]
        },
        shape: {
            type: "line"
        },
        opacity: {
            value: 0.7,
            random: true,
            anim: {
                enable: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false
            }
        },
        line_linked: {
            enable: false
        },
        move: {
            enable: true,
            speed: 30,
            direction: "bottom",
            random: false,
            straight: true,
            out_mode: "out",
            bounce: false
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "repulse"
            },
            onclick: {
                enable: false
            },
            resize: true
        },
        modes: {
            repulse: {
                distance: 100,
                duration: 0.4
            }
        }
    },
    retina_detect: true
};

function createRainEffect() {
    const container = document.body;
    const rainDropsCount = 30;

    function createRainDrop() {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        
        // Randomize drop properties
        const startX = Math.random() * window.innerWidth;
        const fallDuration = Math.random() * 0.5 + 0.7; // 0.7-1.2s
        const width = Math.random() * 1 + 1; // 1-2px
        const height = Math.random() * 30 + 70; // 70-100px

        drop.style.cssText = `
            left: ${startX}px;
            width: ${width}px;
            height: ${height}px;
            animation-duration: ${fallDuration}s;
        `;

        container.appendChild(drop);

        drop.addEventListener('animationend', () => {
            createSplashEffect(startX);
            drop.remove();
        });
    }

    function createSplashEffect(x) {
        const splash = document.createElement('div');
        splash.className = 'rain-splash';
        splash.style.left = `${x}px`;
        splash.style.bottom = '0px';
        container.appendChild(splash);

        const ripple = document.createElement('div');
        ripple.className = 'rain-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.bottom = '0px';
        container.appendChild(ripple);

        setTimeout(() => {
            splash.remove();
            ripple.remove();
        }, 1000);
    }

    // Initial rain drops
    for (let i = 0; i < rainDropsCount; i++) {
        setTimeout(() => createRainDrop(), Math.random() * 2000);
    }

    // Continuous rain
    return setInterval(createRainDrop, 50);
}

let rainInterval;

function initLightParticles() {
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) {
        const container = document.createElement('div');
        container.id = 'particles-js';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '0';
        container.style.pointerEvents = 'none';
        document.body.insertBefore(container, document.body.firstChild);
    }
    
    if (window.particlesJS) {
        particlesJS('particles-js', lightParticlesConfig);
    }
}

function initSnowEffect() {
    const particlesContainer = document.getElementById('winter-particles');
    if (!particlesContainer) {
        const container = document.createElement('div');
        container.id = 'winter-particles';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '0';
        container.style.pointerEvents = 'none';
        document.body.insertBefore(container, document.body.firstChild);
    }
    
    if (window.particlesJS) {
        particlesJS('winter-particles', winterParticlesConfig);
    }
}

function removeParticles() {
    // Remove light theme particles
    const lightContainer = document.getElementById('particles-js');
    if (lightContainer) {
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom.forEach(pJSObj => {
                if (pJSObj.pJS && typeof pJSObj.pJS.fn?.vendors?.destroy === 'function') {
                    pJSObj.pJS.fn.vendors.destroy();
                }
            });
            window.pJSDom = [];
        }
        lightContainer.innerHTML = '';
        lightContainer.style.display = 'none';
    }

    // Remove winter particles
    const winterContainer = document.getElementById('winter-particles');
    if (winterContainer) {
        winterContainer.innerHTML = '';
        winterContainer.style.display = 'none';
    }
}

function initRainEffect() {
    if (window.particlesJS) {
        particlesJS('winter-particles', rainParticlesConfig);
        rainInterval = createRainEffect();
    }
}

function cleanupRainEffect() {
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS && typeof window.pJSDom[0].pJS.fn?.vendors?.destroy === 'function') {
        // Use the documented destroy method if available
        window.pJSDom[0].pJS.fn.vendors.destroy();
        window.pJSDom = [];
    } else {
        // Fallback: Remove the canvas element directly
        const particlesContainer = document.getElementById('winter-particles');
        if (particlesContainer) {
            particlesContainer.innerHTML = ''; // Clear the container
        }
    }
    if (rainInterval) {
        clearInterval(rainInterval);
    }
    document.querySelectorAll('.rain-drop, .rain-splash, .rain-ripple').forEach(el => el.remove());
}

function cleanupSnowEffect() {
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS && typeof window.pJSDom[0].pJS.fn?.vendors?.destroy === 'function') {
        // Use the documented destroy method if available
        window.pJSDom[0].pJS.fn.vendors.destroy();
        window.pJSDom = [];
    } 
    const container = document.getElementById('winter-particles');
    if (container) {
        container.innerHTML = ''; // Clear the container
        container.style.display = 'none';
    }
}