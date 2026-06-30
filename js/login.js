/**
 * SGG - Sistema de Gestión de Gastos
 * login.js — Segundo Incremento
 *
 * Depende de usuarios.js (debe cargarse antes en el HTML).
 */

document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();

    // ============================================
    // MÓDULO: SWITCH DE TEMA (DÍA / NOCHE)
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = document.getElementById('themeIcon');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        themeIcon.textContent = isDark ? '☀' : '☾';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ============================================
    // MÓDULO: SELECTORES
    // ============================================
    const authForm      = document.getElementById('authForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const alertBox      = document.getElementById('alertBox');
    const btnSubmit     = document.getElementById('btnSubmit');

    // ============================================
    // MÓDULO: BLOQUEO POR INTENTOS FALLIDOS (GLOBAL)
    // 3 intentos fallidos consecutivos -> botón
    // bloqueado 30 segundos.
    // ============================================
    const MAX_INTENTOS    = 3;
    const TIEMPO_BLOQUEO  = 30; // segundos
    let intentosFallidos  = 0;
    let intervaloCuenta   = null;

    function bloquearBoton() {
        let restante = TIEMPO_BLOQUEO;
        btnSubmit.disabled = true;
        btnSubmit.textContent = `Bloqueado (${restante}s)`;

        intervaloCuenta = setInterval(() => {
            restante--;
            if (restante <= 0) {
                clearInterval(intervaloCuenta);
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Ingresar';
                intentosFallidos = 0;
            } else {
                btnSubmit.textContent = `Bloqueado (${restante}s)`;
            }
        }, 1000);
    }

    // ============================================
    // MÓDULO: LÓGICA DE LOGIN
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

        const usuario = buscarUsuario(username);

        if (!usuario) {
            registrarIntentoFallido();
            showAlert(alertBox, 'Usuario no registrado. ¿Querés crear una cuenta?', 'error');
        } else if (usuario.password !== password) {
            registrarIntentoFallido();
            showAlert(alertBox, 'Contraseña incorrecta. Intentá de nuevo.', 'error');
        } else {
            intentosFallidos = 0;
            iniciarSesion(usuario.username);
            showAlert(alertBox, `¡Bienvenido, ${usuario.nombre || usuario.username}!`, 'success');
            clearForm(authForm);
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        }
    });

    function registrarIntentoFallido() {
        intentosFallidos++;
        if (intentosFallidos >= MAX_INTENTOS) {
            bloquearBoton();
        }
    }

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
