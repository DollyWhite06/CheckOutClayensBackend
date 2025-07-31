// commands/generate_daily_attendance.ts
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import AttendanceLog from '#models/attendance_log'
import Empleado from '#models/empleado'
import { DateTime } from 'luxon'

export default class GenerateDailyAttendance extends BaseCommand {
  static commandName = 'attendance:generate-daily'
  static description = 'Genera registros de asistencia diarios para todos los empleados activos'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  async run() {
    const { default: AttendanceLog } = await import('#models/attendance_log')
    const { default: Empleado } = await import('#models/empleado')

    // Permitir especificar fecha como argumento, o usar hoy por defecto
    const fechaArg = this.parsed.args[0]
    const targetDate = fechaArg ? DateTime.fromISO(fechaArg) : DateTime.now()
    
    if (!targetDate.isValid) {
      this.logger.error('Fecha inválida. Use formato YYYY-MM-DD')
      return
    }

    const fechaTarget = targetDate.startOf('day')
    
    this.logger.info(`Generando registros de asistencia para: ${fechaTarget.toISODate()}`)

    try {
      // Obtener todos los empleados activos
      const empleadosActivos = await Empleado.query()
        .where('estado', true)
        .preload('planta') // Si tienes relación con planta

      this.logger.info(`Encontrados ${empleadosActivos.length} empleados activos`)

      let registrosCreados = 0
      let registrosExistentes = 0

      for (const empleado of empleadosActivos) {
        // Verificar si ya existe un registro para esta fecha
        const existingLog = await AttendanceLog.query()
          .where('empleado_id', empleado.numero)
          .where('fecha', fechaTarget.toFormat('yyyy-MM-dd'))
          .first()

        if (!existingLog) {
          // Crear registro con estado 'ausente' por defecto
          await AttendanceLog.create({
            empleadoId: empleado.numero,
            fecha: fechaTarget,
            entrada: null,
            salida: null,
            estado: 'ausente',
            dispositivoId: null,
            plantaId: empleado.plantaId || null,
          })
          
          registrosCreados++
          this.logger.info(`✓ Registro creado para: ${empleado.nombre} ${empleado.paterno}`)
        } else {
          registrosExistentes++
          this.logger.debug(`- Ya existe registro para: ${empleado.nombre} ${empleado.paterno}`)
        }
      }

      this.logger.success(`
📊 Resumen:
   • Fecha: ${fechaTarget.toISODate()}
   • Empleados procesados: ${empleadosActivos.length}
   • Registros creados: ${registrosCreados}
   • Registros existentes: ${registrosExistentes}
      `)

    } catch (error) {
      this.logger.error(`Error al generar registros: ${error.message}`)
      throw error
    }
  }
}