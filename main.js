// Animaciones y detalles extra para el portafolio

document.addEventListener('DOMContentLoaded', () => {
    // --- Menú hamburguesa ---
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    hamburger?.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
        });
    });

    // --- Scroll suave al navegar por el menú ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - 60,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Estadísticas animadas ---
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(num => {
        const target = +num.dataset.target;
        let current = 0;
        const increment = Math.ceil(target / 60);
        function updateStat() {
            current += increment;
            if (current > target) current = target;
            num.textContent = current;
            if (current < target) requestAnimationFrame(updateStat);
        }
        updateStat();
    });

    // --- Microinteracciones: copiar email/discord ---
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const value = this.getAttribute('data-copy');
            navigator.clipboard.writeText(value);
            this.classList.add('copied');
            setTimeout(() => this.classList.remove('copied'), 1200);
        });
    });

    // --- Formulario de soporte (Formspree) ---
    const soporteForm = document.getElementById('soporte-form');
    const feedback = document.getElementById('form-feedback');
    if (soporteForm) {
        soporteForm.addEventListener('submit', function(e) {
            feedback.textContent = 'Enviando...';
            feedback.style.color = '#ffe066';
        });
        soporteForm.addEventListener('reset', function() {
            feedback.textContent = '';
        });
        soporteForm.addEventListener('submit', function(e) {
            setTimeout(() => {
                feedback.textContent = '¡Mensaje enviado! Pronto te responderé.';
                feedback.style.color = '#3ee9a6';
            }, 1200);
        });
    }
    // Animación de entrada para las secciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Animación de tarjetas en cascada
                const cards = entry.target.querySelectorAll('.exp-card, .proyecto-card, .galeria-card');
                cards.forEach((card, i) => {
                    card.style.transitionDelay = `${0.15 + i * 0.12}s`;
                });
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
        observer.observe(section);
    });

    // --- Animación de entrada y flotante para testimonios ---
    const testimonioCards = document.querySelectorAll('.testimonio-card');
    if (testimonioCards.length) {
        const obsTestimonios = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    obsTestimonios.unobserve(entry.target);
                    // Animación flotante en el texto del testimonio
                    const frase = entry.target.querySelector('.testimonio-frase');
                    if (frase) {
                        // Movimiento flotante suave y continuo
                        const randomX = 8 + Math.random() * 8; // px
                        const randomY = 8 + Math.random() * 8; // px
                        const randomDur = 3200 + Math.random() * 1200; // ms
                        frase.animate([
                            { transform: 'translate(0px, 0px)' },
                            { transform: `translate(${randomX}px, -${randomY}px)` },
                            { transform: `translate(-${randomX}px, ${randomY}px)` },
                            { transform: 'translate(0px, 0px)' }
                        ], {
                            duration: randomDur,
                            iterations: Infinity,
                            direction: 'alternate',
                            easing: 'ease-in-out',
                            delay: Math.random() * 1000
                        });
                    }
                }
            });
        }, { threshold: 0.15 });
        testimonioCards.forEach(card => {
            obsTestimonios.observe(card);
        });
    }

    // Animación de saludo (👋)
    const wave = document.querySelector('.wave');
    if (wave) {
        wave.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(20deg)' },
            { transform: 'rotate(-10deg)' },
            { transform: 'rotate(20deg)' },
            { transform: 'rotate(0deg)' }
        ], {
            duration: 1200,
            iterations: Infinity,
            easing: 'ease-in-out',
            delay: 500
        });
        // Efecto de brillo en el emoji
        setInterval(() => {
            wave.style.filter = 'drop-shadow(0 0 8px #ffe066)';
            setTimeout(() => wave.style.filter = '', 400);
        }, 3000);
    }

    // Botones con efecto ripple
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            circle.className = 'ripple';
            circle.style.left = `${e.offsetX}px`;
            circle.style.top = `${e.offsetY}px`;
            this.appendChild(circle);
            setTimeout(() => circle.remove(), 600);
        });
    });

    // Animación flotante para los iconos de las tarjetas
    document.querySelectorAll('.proyecto-icon, .galeria-icon, .exp-icon').forEach(icon => {
        icon.animate([
            { transform: 'translateY(0px)' },
            { transform: 'translateY(-8px)' },
            { transform: 'translateY(0px)' }
        ], {
            duration: 2200 + Math.random() * 800,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out',
            delay: Math.random() * 1000
        });
    });

    // Efecto parpadeo en el status
    const status = document.querySelector('.status');
    if (status) {
        setInterval(() => {
            status.style.filter = 'drop-shadow(0 0 8px #3ee9a6)';
            setTimeout(() => status.style.filter = '', 300);
        }, 2000);
    }

    // Animación de entrada para el avatar
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.animate([
            { filter: 'brightness(0.7) blur(2px)', opacity: 0 },
            { filter: 'brightness(1.2) blur(0)', opacity: 1 }
        ], {
            duration: 1200,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }
});
