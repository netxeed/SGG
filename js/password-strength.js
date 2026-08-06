/**
 * SGG - Sistema de Gestión de Gastos
 * password-strength.js — Módulo compartido para validación de contraseña
 *
 * Depende de usuarios.js (para evaluarPassword).
 * Proporciona funciones para actualizar la barra de fuerza y los requisitos.
 */

function actualizarFortaleza(passwordInput, strengthBar, strengthText, reqElements) {
    const password = passwordInput.value;
    const checks = evaluarPassword(password);

    const { reqLen, reqMin, reqMaj, reqNum, reqSym } = reqElements;

    actualizarRequisito(reqLen, checks.longitud, 'Mínimo 8 caracteres');
    actualizarRequisito(reqMin, checks.minuscula, 'Una letra minúscula');
    actualizarRequisito(reqMaj, checks.mayuscula, 'Una letra mayúscula');
    actualizarRequisito(reqNum, checks.numero, 'Un número');
    actualizarRequisito(reqSym, checks.simbolo, 'Un símbolo (ej. !@#$%^&*)');

    const cantidadCumplidos = [
        checks.longitud, checks.minuscula, checks.mayuscula,
        checks.numero, checks.simbolo
    ].filter(Boolean).length;

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

    return checks.esValida;
}

function actualizarRequisito(elemento, cumplido, texto) {
    elemento.textContent = (cumplido ? '✓ ' : '✗ ') + texto;
    elemento.classList.toggle('met', cumplido);
}