/**
 * SGG - Sistema de Gestión de Gastos
 * login.js — Lógica de validación, localStorage y switch de tema
 *
 * Principios aplicados:
 *  - DRY: funciones reutilizables showAlert(), hideAlert(), clearForm()
 *  - ETC: lógica separada del HTML, fácil de modificar
 *  - Ortogonalidad: el módulo de tema es independiente del módulo de auth
 *  - WCAG: mensajes con role="alert", foco accesible en botones
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // MÓDULO 1: USUARIOS PREDETERMINADOS
    // Dos usuarios de prueba requeridos por la consigna
    // Se cargan solo si no existen ya en localStorage
    // ============================================
    const DEFAULT_USERS = [
        { username: 'admin',   password: 'admin123' },
        { username: 'santino', password: 'contrasena'  }
    ];

    DEFAULT_USERS.forEach(({ username, password }) => {
        const key = `user_${username.toLowerCase()}`;
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, password);
        }
    });


    // ============================================
    // MÓDULO 2: SWITCH DE TEMA (DÍA / NOCHE)
    // Ortogonal: no depende del módulo de auth
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = document.getElementById('themeIcon');

    // Restaurar preferencia guardada
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        themeIcon.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });


    // ============================================
    // MÓDULO 3: SELECTORES DE INTERFAZ
    // ============================================

    // Auth
    const authCard       = document.getElementById('authCard');
    const authForm       = document.getElementById('authForm');
    const usernameInput  = document.getElementById('username');
    const passwordInput  = document.getElementById('password');
    const btnSubmit      = document.getElementById('btnSubmit');
    const formTitle      = document.getElementById('formTitle');
    const formSubtitle   = document.getElementById('formSubtitle');
    const toggleFormLink = document.getElementById('toggleFormLink');
    const toggleText     = document.getElementById('toggleText');
    const alertBox       = document.getElementById('alertBox');
    const authFormsBlock = document.getElementById('authFormsBlock');

    // Dashboard
    const welcomeBlock   = document.getElementById('welcomeBlock');
    const displayUser    = document.getElementById('displayUser');
    const btnLogout      = document.getElementById('btnLogout');
    const moduleButtons  = document.querySelectorAll('.module-btn');
    const statusMessage  = document.getElementById('statusMessage');

    // Cambio de contraseña
    const changePasswordForm  = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput    = document.getElementById('newPassword');
    const alertBoxDashboard   = document.getElementById('alertBoxDashboard');

    let isLoginMode = true;


    // ============================================
    // MÓDULO 4: SESIÓN PERSISTIDA
    // ============================================
    const activeSession = localStorage.getItem('session_active');
    if (activeSession) {
        showDashboard(activeSession);
    }


    // ============================================
    // MÓDULO 5: ALTERNAR LOGIN / REGISTRO
    // ============================================
    toggleFormLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        clearForm(authForm);
        hideAlert(alertBox);

        if (isLoginMode) {
            formTitle.textContent    = 'Iniciar Sesión';
            formSubtitle.textContent = 'Introduce tus credenciales para acceder';
            btnSubmit.textContent    = 'Ingresar';
            toggleText.textContent   = '¿No tenés cuenta?';
            toggleFormLink.textContent = 'Registrate acá';
        } else {
            formTitle.textContent    = 'Crear Cuenta';
            formSubtitle.textContent = 'Elegí un usuario y contraseña para registrarte';
            btnSubmit.textContent    = 'Registrarse';
            toggleText.textContent   = '¿Ya tenés cuenta?';
            toggleFormLink.textContent = 'Iniciá sesión';
        }
    });


    // ============================================
    // MÓDULO 6: LOGIN Y REGISTRO
    // ============================================
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validación: campos vacíos
        if (!username || !password) {
            showAlert(alertBox, 'Por favor, completá todos los campos.', 'error');
            return;
        }

        const storageKey = `user_${username.toLowerCase()}`;

        if (isLoginMode) {
            // --- CASO DE ÉXITO: credenciales válidas ---
            const storedPassword = localStorage.getItem(storageKey);

            if (storedPassword && storedPassword === password) {
                localStorage.setItem('session_active', username);
                showAlert(alertBox, `¡Bienvenido, ${username}! Redirigiendo...`, 'success');
                setTimeout(() => showDashboard(username), 1000);
            } else if (!storedPassword) {
                // --- CASO DE ERROR 2: usuario no registrado ---
                showAlert(alertBox, 'Usuario no registrado. ¿Querés crear una cuenta?', 'error');
            } else {
                // --- CASO DE ERROR 1: contraseña incorrecta ---
                showAlert(alertBox, 'Contraseña incorrecta. Intentá de nuevo.', 'error');
            }

        } else {
            // --- REGISTRO ---
            const userExists = localStorage.getItem(storageKey);

            if (userExists) {
                showAlert(alertBox, 'El nombre de usuario ya está registrado.', 'error');
            } else {
                localStorage.setItem(storageKey, password);
                showAlert(alertBox, '¡Registro exitoso! Ya podés iniciar sesión.', 'success');
                setTimeout(() => toggleFormLink.click(), 1500);
            }
        }
    });


    // ============================================
    // MÓDULO 7: MÓDULOS DEL DASHBOARD
    // ============================================
    moduleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const moduloId = e.currentTarget.getAttribute('data-modulo');
            const nombres  = ['Ingresos', 'Gastos', 'Reportes', 'Categorías', 'Presupuesto', 'Configuración'];
            const nombre   = nombres[moduloId - 1] || `Módulo ${moduloId}`;

            statusMessage.textContent = `${nombre}: funcionalidad en desarrollo — próximo incremento`;
            statusMessage.style.display = 'block';

            // Reiniciar animación
            statusMessage.style.animation = 'none';
            statusMessage.offsetHeight;
            statusMessage.style.animation = 'fadeIn 0.4s ease forwards';
        });
    });


    // ============================================
    // MÓDULO 8: CAMBIO DE CONTRASEÑA
    // ============================================
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBoxDashboard);

        const currentUser = localStorage.getItem('session_active');
        if (!currentUser) {
            showAlert(alertBoxDashboard, 'Sesión inválida. Cerrando sesión...', 'error');
            setTimeout(() => btnLogout.click(), 1500);
            return;
        }

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword     = newPasswordInput.value.trim();

        if (!currentPassword || !newPassword) {
            showAlert(alertBoxDashboard, 'Por favor, completá todos los campos.', 'error');
            return;
        }

        const storageKey     = `user_${currentUser.toLowerCase()}`;
        const storedPassword = localStorage.getItem(storageKey);

        if (storedPassword !== currentPassword) {
            showAlert(alertBoxDashboard, 'La contraseña actual es incorrecta.', 'error');
        } else if (currentPassword === newPassword) {
            showAlert(alertBoxDashboard, 'La nueva contraseña no puede ser igual a la actual.', 'error');
        } else {
            localStorage.setItem(storageKey, newPassword);
            showAlert(alertBoxDashboard, '¡Contraseña actualizada con éxito!', 'success');
            clearForm(changePasswordForm);
        }
    });


    // ============================================
    // MÓDULO 9: CIERRE DE SESIÓN
    // ============================================
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('session_active');
        welcomeBlock.style.display   = 'none';
        authFormsBlock.style.display = 'block';

        isLoginMode = false;
        toggleFormLink.click();

        clearForm(authForm);
        clearForm(changePasswordForm);
        hideAlert(alertBox);
        hideAlert(alertBoxDashboard);
        statusMessage.style.display = 'none';
    });


    // ============================================
    // FUNCIONES AUXILIARES (DRY)
    // Reutilizadas en múltiples módulos
    // ============================================

    /** Muestra un mensaje de alerta accesible */
    function showAlert(element, message, type) {
        element.textContent = message;
        element.className   = `alert-message ${type}`;
    }

    /** Oculta y limpia un mensaje de alerta */
    function hideAlert(element) {
        element.textContent = '';
        element.className   = 'alert-message';
    }

    /** Limpia todos los campos de un formulario */
    function clearForm(formElement) {
        formElement.reset();
    }

    /** Muestra el dashboard como overlay de pantalla completa (fix CLS) */
    function showDashboard(username) {
        authFormsBlock.style.display = 'none';
        welcomeBlock.style.display   = 'block';
        displayUser.textContent      = username;
    }

});
