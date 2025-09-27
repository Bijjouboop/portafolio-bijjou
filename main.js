// Mensaje de bienvenida animado al entrar
window.addEventListener('DOMContentLoaded', function() {
    var welcome = document.getElementById('welcome-message');
    if (welcome) {
        welcome.style.opacity = '1';
        setTimeout(function() {
            welcome.style.opacity = '0';
            setTimeout(function() {
                if (welcome.parentNode) welcome.parentNode.removeChild(welcome);
            }, 700);
        }, 3000);
    }

    // Modal de estado: feedback y contraseña
    var statusForm = document.getElementById('status-form');
    var statusPassword = document.getElementById('status-password');
    var statusFeedback = document.getElementById('status-feedback');
    var toggleBtn = document.getElementById('toggle-status-btn');
    if (statusForm && statusPassword && statusFeedback && toggleBtn) {
        statusForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var pass = statusPassword.value.trim();
            var correct = false;
            // Secreto desde el atributo data-maintenance-secret del body
            var secret = document.body.getAttribute('data-maintenance-secret');
            if (pass && secret && pass === secret) {
                correct = true;
            }
            if (correct) {
                statusFeedback.textContent = '¡Contraseña correcta! Estado cambiado.';
                statusFeedback.className = 'form-feedback minimal-form-feedback success';
                setTimeout(function() {
                    statusFeedback.textContent = '';
                    statusFeedback.className = 'form-feedback minimal-form-feedback';
                    statusPassword.value = '';
                }, 1200);
                // Disparar el cambio de estado (simula click en el botón original)
                if (typeof window.togglePortfolioStatus === 'function') {
                    window.togglePortfolioStatus();
                } else {
                    // fallback: buscar el botón y hacer click
                    var origBtn = document.getElementById('toggle-status-btn-orig');
                    if (origBtn) origBtn.click();
                }
            } else {
                statusFeedback.textContent = 'Contraseña incorrecta.';
                statusFeedback.className = 'form-feedback minimal-form-feedback error';
                setTimeout(function() {
                    statusFeedback.textContent = '';
                    statusFeedback.className = 'form-feedback minimal-form-feedback';
                }, 1200);
                statusPassword.value = '';
                statusPassword.focus();
            }
        });
        // Enter en input también envía
        statusPassword.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                toggleBtn.click();
            }
        });
    }
});
// Animaciones y detalles extra para el portafolio

