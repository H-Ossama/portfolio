document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.profile-card');
    const cardWrapper = document.querySelector('.profile-wrapper');
    const content = document.querySelector('.profile-content');
    const toggleBtn = document.querySelector('.profile-toggle-btn');

    let bounds;
    let isFlipped = false;

    function rotateToMouse(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
            x: leftX - bounds.width / 2,
            y: topY - bounds.height / 2
        }
        const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

        card.style.transform = `
            perspective(1000px)
            scale3d(1.07, 1.07, 1.07)
            rotate3d(
                ${center.y / 100},
                ${-center.x / 100},
                0,
                ${Math.log(distance) * 2}deg
            )
        `;

        content.querySelectorAll('.info-item, .stat, .contact-link').forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            const elDistance = Math.sqrt(
                (mouseX - elCenter.x) ** 2 +
                (mouseY - elCenter.y) ** 2
            );
            
            el.style.transform = `
                translateZ(${Math.log(distance) * 5}px)
                rotate3d(
                    ${(elCenter.y - mouseY) / 100},
                    ${-(elCenter.x - mouseX) / 100},
                    0,
                    ${Math.log(elDistance)}deg
                )
            `;
        });
    }

    function resetStyles() {
        card.style.transform = `
            perspective(1000px)
            scale3d(1, 1, 1)
            rotate3d(0, 0, 0, 0)
        `;
        
        content.querySelectorAll('.info-item, .stat, .contact-link').forEach(el => {
            el.style.transform = 'translateZ(20px) rotate3d(0, 0, 0, 0)';
        });
    }

    function toggleCard() {
        if (!isFlipped) {
            content.style.transform = 'rotateY(180deg)';
            toggleBtn.classList.add('flipped');
        } else {
            content.style.transform = 'rotateY(0)';
            toggleBtn.classList.remove('flipped');
        }
        isFlipped = !isFlipped;
    }

    card.addEventListener('mouseenter', () => {
        bounds = card.getBoundingClientRect();
        document.addEventListener('mousemove', rotateToMouse);
    });

    card.addEventListener('mouseleave', () => {
        document.removeEventListener('mousemove', rotateToMouse);
        resetStyles();
    });

    // Handle toggle button click
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            toggleCard();
        });
    }

    // Handle card click (but not when clicking the toggle button)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-toggle-btn')) {
            toggleCard();
        }
    });
});