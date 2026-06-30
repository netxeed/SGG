/**
 * SGG - Sistema de Gestión de Gastos
 * password-toggle.js
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
        btn.textContent = '⚆';

        btn.addEventListener('click', () => {
            const oculta = input.type === 'password';
            input.type = oculta ? 'text' : 'password';
            btn.textContent = oculta ? '⚈' : '⚆';
            btn.setAttribute('aria-label', oculta ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });

        wrapper.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', inicializarTogglesPassword);
