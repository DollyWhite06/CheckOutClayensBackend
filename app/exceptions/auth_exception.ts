// app/exceptions/auth_exception.ts
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthException extends Exception {
  constructor(message: string, status: number, code: string, public description?: string) {
    super(message, { status, code })
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      error_code: error.code,
      status: 'error',
      message: error.message,
      description: error.description ?? '',
    })
  }

  // Métodos estáticos para errores de autenticación
  static invalidCredentials() {
    return new this('Credenciales inválidas', 401, 'AUTH_001', 'El email o la contraseña son incorrectos.')
  }

  static userNotFound() {
    return new this('Usuario no encontrado', 404, 'AUTH_002', 'No existe un usuario con ese email.')
  }

  static emailAlreadyExists() {
    return new this('Email ya registrado', 409, 'AUTH_003', 'Ya existe una cuenta con ese email.')
  }

  static userAlreadyExists() {
    return new this('El usuario ya existe', 400, 'AUTH_011', 'Ya existe una cuenta con ese nombre de usuario.')
  }

  static invalidToken() {
    return new this('No autorizado o token inválido', 401, 'AUTH_004', 'El token proporcionado es inválido o ha expirado.')
  }

  static tokenExpired() {
    return new this('Token expirado', 401, 'AUTH_005', 'El token ha expirado. Por favor, inicia sesión nuevamente.')
  }

  static refreshTokenNotProvided() {
    return new this('Refresh token no proporcionado en el header Authorization', 401, 'AUTH_006', 'Se requiere un refresh token en el header Authorization.')
  }

  static refreshTokenError(errorMessage: string) {
    return new this('Error al renovar tokens', 401, 'AUTH_007', errorMessage)
  }

  static unauthorizedAccess() {
    return new this('Acceso no autorizado', 403, 'AUTH_008', 'No tienes permisos para acceder a este recurso.')
  }

  static accountInactive() {
    return new this('Cuenta inactiva', 403, 'AUTH_009', 'Tu cuenta ha sido desactivada. Contacta al administrador.')
  }

  static currentPasswordIncorrect() {
    return new this('Contraseña actual incorrecta', 400, 'AUTH_010', 'La contraseña actual proporcionada es incorrecta.')
  }

  static passwordResetTokenInvalid() {
    return new this('Token de recuperación inválido', 400, 'AUTH_011', 'El token de recuperación es inválido o ha expirado.')
  }

  // Método auxiliar para mapear errores de refresh token
  static mapRefreshTokenError(error: any): string {
    if (error.message.includes('expired')) {
      return 'Refresh token expirado'
    }
    if (error.message.includes('invalid') || error.message.includes('malformed')) {
      return 'Refresh token inválido'
    }
    if (error.message.includes('revoked')) {
      return 'Refresh token revocado'
    }
    return 'Error de autenticación'
  }
}