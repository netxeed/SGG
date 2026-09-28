/**
 * SGG - Sistema de Gestión de Gastos
 * theme.js — Módulo compartido: modo claro / oscuro
 *
 * IMPORTANTE: cargar en el <head> (sin defer) para aplicar el tema
 * ANTES del primer render y evitar el destello de modo claro.
 * La clase 'dark-mode' se aplica a <html>.
 */

(function aplicarTemaGuardado() {
    try {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark-mode');
        }
    } catch (e) { /* localStorage no disponible: usamos el tema claro */ }
})();

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = document.getElementById('themeIcon');
    if (!themeToggle || !themeIcon) return;

    function reflejarEstado() {
        const isDark = document.documentElement.classList.contains('dark-mode');
        themeIcon.textContent = isDark ? '☀' : '☾';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute(
            'aria-label',
            isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
        );
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
        reflejarEstado();
    });

    reflejarEstado();
});
