/**
 * SGG - Sistema de Gestión de Gastos
 * ui.js — Módulo compartido: alertas y errores de campo
 *
 * Los contenedores #alertBox (aria-live) y .field-error (role="alert")
 * ya traen sus atributos ARIA en el HTML; acá solo cambiamos el contenido.
 */

let alertTimeoutId = null;

function showAlert(element, message, type, autoHideMs) {
    element.textContent = message;
    element.className   = `alert-message ${type}`;
    if (alertTimeoutId) clearTimeout(alertTimeoutId);
    alertTimeoutId = autoHideMs ? setTimeout(() => hideAlert(element), autoHideMs) : null;
}

function hideAlert(element) {
    element.textContent = '';
    element.className   = 'alert-message';
}

/**
 * Muestra u oculta el error de un campo.
 * @param {boolean} mostrar  false = no mostrar el error todavía (campo no tocado)
 */
function setFieldError(input, errorEl, esValido, mensaje, mostrar = true) {
    const mostrarError = mostrar && !esValido && mensaje.length > 0;
    input.classList.toggle('input-invalid', mostrarError);
    errorEl.textContent = mostrarError ? mensaje : '';
    input.setAttribute('aria-invalid', mostrarError ? 'true' : 'false');
    input.setAttribute('aria-describedby', errorEl.id);
}
