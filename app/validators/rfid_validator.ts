// app/validators/tarjeta_rfid_validator.ts
import vine from '@vinejs/vine'

// Validator para crear una nueva tarjeta RFID
export const createTarjetaRfidValidator = vine.compile(
  vine.object({
    uid: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(50)
      .regex(/^[A-Fa-f0-9]+$/) // Solo caracteres hexadecimales
      .transform((value) => value.toUpperCase()), // Convertir a mayúsculas para consistencia
    activa: vine.boolean().optional(),
    empleadoNumero: vine.number().positive().optional()
  })
)

// Validator para actualizar una tarjeta RFID
export const updateTarjetaRfidValidator = vine.compile(
  vine.object({
    uid: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(50)
      .regex(/^[A-Fa-f0-9]+$/)
      .transform((value) => value.toUpperCase())
      .optional(),
    activa: vine.boolean().optional(),
    empleadoNumero: vine.number().positive().nullable().optional()
  })
)

// Validator para asignar tarjeta a empleado
export const asignarTarjetaValidator = vine.compile(
  vine.object({
    empleadoNumero: vine.number().positive()
  })
)