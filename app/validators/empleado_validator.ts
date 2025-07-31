// app/validators/empleado_validator.ts
import vine from '@vinejs/vine'

// Validator para crear un nuevo empleado
export const createEmpleadoValidator = vine.compile(
  vine.object({
    numero: vine.number().positive(),
    nombre: vine.string().trim().minLength(2).maxLength(100),
    paterno: vine.string().trim().minLength(2).maxLength(100),
    materno: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine.string().email().optional(),
    telefono: vine.string().trim().maxLength(20).optional(),
    fecha_ingreso: vine.date().optional(),
    fecha_baja: vine.date().optional(),
    activo: vine.boolean().optional(),
    rfidUid: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(50)
      .regex(/^[A-Fa-f0-9]+$/) // Solo caracteres hexadecimales
      .transform((value) => value.toUpperCase())
      .optional(),
    grupoId: vine.number().positive().optional(),
    plantaId: vine.number().positive().optional(),
    departamentoId: vine.number().positive().optional(),
    puesto: vine.string().trim().maxLength(100).optional(),
    salario: vine.number().positive().optional(),
    observaciones: vine.string().trim().maxLength(500).optional()
  })
)

// Validator para actualizar un empleado
export const updateEmpleadoValidator = vine.compile(
  vine.object({
    numero: vine.number().positive().optional(),
    nombre: vine.string().trim().minLength(2).maxLength(100).optional(),
    paterno: vine.string().trim().minLength(2).maxLength(100).optional(),
    materno: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine.string().email().optional(),
    telefono: vine.string().trim().maxLength(20).optional(),
    fecha_ingreso: vine.date().optional(),
    fecha_baja: vine.date().optional(),
    activo: vine.boolean().optional(),
    rfidUid: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(50)
      .regex(/^[A-Fa-f0-9]+$/)
      .transform((value) => value.toUpperCase())
      .nullable()
      .optional(),
    grupoId: vine.number().positive().optional(),
    plantaId: vine.number().positive().optional(),
    departamentoId: vine.number().positive().optional(),
    puesto: vine.string().trim().maxLength(100).optional(),
    salario: vine.number().positive().optional(),
    observaciones: vine.string().trim().maxLength(500).optional()
  })
)

// Validator para búsqueda por RFID
export const findByRfidValidator = vine.compile(
  vine.object({
    rfid: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(50)
      .regex(/^[A-Fa-f0-9]+$/)
      .transform((value) => value.toUpperCase())
  })
)