/**
 * SGG - Sistema de Gestión de Gastos
 * login.js — Segundo Incremento: Registro
 *
 * Principios aplicados:
 *  - DRY: funciones reutilizables showAlert() y hideAlert()
 *  - ETC: lógica separada del HTML, fácil de modificar
 *  - Ortogonalidad: módulo de tema independiente del módulo de auth
 *  - WCAG: mensajes con role="alert", foco accesible en botones
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // MÓDULO 1: USUARIOS PREDETERMINADOS
    // ============================================
    const DEFAULT_USERS = [
        { username: 'admin',   password: 'admin123' },
        { username: 'santino', password: 'contrasena' }
    ];

    DEFAULT_USERS.forEach(({ username, password }) => {
        const key = `user_${username.toLowerCase()}`;
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, password);
        }
    });

    // ============================================
    // MÓDULO 2: SWITCH DE TEMA (DÍA / NOCHE)
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = document.getElementById('themeIcon');

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
    // MÓDULO 3: SELECTORES
    // ============================================
    const authForm       = document.getElementById('authForm');
    const usernameInput  = document.getElementById('username');
    const passwordInput  = document.getElementById('password');
    const passwordStrengthWrapper = document.getElementById('passwordStrengthWrapper');
    const strengthBar    = document.getElementById('strengthBar');
    const strengthText   = document.getElementById('strengthText');
    const reqMin         = document.getElementById('reqMin');
    const reqMaj         = document.getElementById('reqMaj');
    const reqSym         = document.getElementById('reqSym');
    const alertBox       = document.getElementById('alertBox');
    const btnSubmit      = document.getElementById('btnSubmit');
    const formTitle      = document.getElementById('formTitle');
    const formSubtitle   = document.getElementById('formSubtitle');
    const toggleFormLink = document.getElementById('toggleFormLink');
    const toggleText     = document.getElementById('toggleText');

    let isLoginMode = true;

    // ============================================
    // MÓDULO 4: ALTERNAR LOGIN / REGISTRO
    // ============================================
    toggleFormLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        clearForm(authForm);
        hideAlert(alertBox);

        if (isLoginMode) {
            formTitle.textContent      = 'Iniciar Sesión';
            formSubtitle.textContent   = 'Introduce tus credenciales para acceder';
            btnSubmit.textContent      = 'Ingresar';
            toggleText.textContent     = '¿No tenés cuenta?';
            toggleFormLink.textContent = 'Registrate acá';
        } else {
            formTitle.textContent      = 'Crear Cuenta';
            formSubtitle.textContent   = 'Elegí un usuario y contraseña para registrarte';
            btnSubmit.textContent      = 'Registrarse';
            toggleText.textContent     = '¿Ya tenés cuenta?';
            toggleFormLink.textContent = 'Iniciá sesión';
        }
    });

    // ============================================
    // MÓDULO 5: LÓGICA DE LOGIN / REGISTRO
    // ============================================
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showAlert(alertBox, 'Por favor, completá todos los campos.', 'error');
            return;
        }

        const storageKey     = `user_${username.toLowerCase()}`;
        const storedPassword = localStorage.getItem(storageKey);

        if (isLoginMode) {
            if (!storedPassword) {
                showAlert(alertBox, 'Usuario no registrado. ¿Querés crear una cuenta?', 'error');
            } else if (storedPassword !== password) {
                showAlert(alertBox, 'Contraseña incorrecta. Intentá de nuevo.', 'error');
            } else {
                showAlert(alertBox, `¡Bienvenido, ${username}!`, 'success');
                clearForm(authForm);
            }
        } else {
            if (storedPassword) {
                showAlert(alertBox, 'El nombre de usuario ya está registrado.', 'error');
            } else {
                localStorage.setItem(storageKey, password);
                showAlert(alertBox, '¡Registro exitoso! Ya podés iniciar sesión.', 'success');
                clearForm(authForm);
                setTimeout(() => toggleFormLink.click(), 1200);
            }
        }
    });

    // ============================================
    // FUNCIONES AUXILIARES (DRY)
    // ============================================
    function showAlert(element, message, type) {
        element.textContent = message;
        element.className   = `alert-message ${type}`;
    }

    function hideAlert(element) {
        element.textContent = '';
        element.className   = 'alert-message';
    }

    function clearForm(formElement) {
        formElement.reset();
    }
});
