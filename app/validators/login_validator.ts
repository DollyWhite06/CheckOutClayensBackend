// app/validators/auth_validator.ts
import vine from '@vinejs/vine'

// Validador para el login
export const loginValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .maxLength(255),
    password: vine
      .string()
      .minLength(6) // Reducido a 6 para ser más flexible
      .maxLength(255)
  })
)

// Validador para registro
export const registerValidator = vine.compile(
  vine.object({
    nombre: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100),
    apellido: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100),
    usuario: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(50)
      .regex(/^[a-zA-Z0-9_]+$/), // Solo alfanumérico y guión bajo
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .maxLength(255),
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/) // Al menos mayúscula, minúscula, número y carácter especial
      .confirmed(), // Requiere password_confirmation
    rolId: vine
      .number()
      .positive()
      .optional()
  })
)

// Validador para cambio de contraseña
export const changePasswordValidator = vine.compile(
  vine.object({
    current_password: vine
      .string()
      .minLength(1),
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/) // Al menos mayúscula, minúscula, número y carácter especial
      .confirmed()
  })
)

// Validador para recuperación de contraseña
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .maxLength(255)
  })
)

// Validador para reset de contraseña
export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine
      .string()
      .trim()
      .minLength(1),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .maxLength(255),
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/) // Al menos mayúscula, minúscula, número y carácter especial
      .confirmed()
  })
)

// Validador para refresh token
export const refreshTokenValidator = vine.compile(
  vine.object({
    refresh_token: vine
      .string()
      .trim()
      .minLength(1)
  })
)