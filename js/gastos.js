/**
 * SGG - Sistema de Gestión de Gastos
 * gastos.js
 *
 * CRUD de gastos con baja lógica (soft delete).
 * Depende de usuarios.js (sesión, fechaHoyISO) y ui.js (alertas y errores).
 *
 * Reemplaza a dashboard.js: además del CRUD, este archivo protege la
 * ruta privada, muestra el saludo y gestiona el cierre de sesión.
 *
 * Cada gasto se guarda en localStorage bajo la clave 'gastos_sgg' como:
 *   { id, username, monto, fecha, categoria, descripcion, estado_activo }
 *
 * 'username' es la clave foránea que vincula el gasto con su dueño.
 * IMPORTANTE: la eliminación NUNCA usa splice ni filter destructivo.
 * "Eliminar" solo cambia estado_activo a false (baja lógica); el
 * registro permanece en el array para no perder el historial.
 */

const GASTOS_STORAGE_KEY = 'gastos_sgg';
const CATEGORIAS_GASTO = ['Alimentación', 'Transporte', 'Servicios', 'Ocio', 'Salud', 'Otros'];

const CLASE_POR_CATEGORIA = {
    'Alimentación': 'alimentacion',
    'Transporte': 'transporte',
    'Servicios': 'servicios',
    'Ocio': 'ocio',
    'Salud': 'salud',
    'Otros': 'otros'
};

/* ============================================
   ACCESO A LOCALSTORAGE
   ============================================ */
