-- ============================================
-- SGG - Sistema de Gestión de Gastos
-- Script de creación de base de datos
-- ============================================

DROP DATABASE IF EXISTS sgg_db;

CREATE DATABASE sgg_db
    CHARACTER SET utf8mb4      -- necesario por las tildes y la "ñ" (Alimentación, etc.)
    COLLATE utf8mb4_unicode_ci;

USE sgg_db;

-- ============================================
-- TABLA: usuarios
-- Entidad "Usuarios". PK natural = username, igual que en la app.
-- ============================================
CREATE TABLE usuarios (
    username         VARCHAR(50)   NOT NULL,
    password_hash    VARCHAR(255)  NOT NULL,
    nombre           VARCHAR(100)  NOT NULL,
    apellido         VARCHAR(100)  NOT NULL,
    fecha_nacimiento DATE          NOT NULL,
    creado_en        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (username)
) ENGINE = InnoDB;

-- ============================================
-- TABLA: categorias
-- Entidad "Categorías" (antes era un string libre repetido en cada
-- gasto; acá queda normalizada en su propia tabla).
-- ============================================
CREATE TABLE categorias (
    id     INT           NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50)   NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_categorias_nombre (nombre)
) ENGINE = InnoDB;

-- ============================================
-- TABLA: gastos
-- Entidad "Gastos". Contiene las dos claves foráneas del MER:
--   - username     -> usuarios.username
--   - categoria_id -> categorias.id
-- "estado_activo" implementa la baja lógica (soft delete): nunca se
-- borra una fila de gastos, solo se cambia esta columna a FALSE.
-- ============================================
CREATE TABLE gastos (
    id            INT            NOT NULL AUTO_INCREMENT,
    username      VARCHAR(50)    NOT NULL,
    categoria_id  INT            NOT NULL,
    monto         DECIMAL(12,2)  NOT NULL,
    fecha         DATE           NOT NULL,
    descripcion   VARCHAR(100)   NOT NULL,
    estado_activo BOOLEAN        NOT NULL DEFAULT TRUE,
    creado_en     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    -- El monto nunca puede ser cero ni negativo (regla de negocio RF-05).
    CONSTRAINT chk_gastos_monto_positivo CHECK (monto > 0),

    -- Si se borra/renombra un usuario, sus gastos no quedan huérfanos:
    -- el username se actualiza en cascada, y no se puede borrar un
    -- usuario que todavía tenga gastos cargados.
    CONSTRAINT fk_gastos_usuario
        FOREIGN KEY (username) REFERENCES usuarios (username)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Mismo criterio para categorías: no se puede borrar una categoría
    -- que esté en uso.
    CONSTRAINT fk_gastos_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;

-- Índice pensado para la consulta más frecuente de la app:
-- "gastos activos de este usuario, del más reciente al más antiguo"
-- (RF-06: historial dinámico, RF-09: total del panel de resumen).
CREATE INDEX idx_gastos_usuario_activo_fecha
    ON gastos (username, estado_activo, fecha DESC);

-- Índice de apoyo para filtrar/agrupar gastos por categoría.
CREATE INDEX idx_gastos_categoria
    ON gastos (categoria_id);

-- ============================================
-- DATOS SEMILLA
-- Los mismos usuarios de prueba y categorías que ya usa la app en
-- localStorage, para poder migrar/comparar 1 a 1.
-- ============================================
INSERT INTO usuarios (username, password_hash, nombre, apellido, fecha_nacimiento) VALUES
    ('admin',   'admin123',   'Administrador', 'uno',   '1990-01-01'),
    ('santino', 'contrasena', 'Santino',       'Zerda', '2010-06-15');

INSERT INTO categorias (nombre) VALUES
    ('Alimentación'),
    ('Transporte'),
    ('Servicios'),
    ('Ocio'),
    ('Salud'),
    ('Otros');