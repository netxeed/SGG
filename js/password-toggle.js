/**
 * SGG - Sistema de Gestión de Gastos
 * password-toggle.js — Módulo compartido (Login, Registro, Recuperar)
 *
 * Agrega un botón "Mostrar/Ocultar" a todo input type="password"
 * envuelto en un contenedor con clase .password-field.
 */

function inicializarTogglesPassword() {
    document.querySelectorAll('.password-field').forEach((wrapper) => {
        const input = wrapper.querySelector('input');
        if (!input) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toggle-password';
        btn.textContent = 'Mostrar';
        btn.setAttribute('aria-label', 'Mostrar contraseña');

        btn.addEventListener('click', () => {
            const oculta = input.type === 'password';
            establecerVisibilidad(input, btn, oculta);
        });

        wrapper.appendChild(btn);
    });
}

function establecerVisibilidad(input, btn, visible) {
    input.type = visible ? 'text' : 'password';
    btn.textContent = visible ? 'Ocultar' : 'Mostrar';
    btn.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
}

/** Vuelve todos los campos de contraseña a estado oculto (útil tras form.reset()). */
function ocultarTodasLasPasswords() {
    document.querySelectorAll('.password-field').forEach((wrapper) => {
        const input = wrapper.querySelector('input');
        const btn   = wrapper.querySelector('.toggle-password');
        if (input && btn) establecerVisibilidad(input, btn, false);
    });
}

document.addEventListener('DOMContentLoaded', inicializarTogglesPassword);