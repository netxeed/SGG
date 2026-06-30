/**
 * SGG - Sistema de Gestión de Gastos
 * password-toggle.js — Módulo compartido (Login, Registro, Recuperar)
 *
 * Agrega un botón de texto a todo input type="password" que esté
 * envuelto en un contenedor con clase .password-field, y alterna
 * entre texto oculto (puntos) y visible.
 */

function inicializarTogglesPassword() {
    const wrappers = document.querySelectorAll('.password-field');

    wrappers.forEach((wrapper) => {
        const input = wrapper.querySelector('input[type="password"]');
        if (!input) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toggle-password';
        btn.setAttribute('aria-label', 'Mostrar contraseña');
        btn.setAttribute('tabindex', '-1');
        btn.textContent = 'Mostrar';

        btn.addEventListener('click', () => {
            const oculta = input.type === 'password';
            input.type = oculta ? 'text' : 'password';
            btn.textContent = oculta ? 'Ocultar' : 'Mostrar';
            btn.setAttribute('aria-label', oculta ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });

        wrapper.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', inicializarTogglesPassword);