function obtenerGastos() {
    try {
        const data = JSON.parse(localStorage.getItem(GASTOS_STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('Error al leer gastos_sgg:', e);
        return [];
    }
}

function guardarGastos(gastos) {
    localStorage.setItem(GASTOS_STORAGE_KEY, JSON.stringify(gastos));
}

function generarIdGasto() {
    return `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Gastos activos de un usuario, del más reciente al más antiguo. */
function gastosActivosDe(username) {
    return obtenerGastos()
        .filter(g => g.username === username && g.estado_activo)
        .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
}

function totalActivoDe(username) {
    return gastosActivosDe(username)
        .reduce((acc, g) => acc + (Number.isFinite(g.monto) ? g.monto : 0), 0);
}

/* ============================================
   FORMATO
   ============================================ */
function formatoMoneda(monto) {
    const numero = Number.isFinite(monto) ? monto : 0;
    return '$' + new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY', sin pasar por Date() (evita líos de zona horaria). */
function formatoFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
}

document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();

    // ============================================
    // PROTECCIÓN DE RUTA + SALUDO
    // ============================================
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'index.html';
        return;
    }

    const usuarioActivo = buscarUsuario(sesion.username);
    if (!usuarioActivo) {
        // El usuario fue eliminado o el storage cambió: cerramos la sesión.
        cerrarSesion();
        window.location.href = 'index.html';
        return;
    }

    const nombreCompleto = [usuarioActivo.nombre, usuarioActivo.apellido].filter(Boolean).join(' ');
    document.getElementById('saludo').textContent = `Hola, ${nombreCompleto || usuarioActivo.username}`;

    document.getElementById('cerrarSesionLink').addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
        window.location.href = 'index.html';
    });

    // ============================================
    // SELECTORES
    // ============================================
    const alertBox = document.getElementById('alertBox');

    const totalGastadoEl   = document.getElementById('totalGastado');
    const cantidadGastosEl = document.getElementById('cantidadGastos');

    const gastoForm     = document.getElementById('gastoForm');
    const formTitle     = document.getElementById('formGastoTitle');
    const montoInput       = document.getElementById('monto');
    const fechaInput       = document.getElementById('fecha');
    const categoriaInput   = document.getElementById('categoria');
    const descripcionInput = document.getElementById('descripcion');
    const btnGuardarGasto    = document.getElementById('btnGuardarGasto');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

    const errorMonto       = document.getElementById('errorMonto');
    const errorFecha       = document.getElementById('errorFecha');
    const errorCategoria   = document.getElementById('errorCategoria');
    const errorDescripcion = document.getElementById('errorDescripcion');

    const gastosBody   = document.getElementById('gastosBody');
    const tablaWrapper = document.getElementById('tablaWrapper');
    const emptyState   = document.getElementById('emptyState');

    const modalEliminar        = document.getElementById('modalEliminar');
    const btnCancelarModal     = document.getElementById('btnCancelarModal');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

    fechaInput.max = fechaHoyISO();

    let idEnEdicion            = null; // null = modo "Agregar"; string = modo "Editar"
    let idPendienteDeEliminar  = null;
    let elementoQueAbrioModal  = null; // para devolver el foco al cerrar el modal

    // ============================================
    // RENDER: TABLA + RESUMEN
    // ============================================
    function render() {
        const gastos = gastosActivosDe(usuarioActivo.username);

        gastosBody.innerHTML = '';

        const hayGastos = gastos.length > 0;
        tablaWrapper.classList.toggle('hidden', !hayGastos);
        emptyState.classList.toggle('hidden', hayGastos);

        gastos.forEach(gasto => {
            gastosBody.appendChild(crearFilaGasto(gasto));
        });

        const total = totalActivoDe(usuarioActivo.username);
        totalGastadoEl.textContent = formatoMoneda(total);
        cantidadGastosEl.textContent = gastos.length === 1
            ? '1 gasto registrado'
            : `${gastos.length} gastos registrados`;
    }

    function crearFilaGasto(gasto) {
        const fila = document.createElement('tr');
        fila.dataset.id = gasto.id;

        const tdFecha = document.createElement('td');
        tdFecha.textContent = formatoFecha(gasto.fecha);

        const tdCategoria = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `badge badge-${CLASE_POR_CATEGORIA[gasto.categoria] || 'otros'}`;
        badge.textContent = gasto.categoria;
        tdCategoria.appendChild(badge);

        const tdDescripcion = document.createElement('td');
        tdDescripcion.textContent = gasto.descripcion;
        tdDescripcion.className = 'col-descripcion';

        const tdMonto = document.createElement('td');
        tdMonto.textContent = formatoMoneda(gasto.monto);
        tdMonto.className = 'col-monto';

        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'col-acciones';

        const btnEditar = document.createElement('button');
        btnEditar.type = 'button';
        btnEditar.className = 'btn-icon';
        btnEditar.textContent = 'Editar';
        btnEditar.setAttribute('aria-label', `Editar gasto: ${gasto.descripcion}`);
        btnEditar.addEventListener('click', () => entrarEnModoEdicion(gasto.id));

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.className = 'btn-icon btn-icon-danger';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.setAttribute('aria-label', `Eliminar gasto: ${gasto.descripcion}`);
        btnEliminar.addEventListener('click', (e) => abrirModalEliminar(gasto.id, e.currentTarget));

        tdAcciones.append(btnEditar, btnEliminar);
        fila.append(tdFecha, tdCategoria, tdDescripcion, tdMonto, tdAcciones);
        return fila;
    }

    // ============================================
    // VALIDACIÓN DEL FORMULARIO (por campo, con "tocado")
    // ============================================
    function mostrarError(input, errorEl, esValido, mensaje) {
        setFieldError(input, errorEl, esValido, mensaje, input.dataset.tocado === '1');
    }

    function validarMonto() {
        const valor = montoInput.value;
        const monto = parseFloat(valor);
        let esValido = true;
        let mensaje = '';

        if (valor.trim() === '') {
            esValido = false;
            mensaje = 'Ingresá un monto.';
        } else if (isNaN(monto) || monto <= 0) {
            esValido = false;
            mensaje = 'El monto debe ser mayor a cero.';
        }

        mostrarError(montoInput, errorMonto, esValido, mensaje);
        return esValido;
    }

    function validarFechaGasto() {
        const valor = fechaInput.value;
        let esValido = true;
        let mensaje = '';

        if (!valor) {
            esValido = false;
            mensaje = 'Ingresá una fecha.';
        } else if (valor > fechaHoyISO()) {
            esValido = false;
            mensaje = 'La fecha no puede ser futura.';
        }

        mostrarError(fechaInput, errorFecha, esValido, mensaje);
        return esValido;
    }

    function validarCategoria() {
        const esValido = CATEGORIAS_GASTO.includes(categoriaInput.value);
        mostrarError(categoriaInput, errorCategoria, esValido, 'Seleccioná una categoría.');
        return esValido;
    }

    function validarDescripcion() {
        const esValido = descripcionInput.value.trim().length > 0;
        mostrarError(descripcionInput, errorDescripcion, esValido, 'Ingresá una descripción.');
        return esValido;
    }

    [
        [montoInput, validarMonto],
        [fechaInput, validarFechaGasto],
        [categoriaInput, validarCategoria],
        [descripcionInput, validarDescripcion]
    ].forEach(([input, validador]) => {
        input.addEventListener('blur', () => {
            input.dataset.tocado = '1';
            validador();
        });
        input.addEventListener('input', validador);
        input.addEventListener('change', validador); // <select> y <input type="date">
    });

    function limpiarErroresFormulario() {
        [montoInput, fechaInput, categoriaInput, descripcionInput].forEach(input => {
            input.classList.remove('input-invalid');
            input.dataset.tocado = '0';
            input.removeAttribute('aria-invalid');
        });
        [errorMonto, errorFecha, errorCategoria, errorDescripcion].forEach(el => {
            el.textContent = '';
        });
    }

    // ============================================
    // MODO EDICIÓN
    // ============================================
    function entrarEnModoEdicion(id) {
        const gasto = obtenerGastos().find(g => g.id === id && g.username === usuarioActivo.username);
        if (!gasto) {
            showAlert(alertBox, 'No se encontró el gasto.', 'error');
            return;
        }

        idEnEdicion = id;
        montoInput.value = gasto.monto;
        fechaInput.value = gasto.fecha;
        categoriaInput.value = gasto.categoria;
        descripcionInput.value = gasto.descripcion;
        limpiarErroresFormulario();

        formTitle.textContent = 'Editar gasto';
        btnGuardarGasto.textContent = 'Guardar cambios';
        btnCancelarEdicion.classList.remove('hidden');

        gastoForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        montoInput.focus();
    }

    function salirDeModoEdicion() {
        idEnEdicion = null;
        gastoForm.reset();
        limpiarErroresFormulario();
        formTitle.textContent = 'Agregar gasto';
        btnGuardarGasto.textContent = 'Agregar gasto';
        btnCancelarEdicion.classList.add('hidden');
    }

    btnCancelarEdicion.addEventListener('click', salirDeModoEdicion);

    // ============================================
    // ENVÍO DEL FORMULARIO (ALTA / EDICIÓN)
    // ============================================
    gastoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        [montoInput, fechaInput, categoriaInput, descripcionInput].forEach(input => {
            input.dataset.tocado = '1';
        });

        const montoOk      = validarMonto();
        const fechaOk       = validarFechaGasto();
        const categoriaOk   = validarCategoria();
        const descripcionOk = validarDescripcion();

        if (!montoOk || !fechaOk || !categoriaOk || !descripcionOk) {
            showAlert(alertBox, 'Revisá los campos marcados antes de continuar.', 'error');
            return;
        }

        const datos = {
            monto: parseFloat(montoInput.value),
            fecha: fechaInput.value,
            categoria: categoriaInput.value,
            descripcion: descripcionInput.value.trim()
        };

        const gastos = obtenerGastos();

        if (idEnEdicion) {
            const idx = gastos.findIndex(g => g.id === idEnEdicion && g.username === usuarioActivo.username);
            if (idx === -1) {
                showAlert(alertBox, 'No se encontró el gasto.', 'error');
                salirDeModoEdicion();
                render();
                return;
            }
            // Conservamos id, username y estado_activo; solo actualizamos los datos editables.
            gastos[idx] = { ...gastos[idx], ...datos };
            guardarGastos(gastos);
            showAlert(alertBox, '¡Gasto actualizado!', 'success', 3000);
        } else {
            gastos.push({
                id: generarIdGasto(),
                username: usuarioActivo.username, // clave foránea: dueño del gasto
                estado_activo: true,
                ...datos
            });
            guardarGastos(gastos);
            showAlert(alertBox, '¡Gasto registrado!', 'success', 3000);
        }

        salirDeModoEdicion();
        render();
    });

    // ============================================
    // ELIMINACIÓN (BAJA LÓGICA)
    // ============================================
    function abrirModalEliminar(id, origen) {
        idPendienteDeEliminar = id;
        elementoQueAbrioModal = origen || null;
        modalEliminar.classList.remove('hidden');
        btnCancelarModal.focus();
    }

    function cerrarModalEliminar() {
        idPendienteDeEliminar = null;
        modalEliminar.classList.add('hidden');
        if (elementoQueAbrioModal) {
            elementoQueAbrioModal.focus();
            elementoQueAbrioModal = null;
        }
    }

    btnCancelarModal.addEventListener('click', cerrarModalEliminar);

    modalEliminar.addEventListener('click', (e) => {
        if (e.target === modalEliminar) cerrarModalEliminar();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalEliminar.classList.contains('hidden')) {
            cerrarModalEliminar();
        }
    });

    btnConfirmarEliminar.addEventListener('click', () => {
        if (!idPendienteDeEliminar) return;

        const gastos = obtenerGastos();
        const idx = gastos.findIndex(
            g => g.id === idPendienteDeEliminar && g.username === usuarioActivo.username
        );

        if (idx === -1) {
            showAlert(alertBox, 'No se encontró el gasto.', 'error');
            cerrarModalEliminar();
            render();
            return;
        }

        // Baja lógica: jamás splice/filter destructivo sobre datos financieros.
        gastos[idx].estado_activo = false;
        guardarGastos(gastos);

        if (idEnEdicion === idPendienteDeEliminar) {
            salirDeModoEdicion();
        }

        cerrarModalEliminar();
        showAlert(alertBox, 'Gasto eliminado.', 'success', 3000);
        render();
    });

    // ============================================
    // PRIMER RENDER
    // ============================================
    render();

});
