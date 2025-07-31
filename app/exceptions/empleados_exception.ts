// start/exceptions/empleado_exception.ts
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmpleadoException extends Exception {
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
  static numeroEmpleadoExists() {
    return new this('Número de empleado ya existe', 409, 'EMP_001', 'Ya existe un empleado registrado con ese número.')
  }

  static rfidUidAlreadyExists() {
    return new this('RFID ya registrado', 409, 'EMP_002', 'El UID del RFID ya está asignado a otro empleado.')
  }

  static empleadoNotFound() {
    return new this('Empleado no encontrado', 404, 'EMP_003', 'No se encontró el empleado especificado.')
  }

  static empleadoAlreadyInactive() {
    return new this('Empleado ya inactivo', 400, 'EMP_004', 'El empleado ya se encuentra desactivado.')
  }

  static rfidRequired() {
    return new this('RFID requerido', 422, 'EMP_005', 'Se requiere el parámetro RFID para realizar la búsqueda.')
  }

  static empleadoByRfidNotFound() {
    return new this('Empleado no encontrado por RFID', 404, 'EMP_006', 'No se encontró ningún empleado con el RFID especificado.')
  }

  static grupoNotFound() {
    return new this('Grupo no encontrado', 404, 'EMP_007', 'El grupo especificado no existe.')
  }

  static plantaNotFound() {
    return new this('Planta no encontrada', 404, 'EMP_008', 'La planta especificada no existe.')
  }

  static departamentoNotFound() {
    return new this('Departamento no encontrado', 404, 'EMP_009', 'El departamento especificado no existe.')
  }

  static invalidDateRange() {
    return new this('Rango de fechas inválido', 422, 'EMP_010', 'La fecha de baja no puede ser anterior a la fecha de ingreso.')
  }

  static invalidRfidFormat() {
    return new this('Formato de RFID inválido', 422, 'EMP_011', 'El formato del UID del RFID es inválido.')
  }
}