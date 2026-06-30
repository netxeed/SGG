/**
 * SGG - Sistema de Gestión de Gastos
 * registro.js
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
    const registroForm   = document.getElementById('registroForm');
    const nombreInput     = document.getElementById('nombre');
    const apellidoInput   = document.getElementById('apellido');
    const fechaInput      = document.getElementById('fechaNacimiento');
    const usernameInput   = document.getElementById('username');
    const passwordInput   = document.getElementById('password');
    const passwordRepeatInput = document.getElementById('passwordRepeat');

    const errorNombre     = document.getElementById('errorNombre');
    const errorApellido   = document.getElementById('errorApellido');
    const errorFecha      = document.getElementById('errorFecha');
    const errorUsername   = document.getElementById('errorUsername');
    const errorPasswordRepeat = document.getElementById('errorPasswordRepeat');

    const strengthBar  = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const reqLen = document.getElementById('reqLen');
    const reqMin = document.getElementById('reqMin');
    const reqMaj = document.getElementById('reqMaj');
    const reqNum = document.getElementById('reqNum');
    const reqSym = document.getElementById('reqSym');

    const alertBox  = document.getElementById('alertBox');
    const btnSubmit = document.getElementById('btnSubmit');

    const EDAD_MINIMA = 14;

    const estado = {
        nombre: false,
        apellido: false,
        fecha: false,
        username: true,
        passwordSegura: false,
        passwordsCoinciden: false
    };

    // ============================================
    // VALIDACIÓN: NOMBRE / APELLIDO
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
            mensaje = 'Solo se permiten letras (sin números ni símbolos).';
        }

        input.classList.toggle('input-invalid', !esValido && input.dataset.tocado === '1');
        errorEl.textContent = (!esValido && input.dataset.tocado === '1') ? mensaje : '';
        estado[campo] = esValido;
        actualizarBotonSubmit();
        return esValido;
    }

    nombreInput.addEventListener('blur', () => {
        nombreInput.dataset.tocado = '1';
        validarNombreApellido(nombreInput, errorNombre, 'nombre');
    });
    nombreInput.addEventListener('input', () => validarNombreApellido(nombreInput, errorNombre, 'nombre'));

    apellidoInput.addEventListener('blur', () => {
        apellidoInput.dataset.tocado = '1';
        validarNombreApellido(apellidoInput, errorApellido, 'apellido');
    });
    apellidoInput.addEventListener('input', () => validarNombreApellido(apellidoInput, errorApellido, 'apellido'));

    // ============================================
    // VALIDACIÓN: FECHA DE NACIMIENTO
    // ============================================
    function validarFecha() {
        const valor = fechaInput.value;
        let esValido = true;
        let mensaje = '';

        if (!valor) {
            esValido = false;
            mensaje = 'Ingresá tu fecha de nacimiento.';
        } else {
            const edad = calcularEdad(valor);
            const hoy = new Date();
            const fechaSeleccionada = new Date(valor + 'T00:00:00');

            if (fechaSeleccionada > hoy) {
                esValido = false;
                mensaje = 'La fecha no puede ser futura.';
            } else if (edad === null || edad < EDAD_MINIMA) {
                esValido = false;
                mensaje = `Debés tener al menos ${EDAD_MINIMA} años para registrarte.`;
            }
        }

        fechaInput.classList.toggle('input-invalid', !esValido && fechaInput.dataset.tocado === '1');
        errorFecha.textContent = (!esValido && fechaInput.dataset.tocado === '1') ? mensaje : '';
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
    // VALIDACIÓN: USUARIO
    // ============================================
    function validarUsername() {
        const valor = usernameInput.value.trim();
        let esValido = true;
        let mensaje = '';

        if (valor.length === 0) {
            esValido = false;
        } else if (existeUsuario(valor)) {
            esValido = false;
            mensaje = 'Ese nombre de usuario ya está en uso.';
        }

        usernameInput.classList.toggle('input-invalid', !esValido && usernameInput.dataset.tocado === '1' && valor.length > 0);
        errorUsername.textContent = (!esValido && usernameInput.dataset.tocado === '1' && valor.length > 0) ? mensaje : '';
        estado.username = esValido || valor.length === 0; 
        actualizarBotonSubmit();
        return esValido;
    }

    usernameInput.addEventListener('blur', () => {
        usernameInput.dataset.tocado = '1';
        validarUsername();
    });
    usernameInput.addEventListener('input', validarUsername);

    // ============================================
    // VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL
    // ============================================
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
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
        validarRepeticion();
        actualizarBotonSubmit();
    });

    function actualizarRequisito(elemento, cumplido, texto) {
        elemento.textContent = (cumplido ? '✅ ' : '✖️ ') + texto;
        elemento.classList.toggle('met', cumplido);
    }

    // ============================================
    // VALIDACIÓN: REPETIR CONTRASEÑA
    // ============================================
    function validarRepeticion() {
        const password = passwordInput.value;
        const repetida = passwordRepeatInput.value;
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

    // ============================================
    // HABILITAR / DESHABILITAR BOTÓN SUBMIT
    // ============================================
    function actualizarBotonSubmit() {
        const todoValido =
            estado.nombre &&
            estado.apellido &&
            estado.fecha &&
            estado.username &&
            estado.passwordSegura &&
            estado.passwordsCoinciden;

        btnSubmit.disabled = !todoValido;
    }

    // ============================================
    // ENVÍO DEL FORMULARIO
    // ============================================
    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        nombreInput.dataset.tocado = '1';
        apellidoInput.dataset.tocado = '1';
        fechaInput.dataset.tocado = '1';
        usernameInput.dataset.tocado = '1';

        const nombreOk   = validarNombreApellido(nombreInput, errorNombre, 'nombre');
        const apellidoOk = validarNombreApellido(apellidoInput, errorApellido, 'apellido');
        const fechaOk    = validarFecha();
        const usernameOk = validarUsername() && usernameInput.value.trim().length > 0;
        const repiteOk   = validarRepeticion();
        const passwordChecks = evaluarPassword(passwordInput.value);

        if (!nombreOk || !apellidoOk || !fechaOk || !usernameOk) {
            showAlert(alertBox, 'Revisá los campos marcados antes de continuar.', 'error');
            return;
        }

        if (!passwordChecks.esValida) {
            showAlert(alertBox, 'La contraseña no cumple con los requisitos de seguridad.', 'error');
            return;
        }

        if (!repiteOk) {
            showAlert(alertBox, 'Las contraseñas no coinciden.', 'error');
            return;
        }

        const resultado = agregarUsuario({
            username: usernameInput.value.trim(),
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
        estado.nombre = false;
        estado.apellido = false;
        estado.fecha = false;
        estado.username = true;
        estado.passwordSegura = false;
        estado.passwordsCoinciden = false;
        actualizarBotonSubmit();

        [nombreInput, apellidoInput, fechaInput, usernameInput, passwordRepeatInput].forEach(el => {
            el.classList.remove('input-invalid');
            el.dataset.tocado = '0';
        });
        [errorNombre, errorApellido, errorFecha, errorUsername, errorPasswordRepeat].forEach(el => el.textContent = '');

        strengthBar.style.width = '0%';
        strengthBar.className = 'strength-bar';
        strengthText.textContent = 'Seguridad: Insegura';
        strengthText.className = 'strength-text';
        [reqLen, reqMin, reqMaj, reqNum, reqSym].forEach(el => el.classList.remove('met'));
        reqLen.textContent = '❌ Mínimo 8 caracteres';
        reqMin.textContent = '❌ Una letra minúscula';
        reqMaj.textContent = '❌ Una letra mayúscula';
        reqNum.textContent = '❌ Un número';
        reqSym.textContent = '❌ Un símbolo (ej. !@#$%^&*)';
    }

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
