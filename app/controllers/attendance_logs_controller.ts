import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AttendanceLog from '#models/attendance_log'
import Empleado from '#models/empleado'
import Device from '#models/device'
import Planta from '#models/planta'
import AttendanceException from '#exceptions/attendance_exception'
import {
  registerBiometricValidator,
  createAttendanceValidator,
  updateAttendanceValidator,
  attendanceReportValidator,
  attendancePercentageValidator,
  missingAttendanceValidator,
} from '#validators/attendance_validator'

export default class AttendanceController {
  /**
   * Registrar entrada/salida mediante biométrico
   */
  async registerBiometric({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerBiometricValidator)

    // Convertir timestamp (Date) a DateTime
    const timestamp = DateTime.fromJSDate(payload.timestamp)
    if (!timestamp.isValid) {
      throw AttendanceException.invalidTimestamp()
    }

    // Buscar empleado por biometric_id
    const AttendanceService = (await import('#services/attendande_service')).default
    const empleado = await AttendanceService.buscarEmpleadoPorBiometrico(payload.biometric_id)

    if (!empleado) {
      throw AttendanceException.employeeNotFound()
    }

    // Validar dispositivo si se proporciona
    if (payload.device_id) {
      const device = await Device.find(payload.device_id)
      if (!device) {
        throw AttendanceException.deviceNotFound()
      }
    }

    // Validar planta si se proporciona
    if (payload.planta_id) {
      const planta = await Planta.find(payload.planta_id)
      if (!planta) {
        throw AttendanceException.plantaNotFound()
      }
    }

    const fecha = timestamp.startOf('day')

    // Buscar registro existente para la fecha
    let attendanceLog = await AttendanceLog.query()
      .where('empleado_id', empleado.numero)
      .where('fecha', fecha.toSQLDate()!)
      .first()

    if (!attendanceLog) {
      // Crear nuevo registro
      attendanceLog = await AttendanceLog.create({
        empleadoId: empleado.numero,
        fecha: fecha,
        entrada: payload.type === 'salida' ? null : timestamp,
        salida: payload.type === 'entrada' ? null : timestamp,
        dispositivoId: payload.device_id,
        plantaId: payload.planta_id || empleado.plantaId,
        estado: 'presente',
      })
    } else {
      // Actualizar registro existente
      if (payload.type === 'entrada' || (!payload.type && !attendanceLog.entrada)) {
        if (attendanceLog.entrada && attendanceLog.salida) {
          throw AttendanceException.attendanceAlreadyRegistered()
        }
        attendanceLog.entrada = timestamp
      } else if (payload.type === 'salida' || (!payload.type && attendanceLog.entrada && !attendanceLog.salida)) {
        if (attendanceLog.salida) {
          throw AttendanceException.attendanceAlreadyRegistered()
        }
        attendanceLog.salida = timestamp
      }

      // Actualizar estado basado en horarios
      attendanceLog.estado = this.calculateAttendanceStatus(attendanceLog.entrada, attendanceLog.salida)

      await attendanceLog.save()
    }

    await attendanceLog.load('empleado')
    await attendanceLog.load('dispositivo')
    await attendanceLog.load('planta')

    return response.json({
      status: 'success',
      message: 'Asistencia registrada correctamente',
      data: attendanceLog,
    })
  }

