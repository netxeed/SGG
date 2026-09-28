/**
 * SGG - Sistema de Gestión de Gastos
 * password-strength.js — Módulo compartido para validación de contraseña
 *
 * Depende de usuarios.js (para evaluarPassword).
 * Es la ÚNICA fuente de los textos de requisitos: llamar a
 * actualizarFortaleza() al iniciar la página también los dibuja.
 */

const TEXTOS_REQUISITOS = {
    longitud:   'Mínimo 8 caracteres',
    minuscula:  'Una letra minúscula',
    mayuscula:  'Una letra mayúscula',
    numero:     'Un número',
    simbolo:    'Un símbolo (ej. !@#$%^&*)'
};

function actualizarFortaleza(passwordInput, strengthBar, strengthText, reqElements) {
    const password = passwordInput.value;
    const checks = evaluarPassword(password);

    const { reqLen, reqMin, reqMaj, reqNum, reqSym } = reqElements;

    actualizarRequisito(reqLen, checks.longitud,  TEXTOS_REQUISITOS.longitud);
    actualizarRequisito(reqMin, checks.minuscula, TEXTOS_REQUISITOS.minuscula);
    actualizarRequisito(reqMaj, checks.mayuscula, TEXTOS_REQUISITOS.mayuscula);
    actualizarRequisito(reqNum, checks.numero,    TEXTOS_REQUISITOS.numero);
    actualizarRequisito(reqSym, checks.simbolo,   TEXTOS_REQUISITOS.simbolo);

    const cumplidos = [
        checks.longitud, checks.minuscula, checks.mayuscula,
        checks.numero, checks.simbolo
    ].filter(Boolean).length;

    strengthBar.className = 'strength-bar';
    strengthText.className = 'strength-text';

    // [ancho, clase, texto] según la cantidad de requisitos cumplidos
    let nivel;
    if (password.length === 0)  nivel = ['0%',   null,      'Insegura'];
    else if (cumplidos <= 2)    nivel = ['25%',  'level-1', 'Débil'];
    else if (cumplidos === 3)   nivel = ['50%',  'level-2', 'Regular'];
    else if (cumplidos === 4)   nivel = ['75%',  'level-3', 'Buena'];
    else                        nivel = ['100%', 'level-4', 'Fuerte'];

    strengthBar.style.width = nivel[0];
    strengthText.textContent = `Seguridad: ${nivel[2]}`;
    if (nivel[1]) {
        strengthBar.classList.add(nivel[1]);
        strengthText.classList.add(nivel[1]);
    }

    return checks.esValida;
}

function actualizarRequisito(elemento, cumplido, texto) {
    elemento.textContent = (cumplido ? '✓ ' : '✗ ') + texto;
    elemento.classList.toggle('met', cumplido);
}
