/**
 * SGG - Sistema de Gestión de Gastos
 * usuarios.js — Módulo compartido (Login, Registro, Recuperar, Dashboard)
 *
 * Centraliza el acceso al array de usuarios guardado en localStorage
 * bajo la clave 'usuarios_sgg'. Todos los scripts deben usar estas
 * funciones en lugar de tocar localStorage directamente.
 *
 * NOTA: proyecto práctico. Las contraseñas se guardan en texto plano
 * a propósito (no hay backend). Ver README.md.
 */

const SGG_STORAGE_KEY = 'usuarios_sgg';
const EDAD_MINIMA     = 14;
const FECHA_MINIMA    = '1900-01-01';

/* ============================================
   SEMILLA INICIAL
   ============================================ */
function inicializarUsuarios() {
    if (localStorage.getItem(SGG_STORAGE_KEY) === null) {
        const usuariosSemilla = [
            {
                username: 'admin',
                password: 'admin123',
                nombre: 'Administrador',
                apellido: 'uno',
                fechaNacimiento: '1990-01-01'
            },
            {
                username: 'santino',
                password: 'contrasena',
                nombre: 'Santino',
                apellido: 'Zerda',
                fechaNacimiento: '2010-06-15'
            }
        ];
        localStorage.setItem(SGG_STORAGE_KEY, JSON.stringify(usuariosSemilla));
    }
}

/* ============================================
   LECTURA / ESCRITURA
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
    const usernameLower = username.trim().toLowerCase();
    return obtenerUsuarios().find(u => u.username.toLowerCase() === usernameLower) || null;
}

function existeUsuario(username) {
    return buscarUsuario(username) !== null;
}

/* ============================================
   VALIDACIONES
   ============================================ */

/** Mín. 8 caracteres, mayúscula, minúscula, número y símbolo. */
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

/**
 * Solo letras (con acentos y ñ). Permite espacios, apóstrofes y guiones
 * ENTRE palabras: "María José", "D'Angelo", "María-José".
 */
function validarSoloLetras(texto) {
    const limpio = texto.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '’-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;
    return regex.test(limpio);
}

/** Fecha de hoy en formato 'YYYY-MM-DD' usando la zona horaria local. */
function fechaHoyISO() {
    const h = new Date();
    const mm = String(h.getMonth() + 1).padStart(2, '0');
    const dd = String(h.getDate()).padStart(2, '0');
    return `${h.getFullYear()}-${mm}-${dd}`;
}

/** Edad cumplida a partir de 'YYYY-MM-DD'. Devuelve null si es inválida. */
function calcularEdad(fechaNacimientoStr) {
    if (!fechaNacimientoStr) return null;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimientoStr + 'T00:00:00');
    if (isNaN(nacimiento.getTime())) return null;

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    const diaDiff = hoy.getDate() - nacimiento.getDate();
    if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) edad--;

    return edad;
}

/**
 * Valida una fecha de nacimiento. Devuelve '' si es válida o el mensaje de error.
 * (Comparación de strings ISO: evita problemas de hora y zona horaria.)
 */
function validarFechaNacimiento(valor) {
    if (!valor) return 'Ingresá tu fecha de nacimiento.';
    if (valor > fechaHoyISO()) return 'La fecha no puede ser futura.';
    if (valor < FECHA_MINIMA) return 'Ingresá una fecha válida.';
    const edad = calcularEdad(valor);
    if (edad === null || edad < EDAD_MINIMA) {
        return `Debés tener al menos ${EDAD_MINIMA} años para registrarte.`;
    }
    return '';
}

/* ============================================
   ALTA (registro.js)
   Revalida todo: no confía solo en el formulario.
   Devuelve { ok: boolean, mensaje: string }
   ============================================ */
function agregarUsuario({ username, password, nombre, apellido, fechaNacimiento }) {
    if (!username || !username.trim()) {
        return { ok: false, mensaje: 'El nombre de usuario es obligatorio.' };
    }
    if (!validarSoloLetras(nombre || '') || !validarSoloLetras(apellido || '')) {
        return { ok: false, mensaje: 'Nombre y apellido solo pueden contener letras.' };
    }
    if (validarFechaNacimiento(fechaNacimiento)) {
        return { ok: false, mensaje: validarFechaNacimiento(fechaNacimiento) };
    }
    if (!evaluarPassword(password || '').esValida) {
        return { ok: false, mensaje: 'La contraseña no cumple con los requisitos de seguridad.' };
    }
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
   EDICIÓN (recuperar.js)
   ============================================ */
function actualizarPassword(username, nuevaPassword) {
    if (!evaluarPassword(nuevaPassword || '').esValida) {
        return { ok: false, mensaje: 'La contraseña no cumple con los requisitos de seguridad.' };
    }

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
   SESIÓN ACTIVA (sessionStorage)
   ============================================ */
const SGG_SESSION_KEY = 'sesion_sgg';

function iniciarSesion(username) {
    sessionStorage.setItem(SGG_SESSION_KEY, JSON.stringify({ username }));
}

function obtenerSesion() {
    try {
        const data = JSON.parse(sessionStorage.getItem(SGG_SESSION_KEY));
        return (data && data.username) ? data : null;
    } catch (e) {
        return null;
    }
}

function cerrarSesion() {
    sessionStorage.removeItem(SGG_SESSION_KEY);
}