  /**
   * Crear registro manual de asistencia
   */
  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAttendanceValidator)

    // Verificar que el empleado existe
    const empleado = await Empleado.find(payload.empleado_id)
    if (!empleado) {
      throw AttendanceException.employeeNotFound()
    }

    // Convertir fechas a DateTime
    const fecha = DateTime.fromJSDate(payload.fecha)
    const entrada = payload.entrada ? DateTime.fromJSDate(payload.entrada) : null
    const salida = payload.salida ? DateTime.fromJSDate(payload.salida) : null

    if (!fecha.isValid) {
      throw AttendanceException.invalidTimestamp()
    }

    // Verificar si ya existe un registro para esa fecha
    const existingLog = await AttendanceLog.query()
      .where('empleado_id', payload.empleado_id)
      .where('fecha', fecha.toSQLDate()!)
      .first()

    if (existingLog) {
      throw AttendanceException.attendanceAlreadyRegistered()
    }

    const attendanceLog = await AttendanceLog.create({
      empleadoId: empleado.numero,
      fecha: fecha,
      entrada: entrada,
      salida: salida,
      dispositivoId: payload.dispositivo_id,
      plantaId: payload.planta_id || empleado.plantaId,
      estado: payload.estado,
    })

    await attendanceLog.load('empleado')
    await attendanceLog.load('dispositivo')
    await attendanceLog.load('planta')

    return response.status(201).json({
      status: 'success',
      message: 'Registro de asistencia creado',
      data: attendanceLog,
    })
  }

  /**
   * Obtener registros de asistencia con filtros
   */
  async index({ request, response }: HttpContext) {
    const qs = request.qs()
    const page = qs.page || 1
    const limit = qs.limit || 20

    const query = AttendanceLog.query()
      .preload('empleado')
      .preload('dispositivo')
      .preload('planta')

    // Filtros
    if (qs.empleado_id) {
      query.where('empleado_id', qs.empleado_id)
    }

    if (qs.planta_id) {
      query.where('planta_id', qs.planta_id)
    }

    if (qs.fecha_inicio && qs.fecha_fin) {
      const fechaInicio = DateTime.fromISO(qs.fecha_inicio)
      const fechaFin = DateTime.fromISO(qs.fecha_fin)
      if (!fechaInicio.isValid || !fechaFin.isValid) {
        throw AttendanceException.invalidDateRange()
      }
      query.whereBetween('fecha', [fechaInicio.toSQLDate()!, fechaFin.toSQLDate()!])
    } else if (qs.fecha) {
      const fecha = DateTime.fromISO(qs.fecha)
      if (!fecha.isValid) {
        throw AttendanceException.invalidTimestamp()
      }
      query.where('fecha', fecha.toSQLDate()!)
    }

    if (qs.estado) {
      query.where('estado', qs.estado)
    }

    query.orderBy('fecha', 'desc').orderBy('created_at', 'desc')

    const attendanceLogs = await query.paginate(page, limit)

    return response.json({
      status: 'success',
      data: attendanceLogs,
    })
  }

  /**
   * Obtener un registro específico
   */
  async show({ params, response }: HttpContext) {
    const attendanceLog = await AttendanceLog.query()
      .where('id', params.id)
      .preload('empleado')
      .preload('dispositivo')
      .preload('planta')
      .firstOrFail()

    return response.json({
      status: 'success',
      data: attendanceLog,
    })
  }

  /**
   * Actualizar registro de asistencia
   */
  async update({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(updateAttendanceValidator)

    const attendanceLog = await AttendanceLog.findOrFail(params.id)

    // Convertir fechas a DateTime si están presentes
    const updatedData = {
      entrada: payload.entrada ? DateTime.fromJSDate(payload.entrada) : undefined,
      salida: payload.salida ? DateTime.fromJSDate(payload.salida) : undefined,
      estado: payload.estado,
      dispositivoId: payload.dispositivo_id,
      plantaId: payload.planta_id,
    }

    attendanceLog.merge(updatedData)
    await attendanceLog.save()

    await attendanceLog.load('empleado')
    await attendanceLog.load('dispositivo')
    await attendanceLog.load('planta')

    return response.json({
      status: 'success',
      message: 'Registro actualizado correctamente',
      data: attendanceLog,
    })
  }

  /**
   * Eliminar registro de asistencia
   */
  async destroy({ params, response }: HttpContext) {
    const attendanceLog = await AttendanceLog.findOrFail(params.id)
    await attendanceLog.delete()

    return response.json({
      status: 'success',
      message: 'Registro eliminado correctamente',
    })
  }

  /**
   * Generar reporte de asistencia
   */
  async generateReport({ request, response }: HttpContext) {
    const payload = await request.validateUsing(attendanceReportValidator)

    // Convertir fechas a DateTime
    const fechaInicio = DateTime.fromJSDate(payload.fecha_inicio)
    const fechaFin = DateTime.fromJSDate(payload.fecha_fin)

    if (!fechaInicio.isValid || !fechaFin.isValid || fechaInicio >= fechaFin) {
      throw AttendanceException.invalidDateRange()
    }

    const query = AttendanceLog.query()
      .preload('empleado', (empleadoQuery) => {
        empleadoQuery.preload('departamento')
      })
      .preload('planta')
      .whereBetween('fecha', [fechaInicio.toSQLDate()!, fechaFin.toSQLDate()!])

    // Aplicar filtros
    if (payload.empleado_id) {
      query.where('empleado_id', payload.empleado_id)
    }

    if (payload.planta_id) {
      query.where('planta_id', payload.planta_id)
    }

    if (payload.estado) {
      query.where('estado', payload.estado)
    }

    if (payload.departamento_id) {
      query.whereHas('empleado', (empleadoQuery) => {
        empleadoQuery.where('departamento_id', payload.departamento_id || 0)
      })
    }

    const attendanceRecords = await query.orderBy('fecha', 'asc')

    // Calcular estadísticas
    const totalRecords = attendanceRecords.length
    const statusCounts = attendanceRecords.reduce(
      (acc, record) => {
        acc[record.estado] = (acc[record.estado] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const report = {
      periodo: {
        inicio: fechaInicio.toISODate()!,
        fin: fechaFin.toISODate()!,
      },
      estadisticas: {
        total_registros: totalRecords,
        presente: statusCounts.presente || 0,
        ausente: statusCounts.ausente || 0,
        retardo: statusCounts.retardo || 0,
        permiso: statusCounts.permiso || 0,
        porcentaje_asistencia: totalRecords > 0 ? ((statusCounts.presente || 0) / totalRecords * 100).toFixed(2) : '0.00',
      },
      registros: attendanceRecords,
    }

    return response.json({
      status: 'success',
      data: report,
    })
  }

  /**
   * Obtener porcentajes de asistencia
   */
  async getAttendancePercentages({ request, response }: HttpContext) {
    const payload = await request.validateUsing(attendancePercentageValidator)

    // Convertir fechas a DateTime
    const fechaInicio = DateTime.fromJSDate(payload.fecha_inicio)
    const fechaFin = DateTime.fromJSDate(payload.fecha_fin)

    if (!fechaInicio.isValid || !fechaFin.isValid || fechaInicio >= fechaFin) {
      throw AttendanceException.invalidDateRange()
    }

    const query = AttendanceLog.query()
      .preload('empleado', (empleadoQuery) => {
        empleadoQuery.preload('departamento')
      })
      .whereBetween('fecha', [fechaInicio.toSQLDate()!, fechaFin.toSQLDate()!])

    // Aplicar filtros
    if (payload.empleado_ids?.length) {
      query.whereIn('empleado_id', payload.empleado_ids)
    }

    if (payload.planta_id) {
      query.where('planta_id', payload.planta_id)
    }

    if (payload.departamento_id) {
      query.whereHas('empleado', (empleadoQuery) => {
        empleadoQuery.where('departamento_id', payload.departamento_id || 0)
      })
    }

    const records = await query

    // Agrupar y calcular porcentajes
    const groupedData = this.groupAttendanceData(records, payload.group_by || 'empleado')

    return response.json({
      status: 'success',
      data: {
        periodo: {
          inicio: fechaInicio.toISODate()!,
          fin: fechaFin.toISODate()!,
        },
        porcentajes: groupedData,
      },
    })
  }

  /**
   * Obtener reporte completo de asistencia diaria
   */
  async getDailyReport({ request, response }: HttpContext) {
    const payload = await request.validateUsing(missingAttendanceValidator)

    // Convertir fecha a DateTime
    const fecha = DateTime.fromJSDate(payload.fecha)
    if (!fecha.isValid) {
      throw AttendanceException.invalidTimestamp()
    }

    const filters = {
      planta_id: payload.planta_id,
      departamento_id: payload.departamento_id,
      incluir_permisos: payload.include_permissions || false,
    }

    const AttendanceService = (await import('#services/attendande_service')).default
    const reporte = await AttendanceService.getDailyAttendanceReport(fecha, filters)

    return response.json({
      status: 'success',
      data: {
        fecha: fecha.toISODate()!,
        reporte,
      },
    })
  }

  /**
   * Obtener empleados ausentes HOY
   */
  async getAusentesHoy({ request, response }: HttpContext) {
    const qs = request.qs()

    const filters = {
      planta_id: qs.planta_id ? parseInt(qs.planta_id) : undefined,
      departamento_id: qs.departamento_id ? parseInt(qs.departamento_id) : undefined,
    }

    const AttendanceService = (await import('#services/attendande_service')).default
    const ausentes = await AttendanceService.getAusentesHoy(filters)

    return response.json({
      status: 'success',
      data: {
        fecha: DateTime.local().toISODate()!,
        total_ausentes: ausentes.length,
        empleados_ausentes: ausentes,
      },
    })
  }

  /**
   * Obtener empleados presentes HOY
   */
  async getPresentesHoy({ request, response }: HttpContext) {
    const qs = request.qs()

    const filters = {
      planta_id: qs.planta_id ? parseInt(qs.planta_id) : undefined,
      departamento_id: qs.departamento_id ? parseInt(qs.departamento_id) : undefined,
    }

    const AttendanceService = (await import('#services/attendande_service')).default
    const presentes = await AttendanceService.getPresentesHoy(filters)

    return response.json({
      status: 'success',
      data: {
        fecha: DateTime.local().toISODate()!,
        total_presentes: presentes.length,
        empleados_presentes: presentes,
      },
    })
  }

  /**
   * Crear registros de ausencia para empleados faltantes
   */
  async crearRegistrosAusencia({ request, response }: HttpContext) {
    const payload = await request.validateUsing(missingAttendanceValidator)

    // Convertir fecha a DateTime
    const fecha = DateTime.fromJSDate(payload.fecha)
    if (!fecha.isValid) {
      throw AttendanceException.invalidTimestamp()
    }

    const filters = {
      planta_id: payload.planta_id,
      departamento_id: payload.departamento_id,
    }

    const AttendanceService = (await import('#services/attendande_service')).default
    const registrosCreados = await AttendanceService.crearRegistrosAusencia(fecha, filters)

    return response.json({
      status: 'success',
      message: `Se crearon ${registrosCreados} registros de ausencia`,
      data: {
        fecha: fecha.toISODate()!,
        registros_creados: registrosCreados,
      },
    })
  }

  /**
   * Obtener estadísticas por grupo
   */
  async getEstadisticasPorGrupo({ request, response }: HttpContext) {
    const payload = await request.validateUsing(missingAttendanceValidator)

    // Convertir fecha a DateTime
    const fecha = DateTime.fromJSDate(payload.fecha)
    if (!fecha.isValid) {
      throw AttendanceException.invalidTimestamp()
    }

    const filters = {
      planta_id: payload.planta_id,
      departamento_id: payload.departamento_id,
    }

    const AttendanceService = (await import('#services/attendande_service')).default
    const estadisticas = await AttendanceService.getEstadisticasPorGrupo(fecha, filters)

    return response.json({
      status: 'success',
      data: {
        fecha: fecha.toISODate()!,
        estadisticas_por_grupo: estadisticas,
      },
    })
  }

  /**
   * Obtener empleados sin método biométrico configurado
   */
  async getEmpleadosSinBiometrico({ request, response }: HttpContext) {
    const qs = request.qs()

    const filters = {
      planta_id: qs.planta_id ? parseInt(qs.planta_id) : undefined,
      departamento_id: qs.departamento_id ? parseInt(qs.departamento_id) : undefined,
      grupo_id: qs.grupo_id ? parseInt(qs.grupo_id) : undefined,
    }

    const AttendanceService = (await import('#services/attendande_service')).default
    const empleadosSinBiometrico = await AttendanceService.getEmpleadosSinBiometrico(filters)

    return response.json({
      status: 'success',
      data: {
        total: empleadosSinBiometrico.length,
        empleados: empleadosSinBiometrico.map((empleado) => ({
          numero: empleado.numero,
          nombre: `${empleado.nombre} ${empleado.paterno} ${empleado.materno || ''}`.trim(),
          grupo: empleado.grupo?.nombre,
          departamento: empleado.departamento?.nombre,
          planta: empleado.planta?.planta,
          fecha_ingreso: empleado.fecha_ingreso?.toISODate(),
        })),
      },
    })
  }

  /**
   * Obtener ausencias críticas (más de 2 días consecutivos)
   */
  async getAusenciasCriticas({ request, response }: HttpContext) {
    const payload = await request.validateUsing(missingAttendanceValidator)

    // Convertir fecha a DateTime
    const fecha = DateTime.fromJSDate(payload.fecha)
    if (!fecha.isValid) {
      throw AttendanceException.invalidTimestamp()
    }

    const filters = {
      planta_id: payload.planta_id,
      departamento_id: payload.departamento_id,
    }

    const AttendanceService = (await import('#services/attendande_service')).default
    const ausenciasCriticas = await AttendanceService.getAusenciasCriticas(fecha, filters)

    return response.json({
      status: 'success',
      data: {
        fecha: fecha.toISODate()!,
        total_criticas: ausenciasCriticas.length,
        ausencias_criticas: ausenciasCriticas,
      },
    })
  }

  /**
   * Calcular estado de asistencia basado en horarios
   */
  private calculateAttendanceStatus(entrada: DateTime | null, salida: DateTime | null): 'presente' | 'ausente' | 'retardo' | 'permiso' {
    if (!entrada && !salida) {
      return 'ausente'
    }

    if (!entrada) {
      return 'presente'
    }

    // Horario estándar: 8:00 AM con tolerancia de 10 minutos
    const horarioLimite = entrada.startOf('day').plus({ hours: 8, minutes: 10 })

    if (entrada > horarioLimite) {
      return 'retardo'
    }

    return 'presente'
  }

  /**
   * Agrupar datos de asistencia para cálculo de porcentajes
   */
  private groupAttendanceData(records: AttendanceLog[], groupBy: string) {
    const grouped = records.reduce((acc, record) => {
      let key: string

      switch (groupBy) {
        case 'departamento':
          key = record.empleado.departamento?.nombre || 'Sin departamento'
          break
        case 'planta':
          key = record.planta?.planta || 'Sin planta'
          break
        default:
          key = `${record.empleado.nombre} (${record.empleado.numero})`
      }

      if (!acc[key]) {
        acc[key] = {
          total: 0,
          presente: 0,
          ausente: 0,
          retardo: 0,
          permiso: 0,
        }
      }

      acc[key].total++
      acc[key][record.estado]++

      return acc
    }, {} as Record<string, any>)

    // Calcular porcentajes
    return Object.entries(grouped).map(([key, data]) => ({
      grupo: key,
      estadisticas: {
        ...data,
        porcentaje_asistencia: ((data.presente / data.total) * 100).toFixed(2),
        porcentaje_retardos: ((data.retardo / data.total) * 100).toFixed(2),
        porcentaje_ausencias: ((data.ausente / data.total) * 100).toFixed(2),
      },
    }))
  }
}