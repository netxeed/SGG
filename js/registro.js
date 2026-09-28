/**
 * SGG - Sistema de Gestión de Gastos
 * registro.js
 *
 * Depende de usuarios.js, ui.js, password-strength.js y password-toggle.js.
 */

document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();

    // ============================================
    // SELECTORES
    // ============================================
    const registroForm        = document.getElementById('registroForm');
    const nombreInput         = document.getElementById('nombre');
    const apellidoInput       = document.getElementById('apellido');
    const fechaInput          = document.getElementById('fechaNacimiento');
    const usernameInput       = document.getElementById('username');
    const passwordInput       = document.getElementById('password');
    const passwordRepeatInput = document.getElementById('passwordRepeat');

    const errorNombre         = document.getElementById('errorNombre');
    const errorApellido       = document.getElementById('errorApellido');
    const errorFecha          = document.getElementById('errorFecha');
    const errorUsername       = document.getElementById('errorUsername');
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

    const alertBox  = document.getElementById('alertBox');
    const btnSubmit = document.getElementById('btnSubmit');

    // Límites del selector de fecha (hoy como máximo, 1900 como mínimo)
    fechaInput.max = fechaHoyISO();
    fechaInput.min = FECHA_MINIMA;

    // Estado de validez de cada bloque
    const estado = {
        nombre: false,
        apellido: false,
        fecha: false,
        username: false,
        passwordSegura: false,
        passwordsCoinciden: false
    };

    // Dibuja los requisitos de contraseña desde el módulo compartido
    actualizarFortaleza(passwordInput, strengthBar, strengthText, reqElements);

    /** Los errores solo se muestran una vez que el campo fue "tocado". */
    function mostrarError(input, errorEl, esValido, mensaje) {
        setFieldError(input, errorEl, esValido, mensaje, input.dataset.tocado === '1');
    }

    // ============================================
    // NOMBRE / APELLIDO
    // ============================================
    function validarNombreApellido(input, errorEl, campo) {
        const valor = input.value.trim();
        let esValido = true;
        let mensaje = '';

        if (valor.length === 0) {
            esValido = false;
            mensaje = 'Este campo es obligatorio.';
        } else if (!validarSoloLetras(valor)) {
            esValido = false;
            mensaje = 'Solo letras (se permiten espacios, guiones y apóstrofes entre palabras).';
        }

        mostrarError(input, errorEl, esValido, mensaje);
        estado[campo] = esValido;
        actualizarBotonSubmit();
        return esValido;
    }

    [
        [nombreInput, errorNombre, 'nombre'],
        [apellidoInput, errorApellido, 'apellido']
    ].forEach(([input, errorEl, campo]) => {
        input.addEventListener('blur', () => {
            input.dataset.tocado = '1';
            validarNombreApellido(input, errorEl, campo);
        });
        input.addEventListener('input', () => validarNombreApellido(input, errorEl, campo));
    });

    // ============================================
    // FECHA DE NACIMIENTO
    // ============================================
    function validarFecha() {
        const mensaje = validarFechaNacimiento(fechaInput.value);
        const esValido = mensaje === '';

        mostrarError(fechaInput, errorFecha, esValido, mensaje);
        estado.fecha = esValido;
        actualizarBotonSubmit();
        return esValido;
    }

    fechaInput.addEventListener('blur', () => {
        fechaInput.dataset.tocado = '1';
        validarFecha();
    });
    fechaInput.addEventListener('change', validarFecha);

    // ============================================
    // USUARIO (duplicados)
    // ============================================
    function validarUsername() {
        const valor = usernameInput.value.trim();
        let esValido = true;
        let mensaje = '';

        if (valor.length === 0) {
            esValido = false;
            mensaje = 'Este campo es obligatorio.';
        } else if (existeUsuario(valor)) {
            esValido = false;
            mensaje = 'Ese nombre de usuario ya está en uso.';
        }

        mostrarError(usernameInput, errorUsername, esValido, mensaje);
        estado.username = esValido;
        actualizarBotonSubmit();
        return esValido;
    }

    usernameInput.addEventListener('blur', () => {
        usernameInput.dataset.tocado = '1';
        validarUsername();
    });
    usernameInput.addEventListener('input', validarUsername);

    // ============================================
    // CONTRASEÑA
    // ============================================
    passwordInput.addEventListener('input', () => {
        estado.passwordSegura = actualizarFortaleza(
            passwordInput, strengthBar, strengthText, reqElements
        );
        validarRepeticion();
        actualizarBotonSubmit();
    });

    function validarRepeticion() {
        const password = passwordInput.value;
        const repetida = passwordRepeatInput.value;
        let esValido = true;
        let mensaje = '';

        if (repetida.length === 0) {
            esValido = false; // sin mensaje: solo avisamos si hay discrepancia
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

    // ============================================
    // BOTÓN SUBMIT
    // ============================================
    function actualizarBotonSubmit() {
        btnSubmit.disabled = !Object.values(estado).every(Boolean);
    }

    // ============================================
    // ENVÍO
    // ============================================
    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        [nombreInput, apellidoInput, fechaInput, usernameInput].forEach(el => {
            el.dataset.tocado = '1';
        });

        const nombreOk   = validarNombreApellido(nombreInput, errorNombre, 'nombre');
        const apellidoOk = validarNombreApellido(apellidoInput, errorApellido, 'apellido');
        const fechaOk    = validarFecha();
        const usuarioOk  = validarUsername();
        const repiteOk   = validarRepeticion();

        if (!nombreOk || !apellidoOk || !fechaOk || !usuarioOk) {
            showAlert(alertBox, 'Revisá los campos marcados antes de continuar.', 'error');
            return;
        }
        if (!estado.passwordSegura) {
            showAlert(alertBox, 'La contraseña no cumple con los requisitos de seguridad.', 'error');
            return;
        }
        if (!repiteOk) {
            showAlert(alertBox, 'Las contraseñas no coinciden.', 'error');
            return;
        }

        const resultado = agregarUsuario({
            username: usernameInput.value,
            password: passwordInput.value,
            nombre: nombreInput.value,
            apellido: apellidoInput.value,
            fechaNacimiento: fechaInput.value
        });

        if (!resultado.ok) {
            showAlert(alertBox, resultado.mensaje, 'error');
            return;
        }

        showAlert(alertBox, '¡Registro exitoso! Ya podés iniciar sesión.', 'success');
        registroForm.reset();
        resetearEstadoVisual();
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    });

    function resetearEstadoVisual() {
        Object.keys(estado).forEach(k => { estado[k] = false; });
        actualizarBotonSubmit();

        [nombreInput, apellidoInput, fechaInput, usernameInput, passwordRepeatInput].forEach(el => {
            el.classList.remove('input-invalid');
            el.dataset.tocado = '0';
            el.removeAttribute('aria-invalid');
        });
        [errorNombre, errorApellido, errorFecha, errorUsername, errorPasswordRepeat].forEach(el => {
            el.textContent = '';
        });

        ocultarTodasLasPasswords();
        actualizarFortaleza(passwordInput, strengthBar, strengthText, reqElements);
    }

});
