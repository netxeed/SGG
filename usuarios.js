/**
 * SGG - Sistema de Gestión de Gastos
 * usuarios.js — Módulo compartido (Login, Registro, Recuperar)
 *
 * Centraliza el acceso al array de usuarios guardado en localStorage
 * bajo la clave 'usuarios_sgg'. Todos los scripts de la carpeta js/
 * deben usar estas funciones en lugar de tocar localStorage directamente,
 * para evitar inconsistencias entre páginas.
 */

const SGG_STORAGE_KEY = 'usuarios_sgg';

/* ============================================
   SEMILLA INICIAL
   Si todavía no existe el array en localStorage,
   lo creamos con los usuarios de prueba originales.
   ============================================ */
function inicializarUsuarios() {
    if (localStorage.getItem(SGG_STORAGE_KEY) === null) {
        const usuariosSemilla = [
            {
                username: 'admin',
                password: 'admin123',
                nombre: 'Admin',
                apellido: 'Sistema',
                fechaNacimiento: '1990-01-01'
            },
            {
                username: 'santino',
                password: 'contrasena',
                nombre: 'Santino',
                apellido: 'Usuario',
                fechaNacimiento: '1995-05-15'
            }
        ];
        localStorage.setItem(SGG_STORAGE_KEY, JSON.stringify(usuariosSemilla));
    }
}

/* ============================================
   LECTURA / ESCRITURA DEL ARRAY COMPLETO
   ============================================ */
function obtenerUsuarios() {
    inicializarUsuarios();
    try {
        const data = JSON.parse(localStorage.getItem(SGG_STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('Error al leer usuarios_sgg:', e);
        return [];
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(SGG_STORAGE_KEY, JSON.stringify(usuarios));
}

/* ============================================
   BÚSQUEDA
   ============================================ */
function buscarUsuario(username) {
    if (!username) return null;
    const usuarios = obtenerUsuarios();
    const usernameLower = username.trim().toLowerCase();
    return usuarios.find(u => u.username.toLowerCase() === usernameLower) || null;
}

function existeUsuario(username) {
    return buscarUsuario(username) !== null;
}

/* ============================================
   ALTA (usado por registro.js)
   Previene duplicados de usuario (case-insensitive).
   Devuelve { ok: boolean, mensaje: string }
   ============================================ */
function agregarUsuario({ username, password, nombre, apellido, fechaNacimiento }) {
    if (existeUsuario(username)) {
        return { ok: false, mensaje: 'El nombre de usuario ya está registrado.' };
    }
    const usuarios = obtenerUsuarios();
    usuarios.push({
        username: username.trim(),
        password,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fechaNacimiento
    });
    guardarUsuarios(usuarios);
    return { ok: true, mensaje: 'Registro exitoso.' };
}

/* ============================================
   EDICIÓN (usado por recuperar.js)
   Actualiza la contraseña del usuario encontrado.
   Devuelve { ok: boolean, mensaje: string }
   ============================================ */
function actualizarPassword(username, nuevaPassword) {
    const usuarios = obtenerUsuarios();
    const usernameLower = username.trim().toLowerCase();
    const idx = usuarios.findIndex(u => u.username.toLowerCase() === usernameLower);

    if (idx === -1) {
        return { ok: false, mensaje: 'Usuario no encontrado.' };
    }

    usuarios[idx].password = nuevaPassword;
    guardarUsuarios(usuarios);
    return { ok: true, mensaje: 'Contraseña actualizada correctamente.' };
}

/* ============================================
   VALIDACIÓN DE CONTRASEÑA SEGURA
   Mín. 8 caracteres, 1 mayúscula, 1 minúscula,
   1 número y 1 símbolo.
   Devuelve un objeto con cada requisito + el global.
   ============================================ */
function evaluarPassword(password) {
    const checks = {
        longitud:   password.length >= 8,
        mayuscula:  /[A-Z]/.test(password),
        minuscula:  /[a-z]/.test(password),
        numero:     /[0-9]/.test(password),
        simbolo:    /[^a-zA-Z0-9]/.test(password)
    };
    checks.esValida = Object.values(checks).every(Boolean);
    return checks;
}

/* ============================================
   VALIDACIÓN DE NOMBRE / APELLIDO
   Solo letras (incluye acentos y ñ) y espacios.
   Recorta espacios al inicio/fin antes de validar.
   ============================================ */
function validarSoloLetras(texto) {
    const limpio = texto.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
    return limpio.length > 0 && regex.test(limpio);
}

/* ============================================
   CÁLCULO DE EDAD
   A partir de una fecha 'YYYY-MM-DD', calcula la
   edad cumplida respecto a hoy.
   ============================================ */
function calcularEdad(fechaNacimientoStr) {
    if (!fechaNacimientoStr) return null;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimientoStr + 'T00:00:00');

    if (isNaN(nacimiento.getTime())) return null;

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    const diaDiff = hoy.getDate() - nacimiento.getDate();

    if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
        edad--;
    }

    return edad;
}
