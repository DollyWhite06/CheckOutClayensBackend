// start/exceptions/auth_exception.ts
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class RfidException extends Exception {
  constructor(message: string, status: number, code: string, public description?: string) {
    super(message, { status, code })
  }

  // Este método formatea la salida del error
  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      error_code: error.code,
      status: 'error',
      message: error.message,
      description: error.description ?? '',
    })
  }

  // Métodos estáticos para lanzar errores personalizados
  static invalidUid() {
    return new this('UID inválido', 422, 'CARD_001', 'El UID de la tarjeta es inválido.')
  }

  static uidAlreadyExists() {
    return new this('UID ya registrado', 409, 'CARD_002', 'Ya existe una tarjeta con ese UID.')
  }

  static tarjetaNotFound() {
    return new this('Tarjeta no encontrada', 404, 'CARD_003', 'No se encontró la tarjeta especificada.')
  }

  static tarjetaInactiva() {
    return new this('Tarjeta inactiva', 403, 'CARD_004', 'La tarjeta está desactivada y no se puede usar.')
  }

  static tarjetaYaAsignada() {
    return new this('Tarjeta ya asignada', 409, 'CARD_005', 'La tarjeta ya está asignada a otro empleado.')
  }

  static empleadoNotFound() {
    return new this('Empleado no encontrado', 404, 'CARD_006', 'El número de empleado no existe.')
  }
}