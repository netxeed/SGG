/**
 * SGG - Sistema de Gestión de Gastos
 * dashboard.js
 *
 * Página de destino post-login (en construcción).
 * Depende de usuarios.js (cargarse antes en el HTML).
 */

document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();

    // Protección de página: sin sesión activa -> login
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = buscarUsuario(sesion.username);
    if (!usuario) {
        // El usuario ya no existe: cerramos la sesión
        cerrarSesion();
        window.location.href = 'index.html';
        return;
    }

    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');
    document.getElementById('saludo').textContent = `Hola, ${nombreCompleto || usuario.username}`;

    document.getElementById('cerrarSesionLink').addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
        window.location.href = 'index.html';
    });

});
