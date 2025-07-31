import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class AttendanceException extends Exception {
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

  // Métodos estáticos para errores de asistencia
  static invalidBiometricId() {
    return new this('ID biométrico inválido', 422, 'ATTENDANCE_001', 'El ID de la huella biométrica no existe.')
  }

  static employeeNotFound() {
    return new this('Empleado no encontrado', 404, 'ATTENDANCE_002', 'No hay un empleado asociado con este ID biométrico.')
  }

  static attendanceAlreadyRegistered() {
    return new this('Asistencia ya registrada', 400, 'ATTENDANCE_003', 'La entrada y salida ya están registradas para este día.')
  }

  static invalidTimestamp() {
    return new this('Timestamp inválido', 422, 'ATTENDANCE_004', 'El timestamp proporcionado no es válido.')
  }

  static deviceNotFound() {
    return new this('Dispositivo no encontrado', 404, 'ATTENDANCE_005', 'El dispositivo especificado no existe.')
  }

  static plantaNotFound() {
    return new this('Planta no encontrada', 404, 'ATTENDANCE_006', 'La planta especificada no existe.')
  }

  static invalidDateRange() {
    return new this('Rango de fechas inválido', 422, 'ATTENDANCE_007', 'La fecha de inicio debe ser anterior a la fecha de fin.')
  }
}