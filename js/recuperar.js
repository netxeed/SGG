/**
 * SGG - Sistema de Gestión de Gastos
 * recuperar.js
 *
 * Depende de usuarios.js y password-strength.js (deben cargarse antes en el HTML).
 *
 * Dos modos de uso, mismo formulario:
 *  - MODO RECUPERAR (sin sesión, default):
 *      Paso 1) Verificar identidad: usuario + fecha de nacimiento.
 *      Paso 2) Nueva contraseña (distinta a la guardada) + repetir.
 *      Al terminar, vuelve a index.html.
 *
 *  - MODO CAMBIAR (con sesión activa, recuperar.html?modo=cambiar):
 *      Se salta el Paso 1 (ya sabemos quién es por la sesión).
 *      Va directo al Paso 2, sin saludo.
 *      Al terminar, vuelve a dashboard.html.
 */

document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();

    // ============================================
    // SWITCH DE TEMA
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
    // SELECTORES
    // ============================================
    const verificarForm = document.getElementById('verificarForm');
    const resetForm      = document.getElementById('resetForm');

    const usernameInput  = document.getElementById('username');
    const fechaInput      = document.getElementById('fechaNacimiento');

    const passwordNuevaInput  = document.getElementById('passwordNueva');
    const passwordRepeatInput = document.getElementById('passwordRepeat');
    const errorPasswordIgual  = document.getElementById('errorPasswordIgual');
    const errorPasswordRepeat = document.getElementById('errorPasswordRepeat');

    const strengthBar  = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const reqLen = document.getElementById('reqLen');
    const reqMin = document.getElementById('reqMin');
    const reqMaj = document.getElementById('reqMaj');
    const reqNum = document.getElementById('reqNum');
    const reqSym = document.getElementById('reqSym');

    const formTitle    = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const alertBox     = document.getElementById('alertBox');
    const btnSubmit    = document.getElementById('btnSubmit');
    const volverLink   = document.getElementById('volverLink');

    let usuarioVerificado = null;

    const estado = {
        passwordSegura: false,
        passwordsCoinciden: false,
        passwordDistinta: false
    };

    // ============================================
    // FUNCIÓN AUXILIAR PARA ERRORES (accesibilidad)
    // ============================================
    function setFieldError(input, errorEl, esValido, mensaje, mostrar = true) {
        const mostrarError = mostrar && !esValido && mensaje.length > 0;
        input.classList.toggle('input-invalid', mostrarError);
        errorEl.textContent = mostrarError ? mensaje : '';

        input.setAttribute('aria-invalid', mostrarError ? 'true' : 'false');
        input.setAttribute('aria-describedby', errorEl.id);
        errorEl.setAttribute('role', 'alert');
    }

    // ============================================
    // DETECCIÓN DE MODO
    // ============================================
    const params = new URLSearchParams(window.location.search);
    const modoCambiar = params.get('modo') === 'cambiar';
    const sesion = obtenerSesion();

    if (modoCambiar && sesion) {
        const usuarioSesion = buscarUsuario(sesion.username);

        if (usuarioSesion) {
            usuarioVerificado = usuarioSesion;
            verificarForm.style.display = 'none';
            resetForm.style.display = 'flex';

            formTitle.textContent = 'Cambiar Contraseña';
            formSubtitle.textContent = 'Elegí tu nueva contraseña';

            volverLink.textContent = 'Volver al panel';
            volverLink.setAttribute('href', 'dashboard.html');
        } else {
            // Usuario de sesión no existe en el almacenamiento
            cerrarSesion();
            window.location.href = 'index.html';
            return;
        }
    }

    // ============================================
    // PASO 1: VERIFICACIÓN DE IDENTIDAD
    // ============================================
    verificarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        const username = usernameInput.value.trim();
        const fecha    = fechaInput.value;

        if (!username || !fecha) {
            showAlert(alertBox, 'Completá usuario y fecha de nacimiento.', 'error');
            return;
        }

        const usuario = buscarUsuario(username);

        if (!usuario || usuario.fechaNacimiento !== fecha) {
            showAlert(alertBox, 'Los datos no coinciden con ningún usuario registrado.', 'error');
            return;
        }

        usuarioVerificado = usuario;
        hideAlert(alertBox);

        verificarForm.style.display = 'none';
        resetForm.style.display = 'flex';
        formTitle.textContent = 'Nueva Contraseña';
        formSubtitle.textContent = 'Elegí tu nueva contraseña';
    });

    // ============================================
    // PASO 2: VALIDACIÓN DE NUEVA CONTRASEÑA
    // ============================================
    passwordNuevaInput.addEventListener('input', () => {
        estado.passwordSegura = actualizarFortaleza(
            passwordNuevaInput,
            strengthBar,
            strengthText,
            { reqLen, reqMin, reqMaj, reqNum, reqSym }
        );

        // Comparación contra la contraseña actual guardada
        if (usuarioVerificado && passwordNuevaInput.value.length > 0) {
            const esIgual = passwordNuevaInput.value === usuarioVerificado.password;
            estado.passwordDistinta = !esIgual;
            setFieldError(
                passwordNuevaInput,
                errorPasswordIgual,
                !esIgual,
                'La nueva contraseña no puede ser igual a la actual.',
                true
            );
        } else {
            estado.passwordDistinta = false;
            setFieldError(passwordNuevaInput, errorPasswordIgual, true, '', false);
        }

        validarRepeticion();
        actualizarBotonSubmit();
    });

    // ============================================
    // VALIDACIÓN: REPETIR CONTRASEÑA
    // ============================================
    function validarRepeticion() {
        const password = passwordNuevaInput.value;
        const repetida  = passwordRepeatInput.value;
        let esValido = true;
        let mensaje = '';

        if (repetida.length === 0) {
            esValido = false;
            // No mostramos error si está vacío
        } else if (password !== repetida) {
            esValido = false;
            mensaje = 'Las contraseñas no coinciden.';
        }

        setFieldError(passwordRepeatInput, errorPasswordRepeat, esValido, mensaje, true);
        estado.passwordsCoinciden = esValido && repetida.length > 0;
        actualizarBotonSubmit();
        return estado.passwordsCoinciden;
    }

    passwordRepeatInput.addEventListener('input', validarRepeticion);

    // ============================================
    // HABILITAR / DESHABILITAR BOTÓN SUBMIT
    // ============================================
    function actualizarBotonSubmit() {
        btnSubmit.disabled = !(estado.passwordSegura && estado.passwordsCoinciden && estado.passwordDistinta);
    }

    // ============================================
    // ENVÍO: CAMBIO DE CONTRASEÑA
    // ============================================
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        if (!usuarioVerificado) {
            showAlert(alertBox, 'Tenés que verificar tu identidad primero.', 'error');
            return;
        }

        const nuevaPassword = passwordNuevaInput.value;
        const repetida       = passwordRepeatInput.value;
        const checks = evaluarPassword(nuevaPassword);

        if (!checks.esValida) {
            showAlert(alertBox, 'La contraseña no cumple con los requisitos de seguridad.', 'error');
            return;
        }

        if (nuevaPassword !== repetida) {
            showAlert(alertBox, 'Las contraseñas no coinciden.', 'error');
            return;
        }

        if (nuevaPassword === usuarioVerificado.password) {
            showAlert(alertBox, 'La nueva contraseña no puede ser igual a la actual.', 'error');
            return;
        }

        const resultado = actualizarPassword(usuarioVerificado.username, nuevaPassword);

        if (!resultado.ok) {
            showAlert(alertBox, resultado.mensaje, 'error');
            return;
        }

        const destino = (modoCambiar && sesion) ? 'dashboard.html' : 'index.html';
        showAlert(alertBox, '¡Contraseña actualizada!', 'success');
        resetForm.reset();
        setTimeout(() => { window.location.href = destino; }, 1500);
    });

    // ============================================
    // FUNCIONES AUXILIARES (DRY)
    // ============================================
    function showAlert(element, message, type) {
        element.textContent = message;
        element.className   = `alert-message ${type}`;
        element.setAttribute('role', 'alert');
    }

    function hideAlert(element) {
        element.textContent = '';
        element.className   = 'alert-message';
        element.removeAttribute('role');
    }

});