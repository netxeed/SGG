/**
 * SGG - Sistema de Gestión de Gastos
 * registro.js
 *
 * Depende de usuarios.js y password-strength.js (deben cargarse antes en el HTML).
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

    // Estado de validez de cada bloque del formulario
    const estado = {
        nombre: false,
        apellido: false,
        fecha: false,
        username: false,   // ahora es false por defecto
        passwordSegura: false,
        passwordsCoinciden: false
    };

    // ============================================
    // FUNCIÓN AUXILIAR PARA ERRORES (accesibilidad)
    // ============================================
    function setFieldError(input, errorEl, esValido, mensaje) {
        const mostrarError = !esValido && input.dataset.tocado === '1';
        input.classList.toggle('input-invalid', mostrarError);
        errorEl.textContent = mostrarError ? mensaje : '';

        // Atributos ARIA
        input.setAttribute('aria-invalid', mostrarError ? 'true' : 'false');
        input.setAttribute('aria-describedby', errorEl.id);
        errorEl.setAttribute('role', 'alert');
    }

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

        setFieldError(input, errorEl, esValido, mensaje);
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

        setFieldError(fechaInput, errorFecha, esValido, mensaje);
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
    // VALIDACIÓN: USUARIO (duplicados)
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

        setFieldError(usernameInput, errorUsername, esValido, mensaje);
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
    // VALIDACIÓN DE CONTRASEÑA (usa módulo externo)
    // ============================================
    passwordInput.addEventListener('input', () => {
        estado.passwordSegura = actualizarFortaleza(
            passwordInput,
            strengthBar,
            strengthText,
            { reqLen, reqMin, reqMaj, reqNum, reqSym }
        );
        validarRepeticion();
        actualizarBotonSubmit();
    });

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
            // No mostramos error si está vacío, solo si hay discrepancia
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

        // Revalidamos todo
        nombreInput.dataset.tocado = '1';
        apellidoInput.dataset.tocado = '1';
        fechaInput.dataset.tocado = '1';
        usernameInput.dataset.tocado = '1';

        const nombreOk   = validarNombreApellido(nombreInput, errorNombre, 'nombre');
        const apellidoOk = validarNombreApellido(apellidoInput, errorApellido, 'apellido');
        const fechaOk    = validarFecha();
        validarUsername(); // actualiza estado.username
        const repiteOk   = validarRepeticion();

        if (!nombreOk || !apellidoOk || !fechaOk || !estado.username) {
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
        estado.username = false;
        estado.passwordSegura = false;
        estado.passwordsCoinciden = false;
        actualizarBotonSubmit();

        [nombreInput, apellidoInput, fechaInput, usernameInput, passwordRepeatInput].forEach(el => {
            el.classList.remove('input-invalid');
            el.dataset.tocado = '0';
            el.removeAttribute('aria-invalid');
        });
        [errorNombre, errorApellido, errorFecha, errorUsername, errorPasswordRepeat].forEach(el => {
            el.textContent = '';
            el.removeAttribute('role');
        });

        strengthBar.style.width = '0%';
        strengthBar.className = 'strength-bar';
        strengthText.textContent = 'Seguridad: Insegura';
        strengthText.className = 'strength-text';
        [reqLen, reqMin, reqMaj, reqNum, reqSym].forEach(el => el.classList.remove('met'));
        reqLen.textContent = '✗ Mínimo 8 caracteres';
        reqMin.textContent = '✗ Una letra minúscula';
        reqMaj.textContent = '✗ Una letra mayúscula';
        reqNum.textContent = '✗ Un número';
        reqSym.textContent = '✗ Un símbolo (ej. !@#$%^&*)';
    }

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