document.addEventListener('DOMContentLoaded', () => {
    // === Interruptor Mantenimiento ===
    (function maintenanceSwitch(){
        const key = 'maintenanceMode';
        const body = document.body;
        const toggle = document.getElementById('maintenance-toggle');
        const SECRET = (body.dataset && body.dataset.maintenanceSecret) ? body.dataset.maintenanceSecret : 'bijjou';
        const AUTH_KEY = 'maintenanceAuth';
        // Lee de querystring si está presente
        const url = new URL(window.location.href);
        const qs = url.searchParams.get('maintenance');
        const qKey = url.searchParams.get('key');
        // Autoriza por query si la clave es correcta
        if (qKey && SECRET && qKey === SECRET) {
            try { sessionStorage.setItem(AUTH_KEY, '1'); } catch(_) {}
        }
        function isAuthed(){
            try { return sessionStorage.getItem(AUTH_KEY) === '1' || !SECRET; } catch(_) { return !SECRET; }
        }
        if ((qs === '1' || qs === '0') && isAuthed()) {
            try { localStorage.setItem(key, qs === '1' ? '1' : '0'); } catch(_) {}
        }
        // Estado inicial (default: ON si body ya tiene la clase)
        function getState(){
            try {
                const v = localStorage.getItem(key);
                if (v === '1' || v === '0') return v === '1';
            } catch(_) {}
            return body.classList.contains('maintenance');
        }
        function apply(state){
            body.classList.toggle('maintenance', state);
            if (toggle) toggle.setAttribute('aria-pressed', state ? 'true' : 'false');
        }
        let state = getState();
        apply(state);
        // Click handler
        toggle?.addEventListener('click', () => {
            // Requiere autenticación por palabra secreta
            if (!isAuthed()) {
                const input = window.prompt('Introduce la palabra secreta para alternar mantenimiento:');
                if (!input || input !== SECRET) {
                    return; // no autorizado
                }
                try { sessionStorage.setItem(AUTH_KEY, '1'); } catch(_) {}
            }
            state = !body.classList.contains('maintenance');
            apply(state);
            try { localStorage.setItem(key, state ? '1' : '0'); } catch(_) {}
        });
    })();
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

    // === Modal de estado editable (online/offline) ===
    const statusModal = document.getElementById('status-modal');
    if (statusModal) {
        const dialog = statusModal.querySelector('.epic-modal__dialog');
        const backdrop = statusModal.querySelector('.epic-modal__backdrop');
        const closeBtns = statusModal.querySelectorAll('[data-close]');
        const openBtn = document.getElementById('open-status-btn');
        const statusSpan = document.getElementById('portfolio-status');
        const toggleBtn = document.getElementById('toggle-status-btn');
        let lastFocused = null;
        const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
        const LS_KEY = 'portfolioStatus';
        const PASSWORD = 'Mbijjou200808?'; // Cambia aquí la contraseña si lo deseas
        const footerStatus = document.getElementById('footer-status');

        function getStatus() {
            try {
                const v = localStorage.getItem(LS_KEY);
                if (v === 'online' || v === 'offline') return v;
            } catch(_) {}
            return 'offline';
        }
        function setStatus(val) {
            try { localStorage.setItem(LS_KEY, val); } catch(_) {}
            updateStatus(val);
        }
        function updateStatus(val) {
            // Modal
            if (statusSpan) {
                if (val === 'online') {
                    statusSpan.textContent = 'Online';
                    statusSpan.style.color = '#43d675';
                } else {
                    statusSpan.textContent = 'Offline';
                    statusSpan.style.color = '#e74c3c';
                }
            }
            // Footer
            if (footerStatus) {
                if (val === 'online') {
                    footerStatus.textContent = 'Online';
                    footerStatus.style.color = '#43d675';
                } else {
                    footerStatus.textContent = 'Offline';
                    footerStatus.style.color = '#e74c3c';
                }
            }
        }
        function openModal() {
            if (!statusModal.hasAttribute('hidden')) return;
            lastFocused = document.activeElement;
            statusModal.removeAttribute('hidden');
            statusModal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', trapFocus);
            updateStatus(getStatus());
            // Focus heading or first focusable
            const heading = dialog.querySelector('#status-modal-title');
            const firstFocusable = dialog.querySelector(FOCUSABLE);
            (heading || firstFocusable)?.focus?.();
        }
        function closeModal() {
            if (statusModal.hasAttribute('hidden')) return;
            statusModal.classList.remove('is-open');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', trapFocus);
            setTimeout(() => {
                statusModal.setAttribute('hidden', '');
                lastFocused?.focus?.();
            }, 200);
        }
        function trapFocus(e) {
            const focusables = dialog.querySelectorAll(FOCUSABLE);
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
            }
        }
        // Click en backdrop o botones con data-close
        backdrop?.addEventListener('click', closeModal);
        closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
        // Apertura manual mediante botón visible
        openBtn?.addEventListener('click', openModal);
        // Cambiar estado con contraseña
        toggleBtn?.addEventListener('click', function() {
            const current = getStatus();
            const input = window.prompt('Introduce la contraseña para cambiar el estado:');
            if (!input || input !== PASSWORD) {
                alert('Contraseña incorrecta.');
                return;
            }
            const next = current === 'online' ? 'offline' : 'online';
            setStatus(next);
            updateStatus(next);
        });
        // Inicializar estado al abrir modal
        updateStatus(getStatus());
    }
});
