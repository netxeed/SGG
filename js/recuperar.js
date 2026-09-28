/**
 * SGG - Sistema de Gestión de Gastos
 * recuperar.js
 *
 * Depende de usuarios.js, ui.js y password-strength.js.
 *
 * Dos modos, mismo formulario:
 *  - RECUPERAR (sin sesión): Paso 1 verifica usuario + fecha de nacimiento,
 *    Paso 2 pide la nueva contraseña. Al terminar vuelve a index.html.
 *  - CAMBIAR (recuperar.html?modo=cambiar, con sesión): salta el Paso 1.
 *    Al terminar vuelve a dashboard.html.
 */

document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();

    // ============================================
    // SELECTORES
    // ============================================
    const verificarForm = document.getElementById('verificarForm');
    const resetForm     = document.getElementById('resetForm');

    const usernameInput = document.getElementById('username');
    const fechaInput    = document.getElementById('fechaNacimiento');

    const passwordNuevaInput  = document.getElementById('passwordNueva');
    const passwordRepeatInput = document.getElementById('passwordRepeat');
    const errorPasswordIgual  = document.getElementById('errorPasswordIgual');
    const errorPasswordRepeat = document.getElementById('errorPasswordRepeat');

    const strengthBar  = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const reqElements = {
        reqLen: document.getElementById('reqLen'),
        reqMin: document.getElementById('reqMin'),
        reqMaj: document.getElementById('reqMaj'),
        reqNum: document.getElementById('reqNum'),
        reqSym: document.getElementById('reqSym')
    };

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

    // Dibuja los requisitos de contraseña desde el módulo compartido
    actualizarFortaleza(passwordNuevaInput, strengthBar, strengthText, reqElements);

    function mostrarPaso2() {
        verificarForm.classList.add('hidden');
        resetForm.classList.remove('hidden');
    }

    // ============================================
    // DETECCIÓN DE MODO
    // ============================================
    const params = new URLSearchParams(window.location.search);
    const modoCambiar = params.get('modo') === 'cambiar';
    const sesion = obtenerSesion();

    if (modoCambiar && sesion) {
        const usuarioSesion = buscarUsuario(sesion.username);

        if (!usuarioSesion) {
            cerrarSesion();
            window.location.href = 'index.html';
            return;
        }

        usuarioVerificado = usuarioSesion;
        mostrarPaso2();
        formTitle.textContent = 'Cambiar Contraseña';
        formSubtitle.textContent = 'Elegí tu nueva contraseña';
        volverLink.textContent = 'Volver al panel';
        volverLink.setAttribute('href', 'dashboard.html');
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
        mostrarPaso2();
        formTitle.textContent = 'Nueva Contraseña';
        formSubtitle.textContent = 'Elegí tu nueva contraseña';
    });

    // ============================================
    // PASO 2: NUEVA CONTRASEÑA
    // ============================================
    passwordNuevaInput.addEventListener('input', () => {
        estado.passwordSegura = actualizarFortaleza(
            passwordNuevaInput, strengthBar, strengthText, reqElements
        );

        // Debe ser distinta de la contraseña actual
        if (usuarioVerificado && passwordNuevaInput.value.length > 0) {
            const esIgual = passwordNuevaInput.value === usuarioVerificado.password;
            estado.passwordDistinta = !esIgual;
            setFieldError(
                passwordNuevaInput, errorPasswordIgual, !esIgual,
                'La nueva contraseña no puede ser igual a la actual.'
            );
        } else {
            estado.passwordDistinta = false;
            setFieldError(passwordNuevaInput, errorPasswordIgual, true, '');
        }

        validarRepeticion();
        actualizarBotonSubmit();
    });

    function validarRepeticion() {
        const password = passwordNuevaInput.value;
        const repetida = passwordRepeatInput.value;
        let esValido = true;
        let mensaje = '';

        if (repetida.length === 0) {
            esValido = false;
        } else if (password !== repetida) {
            esValido = false;
            mensaje = 'Las contraseñas no coinciden.';
        }

        setFieldError(passwordRepeatInput, errorPasswordRepeat, esValido, mensaje);
        estado.passwordsCoinciden = esValido && repetida.length > 0;
        actualizarBotonSubmit();
        return estado.passwordsCoinciden;
    }

    passwordRepeatInput.addEventListener('input', validarRepeticion);

    function actualizarBotonSubmit() {
        btnSubmit.disabled = !(estado.passwordSegura && estado.passwordsCoinciden && estado.passwordDistinta);
    }

    // ============================================
    // ENVÍO
    // ============================================
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        if (!usuarioVerificado) {
            showAlert(alertBox, 'Tenés que verificar tu identidad primero.', 'error');
            return;
        }

        const nuevaPassword = passwordNuevaInput.value;

        if (!evaluarPassword(nuevaPassword).esValida) {
            showAlert(alertBox, 'La contraseña no cumple con los requisitos de seguridad.', 'error');
            return;
        }
        if (nuevaPassword !== passwordRepeatInput.value) {
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

});