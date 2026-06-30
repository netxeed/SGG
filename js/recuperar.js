/**
 * SGG - Sistema de Gestión de Gastos
 * recuperar.js
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
        themeIcon.textContent = '☼';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        themeIcon.textContent = isDark ? '☼' : '☾';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ============================================
    // SELECTORES
    // ============================================
    const verificarForm = document.getElementById('verificarForm');
    const resetForm      = document.getElementById('resetForm');

    const usernameInput  = document.getElementById('username');
    const fechaInput      = document.getElementById('fechaNacimiento');
    const btnVerificar   = document.getElementById('btnVerificar');

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

    let usuarioVerificado = null; 

    const estado = {
        passwordSegura: false,
        passwordsCoinciden: false,
        passwordDistinta: false
    };

    // ============================================
    // INICIO RÁPIDO PARA DASHBOARD COMPACTO
    // ============================================
    const sesionActiva = sessionStorage.getItem('sesionActivaSGG');
    if (sesionActiva) {
        const usuario = buscarUsuario(sesionActiva);
        if (usuario) {
            usuarioVerificado = usuario;
            verificarForm.style.display = 'none';
            resetForm.style.display = 'flex';
            formTitle.textContent = 'Cambiar Contraseña';
            formSubtitle.textContent = 'Elegí tu nueva contraseña'; // Saludo genérico según requerimiento
            sessionStorage.removeItem('sesionActivaSGG'); // Consumimos la sesión
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
        const password = passwordNuevaInput.value;
        const checks = evaluarPassword(password);

        actualizarRequisito(reqLen, checks.longitud, 'Mínimo 8 caracteres');
        actualizarRequisito(reqMin, checks.minuscula, 'Una letra minúscula');
        actualizarRequisito(reqMaj, checks.mayuscula, 'Una letra mayúscula');
        actualizarRequisito(reqNum, checks.numero, 'Un número');
        actualizarRequisito(reqSym, checks.simbolo, 'Un símbolo (ej. !@#$%^&*)');

        const cantidadCumplidos = [checks.longitud, checks.minuscula, checks.mayuscula, checks.numero, checks.simbolo]
            .filter(Boolean).length;

        strengthBar.className = 'strength-bar';
        strengthText.className = 'strength-text';

        if (password.length === 0) {
            strengthBar.style.width = '0%';
            strengthText.textContent = 'Seguridad: Insegura';
        } else if (cantidadCumplidos <= 2) {
            strengthBar.style.width = '25%';
            strengthBar.classList.add('level-1');
            strengthText.textContent = 'Seguridad: Débil';
            strengthText.classList.add('level-1');
        } else if (cantidadCumplidos === 3) {
            strengthBar.style.width = '50%';
            strengthBar.classList.add('level-2');
            strengthText.textContent = 'Seguridad: Regular';
            strengthText.classList.add('level-2');
        } else if (cantidadCumplidos === 4) {
            strengthBar.style.width = '75%';
            strengthBar.classList.add('level-3');
            strengthText.textContent = 'Seguridad: Buena';
            strengthText.classList.add('level-3');
        } else {
            strengthBar.style.width = '100%';
            strengthBar.classList.add('level-4');
            strengthText.textContent = 'Seguridad: Fuerte';
            strengthText.classList.add('level-4');
        }

        estado.passwordSegura = checks.esValida;

        if (usuarioVerificado && password.length > 0) {
            const esIgual = password === usuarioVerificado.password;
            estado.passwordDistinta = !esIgual;
            errorPasswordIgual.textContent = esIgual ? 'La nueva contraseña no puede ser igual a la actual.' : '';
            passwordNuevaInput.classList.toggle('input-invalid', esIgual);
        } else {
            estado.passwordDistinta = false;
            errorPasswordIgual.textContent = '';
            passwordNuevaInput.classList.remove('input-invalid');
        }

        validarRepeticion();
        actualizarBotonSubmit();
    });

    function actualizarRequisito(elemento, cumplido, texto) {
        elemento.textContent = (cumplido ? '✅ ' : '✖️ ') + texto;
        elemento.classList.toggle('met', cumplido);
    }

    function validarRepeticion() {
        const password = passwordNuevaInput.value;
        const repetida  = passwordRepeatInput.value;
        let esValido = true;
        let mensaje = '';

        if (repetida.length === 0) {
            esValido = false;
        } else if (password !== repetida) {
            esValido = false;
            mensaje = 'Las contraseñas no coinciden.';
        }

        const mostrarError = repetida.length > 0 && !esValido;
        passwordRepeatInput.classList.toggle('input-invalid', mostrarError);
        errorPasswordRepeat.textContent = mostrarError ? mensaje : '';

        estado.passwordsCoinciden = esValido && repetida.length > 0;
        actualizarBotonSubmit();
        return estado.passwordsCoinciden;
    }

    passwordRepeatInput.addEventListener('input', validarRepeticion);

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

        showAlert(alertBox, '¡Contraseña actualizada! Ya podés iniciar sesión.', 'success');
        resetForm.reset();
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    });

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
    function showAlert(element, message, type) {
        element.textContent = message;
        element.className   = `alert-message ${type}`;
    }

    function hideAlert(element) {
        element.textContent = '';
        element.className   = 'alert-message';
    }

});
