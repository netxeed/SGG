/**
 * SGG - Sistema de Gestión de Gastos
 * login.js
 *
 * Depende de usuarios.js y ui.js (cargarse antes en el HTML).
 */

document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();

    const authForm      = document.getElementById('authForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const alertBox      = document.getElementById('alertBox');
    const btnSubmit     = document.getElementById('btnSubmit');

    // ============================================
    // BLOQUEO POR INTENTOS FALLIDOS
    // 3 intentos fallidos -> botón bloqueado 30 s.
    // El estado se guarda en sessionStorage, así que
    // recargar la página NO reinicia el bloqueo.
    // ============================================
    const MAX_INTENTOS   = 3;
    const TIEMPO_BLOQUEO = 30; // segundos
    const BLOQUEO_KEY    = 'sgg_bloqueo';
    let intervaloCuenta  = null;

    function leerBloqueo() {
        try {
            return JSON.parse(sessionStorage.getItem(BLOQUEO_KEY)) || { intentos: 0, hasta: 0 };
        } catch (e) {
            return { intentos: 0, hasta: 0 };
        }
    }

    function guardarBloqueo(estado) {
        sessionStorage.setItem(BLOQUEO_KEY, JSON.stringify(estado));
    }

    /** Refleja el estado en el botón. Devuelve true si sigue bloqueado. */
    function actualizarBoton() {
        const estado = leerBloqueo();
        const restante = Math.ceil((estado.hasta - Date.now()) / 1000);

        if (restante > 0) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = `Bloqueado (${restante}s)`;
            return true;
        }

        if (estado.hasta) guardarBloqueo({ intentos: 0, hasta: 0 });
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Ingresar';
        return false;
    }

    function iniciarCuenta() {
        if (intervaloCuenta || !actualizarBoton()) return;
        intervaloCuenta = setInterval(() => {
            if (!actualizarBoton()) {
                clearInterval(intervaloCuenta);
                intervaloCuenta = null;
            }
        }, 1000);
    }

    function registrarIntentoFallido() {
        const estado = leerBloqueo();
        estado.intentos++;
        if (estado.intentos >= MAX_INTENTOS) {
            estado.hasta = Date.now() + TIEMPO_BLOQUEO * 1000;
        }
        guardarBloqueo(estado);
        iniciarCuenta();
    }

    // Si la página se recargó en pleno bloqueo, lo retomamos
    iniciarCuenta();

    // ============================================
    // LÓGICA DE LOGIN
    // ============================================
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        if (btnSubmit.disabled) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value; // sin trim: igual que en registro

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
            sessionStorage.removeItem(BLOQUEO_KEY);
            iniciarSesion(usuario.username);
            showAlert(alertBox, `¡Bienvenido, ${usuario.nombre || usuario.username}!`, 'success');
            authForm.reset();
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        }
    });

});
