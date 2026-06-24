/**
 * SGG - Sistema de Gestión de Gastos
 * login.js — Segundo Incremento: registro
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
    const authForm                = document.getElementById('authForm');
    const usernameInput           = document.getElementById('username');
    const passwordInput           = document.getElementById('password');
    const passwordStrengthWrapper = document.getElementById('passwordStrengthWrapper');
    const strengthBar             = document.getElementById('strengthBar');
    const strengthText            = document.getElementById('strengthText');
    const reqMin                  = document.getElementById('reqMin');
    const reqMaj                  = document.getElementById('reqMaj');
    const reqSym                  = document.getElementById('reqSym');
    const alertBox                = document.getElementById('alertBox');
    const btnSubmit               = document.getElementById('btnSubmit');
    const formTitle               = document.getElementById('formTitle');
    const formSubtitle            = document.getElementById('formSubtitle');
    const toggleFormLink          = document.getElementById('toggleFormLink');
    const toggleText              = document.getElementById('toggleText');

    let isLoginMode = true;

    // ============================================
    // MÓDULO 4: ALTERNAR LOGIN / REGISTRO
    // ============================================
    toggleFormLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        clearForm(authForm);
        hideAlert(alertBox);

        // Mostrar/ocultar medidor de seguridad según el modo
        passwordStrengthWrapper.style.display = isLoginMode ? 'none' : 'block';
        resetStrengthBar();

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
    // MÓDULO 4.5: EVALUACIÓN DE CONTRASEÑA EN TIEMPO REAL
    // ============================================
    passwordInput.addEventListener('input', (e) => {
        if (isLoginMode) return; // Solo evaluar si está creando cuenta

        const password = e.target.value;
        let strength = 0;

        // Comprobaciones usando Expresiones Regulares
        const hasMin = /[a-z]/.test(password);
        const hasMaj = /[A-Z]/.test(password);
        const hasSym = /[^a-zA-Z0-9]/.test(password);

        // Actualizar los checkmarks visuales
        reqMin.textContent = hasMin ? '✅ Una letra minúscula' : '❌ Una letra minúscula';
        reqMin.classList.toggle('met', hasMin);

        reqMaj.textContent = hasMaj ? '✅ Una letra mayúscula' : '❌ Una letra mayúscula';
        reqMaj.classList.toggle('met', hasMaj);

        reqSym.textContent = hasSym ? '✅ Un símbolo (ej. !@#$%^&*)' : '❌ Un símbolo (ej. !@#$%^&*)';
        reqSym.classList.toggle('met', hasSym);

        // Calcular puntaje total de fortaleza (de 0 a 4)
        if (password.length >= 6) strength++;
        if (hasMin) strength++;
        if (hasMaj) strength++;
        if (hasSym) strength++;

        // Reiniciar las clases CSS dinámicas antes de aplicar nuevas
        strengthBar.className = 'strength-bar';
        strengthText.className = 'strength-text';

        // Actualizar el ancho y color de la barra según el puntaje
        if (password.length === 0) {
            strengthBar.style.width = '0%';
            strengthText.textContent = 'Seguridad: Insegura';
        } else if (strength <= 1) {
            strengthBar.style.width = '25%';
            strengthBar.classList.add('level-1');
            strengthText.textContent = 'Seguridad: Débil';
            strengthText.classList.add('level-1');
        } else if (strength === 2) {
            strengthBar.style.width = '50%';
            strengthBar.classList.add('level-2');
            strengthText.textContent = 'Seguridad: Regular';
            strengthText.classList.add('level-2');
        } else if (strength === 3) {
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

    function resetStrengthBar() {
        if (strengthBar)  strengthBar.style.width           = '0%';
        if (strengthBar)  strengthBar.style.backgroundColor = '';
        if (strengthText) strengthText.textContent          = 'Seguridad: Insegura';
        if (reqMin) reqMin.textContent = '❌ Una letra minúscula';
        if (reqMaj) reqMaj.textContent = '❌ Una letra mayúscula';
        if (reqSym) reqSym.textContent = '❌ Un símbolo (ej. !@#$%^&*)';
    }

});
