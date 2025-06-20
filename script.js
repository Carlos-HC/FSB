// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const modoEstudioBtn = document.getElementById('modoEstudioBtn');
    const modoEstudioModal = document.getElementById('modoEstudioModal');
    const closeModalBtn = modoEstudioModal.querySelector('.close-button');
    const breakSuggestionText = document.getElementById('breakSuggestionText');
    const breakContentArea = document.getElementById('breakContentArea');
    
    // Referencias a todos los enlaces de navegación y tarjetas de acceso rápido
    const navLinks = document.querySelectorAll('nav ul li a');
    const quickAccessCards = document.querySelectorAll('.quick-access-cards .card');
    const postLinks = document.querySelectorAll('a.btn-secondary');

    let isModoEstudioActive = false;
    let breakTimer = null; // Para almacenar la referencia del temporizador

    // --- Contenidos de Sugerencias de Break ---
    const breakSuggestions = [
        {
            type: 'arte',
            text: '¡Libera tu mente! Intenta este ejercicio de dibujo libre por 5 minutos.',
            contentHtml: `
                <video controls autoplay muted style="max-width: 100%; height: auto; border-radius: 8px;">
                    <source src="Videos/Arte1.mp4" type="video/mp4">
                    Tu navegador no soporta el video.
                </video>
                <p style="margin-top: 15px;">Recuerda, el objetivo es la expresión, no la perfección.</p>
            `,
            duration: 5 * 60 * 1000 // Duración estimada para contenido no-video (si aplica), en ms
        },
        {
            type: 'fisico',
            text: '¡Estira tu espalda! Te recomendamos este video de 3 minutos de estiramientos de cuello y hombros.',
            contentHtml: `
                <video controls autoplay muted style="max-width: 100%; height: auto; border-radius: 8px;">
                    <source src="Videos/Fisico1.mp4" type="video/mp4">
                    Tu navegador no soporta el video.
                </video>
                <p style="margin-top: 15px;">Una pequeña pausa activa antes de continuar.</p>
            `,
            duration: 3 * 60 * 1000 // Duración estimada
        },
        {
            type: 'arte',
            text: '¡Respiración profunda! Prueba este ejercicio de 4-7-8.',
            contentHtml: `
                <p style="font-size: 1.1em;">Inhala por 4 segundos, sostén por 7, exhala por 8. Repite 5 veces.</p>
                <img src="thumbnails/respiracion-guia.jpg" alt="Guía de respiración" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 20px;">
                <p style="margin-top: 15px;">Tómate unos minutos para relajarte.</p>
            `,
            duration: 2 * 60 * 1000 // Duración estimada para este ejercicio sin video
        }
    ];

    // --- Funciones para controlar la navegación (AHORA INTEGRADO) ---
    function disableNavigation() {
        navLinks.forEach(link => {
            link.style.pointerEvents = 'none'; // Deshabilita clics
            link.style.opacity = '0.6'; // Hace que se vean deshabilitados
            link.tabIndex = -1; // Quita del orden de tabulación
        });
        quickAccessCards.forEach(card => {
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.6';
            card.tabIndex = -1;
        });
        postLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.6';
            link.tabIndex = -1;
        });
    }

    function enableNavigation() {
        navLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
            link.tabIndex = 0; // Vuelve a poner en el orden de tabulación
        });
        quickAccessCards.forEach(card => {
            card.style.pointerEvents = 'auto';
            card.style.opacity = '1';
            card.tabIndex = 0;
        });
        postLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
            link.tabIndex = 0;
        });
    }

    // --- Funciones del Modo Estudio ---

    function startBreakTimer() {
        if (breakTimer) {
            clearTimeout(breakTimer);
        }

        // Tiempos para pruebas más rápidas (0.5 a 1 minutos)
        const minTime = .5 * 60 * 1000;
        const maxTime = 1 * 60 * 1000;
        // Para tiempos reales, usa:
        // const minTime = 30 * 60 * 1000; // 30 minutos
        // const maxTime = 45 * 60 * 1000; // 45 minutos

        const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;

        console.log(`Próximo break en ${randomTime / 1000 / 60} minutos.`);

        breakTimer = setTimeout(() => {
            triggerBreakAlert();
        }, randomTime);

        // Guardar el tiempo de inicio y duración para persistencia si el modo está activo
        if (isModoEstudioActive) {
            localStorage.setItem('breakTimerLastStartTime', Date.now());
            localStorage.setItem('breakTimerNextDuration', randomTime);
        }
    }

    function stopBreakTimer() {
        if (breakTimer) {
            clearTimeout(breakTimer);
            breakTimer = null;
            console.log('Temporizador de break detenido.');
        }
        localStorage.removeItem('breakTimerLastStartTime');
        localStorage.removeItem('breakTimerNextDuration');
    }

    function closeAndCleanModal() {
        modoEstudioModal.style.display = 'none';
        const videoInModal = breakContentArea.querySelector('video');
        if (videoInModal) {
            videoInModal.pause();
            videoInModal.currentTime = 0;
            videoInModal.removeEventListener('ended', closeAndCleanModal); // Limpiar el listener
        }
        breakContentArea.innerHTML = '';
        if (window.nonVideoBreakTimeout) {
            clearTimeout(window.nonVideoBreakTimeout);
            window.nonVideoBreakTimeout = null;
        }
        // No se rehabilita la navegación aquí, solo cuando se desactiva el Modo Estudio.
    }

    function triggerBreakAlert() {
        if (!isModoEstudioActive) return;

        // Pausar cualquier video que se esté reproduciendo en la página principal
        document.querySelectorAll('video').forEach(video => {
            video.pause();
        });

        const randomIndex = Math.floor(Math.random() * breakSuggestions.length);
        const suggestion = breakSuggestions[randomIndex];

        breakSuggestionText.textContent = suggestion.text;
        breakContentArea.innerHTML = suggestion.contentHtml;

        modoEstudioModal.style.display = 'flex'; // Mostrar el modal
        
        const videoInModal = breakContentArea.querySelector('video');
        if (videoInModal) {
            videoInModal.muted = true; 
            videoInModal.play().catch(error => {
                console.warn("Autoplay del video en modal bloqueado. Error:", error);
            });
            videoInModal.addEventListener('ended', closeAndCleanModal); // Cierra al finalizar el video
        } else {
            // Si no es un video, cierra el modal después de una duración estimada
            window.nonVideoBreakTimeout = setTimeout(closeAndCleanModal, suggestion.duration || 5 * 60 * 1000); 
        }
        
        // Reiniciar el temporizador para el siguiente break
        startBreakTimer(); 
    }

    // `persist` controla si el estado se guarda en localStorage (true para interacción manual)
    function toggleModoEstudio(persist = true) { 
        isModoEstudioActive = !isModoEstudioActive;
        modoEstudioBtn.classList.toggle('active', isModoEstudioActive);

        if (isModoEstudioActive) {
            console.log('Modo Estudio Activado.');
            startBreakTimer();
            disableNavigation(); // <--- DESHABILITAR NAVEGACIÓN
            // Añadir clase para evitar cierre por clic fuera SOLO SI EL MODO ESTUDIO ESTÁ ACTIVO
            modoEstudioModal.classList.add('no-click-outside'); 
        } else {
            console.log('Modo Estudio Desactivado.');
            stopBreakTimer();
            closeAndCleanModal(); // Asegura que el modal se oculte y limpie
            enableNavigation(); // <--- REHABILITAR NAVEGACIÓN
            modoEstudioModal.classList.remove('no-click-outside'); // Quitar clase
        }

        // Guardar el estado en localStorage SOLO si la llamada no es para inicialización
        if (persist) {
            localStorage.setItem('modoEstudioActive', isModoEstudioActive);
            // El guardado del tiempo restante se maneja ahora dentro de startBreakTimer y stopBreakTimer
        }
    }

    // --- Inicialización al cargar la página ---
    const storedModoEstudioState = localStorage.getItem('modoEstudioActive');
    const storedLastStartTime = localStorage.getItem('breakTimerLastStartTime');
    const storedNextDuration = localStorage.getItem('breakTimerNextDuration');

    if (storedModoEstudioState === 'true') {
        // Al recargar, activamos el modo estudio sin guardar de nuevo en localStorage (persist = false)
        // Esto evita un bucle o reseteo incorrecto del estado.
        isModoEstudioActive = true; // Establecer el estado directamente
        modoEstudioBtn.classList.add('active'); // Actualizar visualmente el botón
        disableNavigation(); // <--- DESHABILITAR NAVEGACIÓN INMEDIATAMENTE AL RECARGAR
        console.log('Modo Estudio re-activado desde localStorage.');
        
        if (storedLastStartTime && storedNextDuration) {
            const timeElapsed = Date.now() - parseInt(storedLastStartTime, 10);
            const timeToNextBreak = parseInt(storedNextDuration, 10) - timeElapsed;

            if (timeToNextBreak > 0) {
                console.log(`Retomando break en ${timeToNextBreak / 1000 / 60} minutos.`);
                breakTimer = setTimeout(() => {
                    triggerBreakAlert();
                }, timeToNextBreak);
            } else {
                // Si el tiempo restante es 0 o negativo, disparar el break inmediatamente
                // o iniciar un nuevo ciclo (triggerBreakAlert() para inmediato, startBreakTimer() para nuevo aleatorio)
                triggerBreakAlert(); // Dispara el break si ya debería haber ocurrido
            }
        } else {
            // Si no hay datos de temporizador, pero el modo estaba activo, iniciar un nuevo ciclo normal
            startBreakTimer();
        }
    }


    // --- Event Listeners ---

    // Evento para el botón del Modo Estudio (usamos el parámetro `true` para persistir)
    modoEstudioBtn.addEventListener('click', () => toggleModoEstudio(true));

    // Evento para cerrar el modal con la "tacha"
    closeModalBtn.addEventListener('click', closeAndCleanModal);

    // Cerrar modal al hacer clic fuera de él (solo si el modo estudio NO está activo)
    window.addEventListener('click', (event) => {
        if (event.target === modoEstudioModal && !isModoEstudioActive) {
            closeAndCleanModal();
        }
    });

    // --- Mejoras de UX: Smooth Scroll para la navegación ---
    // Estos listeners seguirán funcionando para el smooth scroll
    // PERO la navegación estará deshabilitada por `pointer-events: none;` cuando el modo estudio esté activo.
    document.querySelectorAll('nav ul li a, .quick-access-cards .card').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Solo prevenir el default y hacer smooth scroll si el modo estudio NO está activo
            if (!isModoEstudioActive) { 
                e.preventDefault(); 
                const targetId = this.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            }
            // Si isModoEstudioActive es true, pointer-events: none ya prevendrá el click
            // Si se necesitara un feedback más directo, se podría añadir un 'else' aquí.
        });
    });
});