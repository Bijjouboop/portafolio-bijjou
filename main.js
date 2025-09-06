// Animaciones y detalles extra para el portafolio

document.addEventListener('DOMContentLoaded', () => {
    // --- Menú hamburguesa (mejorado) ---
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    const bodyEl = document.body;
    function closeNav() {
        bodyEl.classList.remove('nav-open');
        mainNav?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
    }
    function openNav() {
        bodyEl.classList.add('nav-open');
        mainNav?.classList.add('open');
        hamburger?.setAttribute('aria-expanded', 'true');
    }
    hamburger?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bodyEl.classList.contains('nav-open')) closeNav(); else openNav();
    });
    // Close when clicking any link
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.addEventListener('click', () => closeNav());
    });
    // Close when clicking outside nav
    document.addEventListener('click', (e) => {
        if (!bodyEl.classList.contains('nav-open')) return;
        if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) closeNav();
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bodyEl.classList.contains('nav-open')) closeNav();
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

    // --- Estadísticas animadas (suaves, respetando prefers-reduced-motion) ---
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!prefersReduced) {
        statNumbers.forEach(num => {
            const target = parseInt((num.dataset.target || '0').toString().replace(/\D/g, ''), 10) || 0;
            let current = 0;
            const steps = 40;
            const increment = Math.max(1, Math.ceil(target / steps));
            function updateStat() {
                current += increment;
                if (current > target) current = target;
                num.textContent = current;
                if (current < target) requestAnimationFrame(updateStat);
            }
            // start when in viewport to avoid work offscreen
            const obs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateStat();
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.3 });
            obs.observe(num);
        });
    } else {
        // Show targets immediately if reduced motion
        statNumbers.forEach(num => num.textContent = num.dataset.target);
    }

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
    // Animación de entrada para las secciones (optimized)
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

    // --- Animación de entrada para testimonios (ligera, y solo si no reduce motion y ancho ok) ---
    const testimonioCards = document.querySelectorAll('.testimonio-card');
    if (testimonioCards.length) {
        const enableFloating = !prefersReduced && window.innerWidth > 900;
        const obsTestimonios = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    obsTestimonios.unobserve(entry.target);
                    if (enableFloating) {
                        const frase = entry.target.querySelector('.testimonio-frase');
                        if (frase) {
                            // Use CSS transform animations instead of Web Animations API for performance
                            frase.style.transition = 'transform 3s ease-in-out';
                        }
                    }
                }
            });
        }, { threshold: 0.15 });
        testimonioCards.forEach(card => obsTestimonios.observe(card));
    }

    // Animación de saludo (👋) — ligera y opcional
    const wave = document.querySelector('.wave');
    if (wave && !prefersReduced && window.innerWidth > 700) {
        wave.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(16deg)' },
            { transform: 'rotate(-8deg)' },
            { transform: 'rotate(16deg)' },
            { transform: 'rotate(0deg)' }
        ], { duration: 1400, iterations: Infinity, easing: 'ease-in-out', delay: 500 });
    }

    // Botones con efecto ripple (ligero)
    if (!prefersReduced) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const circle = document.createElement('span');
                circle.className = 'ripple';
                const rect = this.getBoundingClientRect();
                circle.style.left = `${e.clientX - rect.left}px`;
                circle.style.top = `${e.clientY - rect.top}px`;
                this.appendChild(circle);
                setTimeout(() => circle.remove(), 700);
            });
        });
    }

    // Animación flotante para iconos: solo si dispositivo potente
    if (!prefersReduced && window.innerWidth > 900) {
        document.querySelectorAll('.proyecto-icon, .galeria-icon, .exp-icon').forEach(icon => {
            icon.animate([
                { transform: 'translateY(0px)' },
                { transform: 'translateY(-6px)' },
                { transform: 'translateY(0px)' }
            ], {
                duration: 2400 + Math.random() * 800,
                iterations: Infinity,
                direction: 'alternate',
                easing: 'ease-in-out',
                delay: Math.random() * 800
            });
        });
    }

    // Efecto parpadeo en el status (reducido) 
    const status = document.querySelector('.status');
    if (status && !prefersReduced && window.innerWidth > 800) {
        setInterval(() => {
            status.style.filter = 'drop-shadow(0 0 8px #3ee9a6)';
            setTimeout(() => status.style.filter = '', 300);
        }, 3000);
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
