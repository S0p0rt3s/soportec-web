/* ================================================================
   SOPORTEC — SCRIPT.JS  v2.0
   - Navbar scroll effect
   - Hero canvas (partículas)
   - Scroll reveal (IntersectionObserver)
   - Filtro de servicios (tabs)
   - Contadores animados
   - Formulario de contacto con validación
   - Scroll to top
   - Google Translate toggle
================================================================ */

(function () {
    'use strict';

    /* ────────────────────────────────────────────────────────────
       1. NAVBAR — efecto scroll
    ──────────────────────────────────────────────────────────── */
    var navbar = document.querySelector('.navbar');
    var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    function updateNavbar() {
        if (window.scrollY > 60) {
            navbar && navbar.classList.add('scrolled');
        } else {
            navbar && navbar.classList.remove('scrolled');
        }
    }

    // Marca el link activo según la sección visible
    var sections = document.querySelectorAll('section[id], div[id]');

    function updateActiveLink() {
        var scrollPos = window.scrollY + 100;
        sections.forEach(function (sec) {
            if (!sec.id) return;
            var top    = sec.offsetTop;
            var bottom = top + sec.offsetHeight;
            navLinks.forEach(function (link) {
                var href = link.getAttribute('href');
                if (href && href.includes('#' + sec.id)) {
                    if (scrollPos >= top && scrollPos < bottom) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        });
    }

    window.addEventListener('scroll', function () {
        updateNavbar();
        updateActiveLink();
    }, { passive: true });

    updateNavbar();

    // Cierra el menú móvil al hacer click en un nav-link
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            var collapse = document.querySelector('.navbar-collapse');
            if (collapse && collapse.classList.contains('show')) {
                // Usa Bootstrap 4 collapse API
                $(collapse).collapse('hide');
            }
        });
    });

    /* ────────────────────────────────────────────────────────────
       2. HERO CANVAS — partículas flotantes
    ──────────────────────────────────────────────────────────── */
    var canvas = document.getElementById('heroCanvas');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        var particles = [];

        function resizeCanvas() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        window.addEventListener('resize', resizeCanvas, { passive: true });
        resizeCanvas();

        // Genera partículas
        var PARTICLE_COUNT = 80;

        function randomBetween(a, b) { return a + Math.random() * (b - a); }

        function createParticle() {
            return {
                x:     randomBetween(0, canvas.width),
                y:     randomBetween(0, canvas.height),
                r:     randomBetween(0.5, 2),
                alpha: randomBetween(0.1, 0.6),
                vx:    randomBetween(-0.3, 0.3),
                vy:    randomBetween(-0.5, -0.1),
                life:  randomBetween(0, 1),        // fase inicial aleatoria
                speed: randomBetween(0.003, 0.008) // velocidad de fade
            };
        }

        for (var i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(function (p, idx) {
                p.life += p.speed;
                if (p.life > 1) {
                    // Reinicia la partícula
                    particles[idx] = createParticle();
                    particles[idx].y = canvas.height + 10;
                    return;
                }

                var fadeAlpha = p.alpha * Math.sin(p.life * Math.PI);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

                // Alterna entre azul marino y naranja suave
                var hue = Math.random() > 0.6 ? '232, 93, 4' : '46, 125, 209';
                ctx.fillStyle = 'rgba(' + hue + ', ' + fadeAlpha + ')';
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;
            });

            requestAnimationFrame(animateParticles);
        }

        animateParticles();
    }

    /* ────────────────────────────────────────────────────────────
       3. SCROLL REVEAL — IntersectionObserver
    ──────────────────────────────────────────────────────────── */
    var revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold:  0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback para navegadores sin soporte
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    /* ────────────────────────────────────────────────────────────
       4. FILTRO DE SERVICIOS — tabs B2B / B2C
    ──────────────────────────────────────────────────────────── */
    var tabs  = document.querySelectorAll('.svc-tab');
    var items = document.querySelectorAll('.svc-item');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            // Activa el tab
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');

            var filter = tab.getAttribute('data-filter');

            items.forEach(function (item) {
                var cats = item.getAttribute('data-cat') || '';
                if (filter === 'all' || cats.indexOf(filter) !== -1) {
                    item.classList.remove('hidden');
                    // Pequeña animación de entrada
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    requestAnimationFrame(function () {
                        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        item.style.opacity    = '1';
                        item.style.transform  = 'translateY(0)';
                    });
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    /* ────────────────────────────────────────────────────────────
       5. CONTADORES ANIMADOS
    ──────────────────────────────────────────────────────────── */
    var counters = document.querySelectorAll('.counter-num');
    var countersStarted = false;

    function animateCounter(el) {
        var target   = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1800; // ms
        var start    = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }

        requestAnimationFrame(step);
    }

    if (counters.length > 0 && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    counters.forEach(animateCounter);
                    counterObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(counters[0]);
    }

    /* ────────────────────────────────────────────────────────────
       6. FORMULARIO DE CONTACTO — validación + mailto
    ──────────────────────────────────────────────────────────── */
    var form = document.getElementById('contactForm');

    function showError(fieldId, msg) {
        var field = document.getElementById(fieldId);
        var err   = document.getElementById('err-' + fieldId.replace('cf-', ''));
        if (field) field.classList.add('error');
        if (err)   err.textContent = msg;
    }

    function clearError(fieldId) {
        var field = document.getElementById(fieldId);
        var err   = document.getElementById('err-' + fieldId.replace('cf-', ''));
        if (field) {
            field.classList.remove('error');
            field.classList.add('valid');
        }
        if (err) err.textContent = '';
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Validación en tiempo real
    ['cf-nombre', 'cf-email', 'cf-mensaje'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', function () {
            if (el.value.trim()) clearError(id);
        });
    });

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var nombre  = document.getElementById('cf-nombre');
            var email   = document.getElementById('cf-email');
            var mensaje = document.getElementById('cf-mensaje');
            var empresa = document.getElementById('cf-empresa');
            var tel     = document.getElementById('cf-telefono');
            var tipo    = document.getElementById('cf-tipo');
            var servicio= document.getElementById('cf-servicio');

            var valid = true;

            // Limpia errores previos
            ['cf-nombre', 'cf-email', 'cf-mensaje'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) {
                    el.classList.remove('error', 'valid');
                }
                var err = document.getElementById('err-' + id.replace('cf-', ''));
                if (err) err.textContent = '';
            });

            if (!nombre || !nombre.value.trim()) {
                showError('cf-nombre', 'El nombre es obligatorio.');
                valid = false;
            } else {
                clearError('cf-nombre');
            }

            if (!email || !email.value.trim()) {
                showError('cf-email', 'El correo es obligatorio.');
                valid = false;
            } else if (!validateEmail(email.value.trim())) {
                showError('cf-email', 'Ingresa un correo válido.');
                valid = false;
            } else {
                clearError('cf-email');
            }

            if (!mensaje || !mensaje.value.trim()) {
                showError('cf-mensaje', 'El mensaje es obligatorio.');
                valid = false;
            } else {
                clearError('cf-mensaje');
            }

            if (!valid) return;

            // Loading state
            var btnText    = document.getElementById('btnText');
            var btnLoading = document.getElementById('btnLoading');
            var btnSubmit  = document.getElementById('btnSubmit');

            if (btnText && btnLoading && btnSubmit) {
                btnText.style.display    = 'none';
                btnLoading.style.display = 'flex';
                btnSubmit.disabled       = true;
            }

            // Simula delay luego abre mailto
            setTimeout(function () {
                var n  = nombre  ? nombre.value.trim()   : '';
                var em = email   ? email.value.trim()    : '';
                var ms = mensaje ? mensaje.value.trim()  : '';
                var co = empresa ? empresa.value.trim()  : '';
                var ph = tel     ? tel.value.trim()      : '';
                var tp = tipo    ? tipo.value            : '';
                var sv = servicio? servicio.value        : '';

                var subject = encodeURIComponent('Consulta desde SOportec.com — ' + n);
                var body    = encodeURIComponent(
                    'Nombre:              ' + n  + '\n' +
                    'Empresa:             ' + co + '\n' +
                    'Correo:              ' + em + '\n' +
                    'Teléfono/WhatsApp:   ' + ph + '\n' +
                    'Tipo de cliente:     ' + tp + '\n' +
                    'Servicio de interés: ' + sv + '\n\n' +
                    'Mensaje:\n' + ms
                );

                window.location.href =
                    'mailto:cristianjbr755@gmail.com?subject=' + subject + '&body=' + body;

                // Muestra mensaje de éxito visual
                var successMsg = document.getElementById('formSuccess');
                if (successMsg) successMsg.style.display = 'flex';

                form.reset();
                ['cf-nombre', 'cf-email', 'cf-mensaje'].forEach(function (id) {
                    var el = document.getElementById(id);
                    if (el) el.classList.remove('valid');
                });

                if (btnText && btnLoading && btnSubmit) {
                    btnText.style.display    = 'flex';
                    btnLoading.style.display = 'none';
                    btnSubmit.disabled       = false;
                }

                // Oculta el mensaje tras 5 segundos
                setTimeout(function () {
                    if (successMsg) successMsg.style.display = 'none';
                }, 5000);

            }, 800);
        });
    }

    /* ────────────────────────────────────────────────────────────
       7. SCROLL TO TOP
    ──────────────────────────────────────────────────────────── */
    var scrollTopBtn = document.getElementById('scrollTop');

    if (scrollTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ────────────────────────────────────────────────────────────
       8. SMOOTH SCROLL — links internos con #
    ──────────────────────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            // Excluye controles del carrusel
            if (anchor.classList.contains('carousel-control-prev') || 
                anchor.classList.contains('carousel-control-next')) {
                return;
            }
            
            var targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offset = 80; // altura del navbar
                var top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    /* ────────────────────────────────────────────────────────────
       9. GOOGLE TRANSLATE TOGGLE
    ──────────────────────────────────────────────────────────── */
    window.currentLang = 'es';
    
    // Variable para verificar si Google Translate está listo
    var googleTranslateReady = false;
    
    // Verificar si Google Translate está disponible
    function checkGoogleTranslate() {
        return document.querySelector('.goog-te-combo') !== null;
    }

    window.toggleLang = function () {
        window.currentLang = window.currentLang === 'es' ? 'en' : 'es';
        var isEn = window.currentLang === 'en';

        var flag  = document.getElementById('langFlag');
        var label = document.getElementById('langLabel');
        if (flag)  flag.textContent  = isEn ? '🇵🇪' : '🇺🇸';
        if (label) label.textContent = isEn ? 'ES'  : 'EN';

        function applyTranslation() {
            var select = document.querySelector('.goog-te-combo');
            if (select) {
                googleTranslateReady = true;
                select.value = isEn ? 'en' : 'es';
                select.dispatchEvent(new Event('change'));
                return true;
            }
            return false;
        }

        // Intenta aplicar la traducción inmediatamente
        if (!applyTranslation()) {
            // Si no está listo, intenta varias veces con intervalos crecientes
            var attempts = 0;
            var maxAttempts = 10;
            var attemptInterval = setInterval(function() {
                attempts++;
                if (applyTranslation() || attempts >= maxAttempts) {
                    clearInterval(attemptInterval);
                    if (!googleTranslateReady && attempts >= maxAttempts) {
                        console.warn('Google Translate no está disponible. El widget puede no haberse cargado correctamente.');
                    }
                }
            }, 500);
        }
    };

    // Oculta la barra de Google Translate y verifica que esté cargado
    window.addEventListener('load', function () {
        var style = document.createElement('style');
        style.innerHTML =
            '.goog-te-banner-frame, .skiptranslate { display: none !important; }' +
            'body { top: 0 !important; }' +
            '.goog-te-gadget { display: none !important; }';
        document.head.appendChild(style);
        
        // Verifica periódicamente si Google Translate está listo
        var checkInterval = setInterval(function() {
            if (checkGoogleTranslate()) {
                googleTranslateReady = true;
                clearInterval(checkInterval);
                console.log('Google Translate cargado correctamente');
            }
        }, 1000);
        
        // Detiene la verificación después de 15 segundos
        setTimeout(function() {
            clearInterval(checkInterval);
            if (!googleTranslateReady) {
                console.error('Google Translate no se pudo cargar. Verifica tu conexión a internet.');
            }
        }, 15000);
    });

    /* ────────────────────────────────────────────────────────────
       10. EFECTO HOVER 3D SUAVE EN TARJETAS GLASS
    ──────────────────────────────────────────────────────────── */
    var glassCards = document.querySelectorAll('.glass-card');

    glassCards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect   = card.getBoundingClientRect();
            var x      = e.clientX - rect.left - rect.width  / 2;
            var y      = e.clientY - rect.top  - rect.height / 2;
            var rotX   = (-y / rect.height) * 6; // max ±6deg
            var rotY   = ( x / rect.width)  * 6;
            card.style.transform = 'translateY(-6px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s ease';
        });
    });

}());

/* ────────────────────────────────────────────────────────────
   10. SINCRONIZACIÓN DE INDICADORES DEL CARRUSEL HERO
   Los indicadores están fuera del carrusel (position:static),
   por lo que Bootstrap no actualiza .active automáticamente.
   Este bloque lo hace manualmente en el evento slid.bs.carousel.
──────────────────────────────────────────────────────────── */
$(document).ready(function () {
    var $carousel    = $('#heroCarousel');
    var $indicators  = $('#heroCarouselIndicators li');

    if (!$carousel.length || !$indicators.length) return;

    $carousel.on('slid.bs.carousel', function (e) {
        $indicators.removeClass('active');
        $indicators.eq(e.to).addClass('active');
    });
});
