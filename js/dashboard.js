/**
 * SGG - Sistema de Gestión de Gastos
 * dashboard.js
 *
 * Página de destino post-login (en construcción).
 * Depende de usuarios.js (debe cargarse antes en el HTML).
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
        themeIcon.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        themeIcon.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ============================================
    // PROTECCIÓN DE PÁGINA + SALUDO
    // Si no hay sesión activa, redirige al login.
    // ============================================
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = buscarUsuario(sesion.username);
    const saludoEl = document.getElementById('saludo');

    if (usuario) {
        const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');
        saludoEl.textContent = `Hola, ${nombreCompleto || usuario.username}`;
    } else {
        // El usuario fue eliminado o el storage cambió: cerramos la sesión.
        cerrarSesion();
        window.location.href = 'index.html';
        return;
    }

    // ============================================
    // CERRAR SESIÓN
    // ============================================
    const cerrarSesionLink = document.getElementById('cerrarSesionLink');
    cerrarSesionLink.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
        window.location.href = 'index.html';
    });

});
