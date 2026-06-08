/**
 * SGG - Sistema de Gestión de Gastos
 * login.js — Primer Incremento: Login
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
    const loginForm     = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const alertBox      = document.getElementById('alertBox');


    // ============================================
    // MÓDULO 4: LÓGICA DE LOGIN
    // ============================================
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validación: campos vacíos
        if (!username || !password) {
            showAlert(alertBox, 'Por favor, completá todos los campos.', 'error');
            return;
        }

        const storageKey     = `user_${username.toLowerCase()}`;
        const storedPassword = localStorage.getItem(storageKey);

        if (!storedPassword) {
            // Error: usuario no registrado
            showAlert(alertBox, 'Usuario no registrado.', 'error');
        } else if (storedPassword !== password) {
            // Error: contraseña incorrecta
            showAlert(alertBox, 'Contraseña incorrecta. Intentá de nuevo.', 'error');
        } else {
            // Éxito: acceso concedido
            showAlert(alertBox, `¡Bienvenido, ${username}!`, 'success');
        }
    });


    // ============================================
    // FUNCIONES AUXILIARES (DRY)
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

});
