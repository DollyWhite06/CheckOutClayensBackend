import AttendanceLog from '#models/attendance_log'
import Empleado from '#models/empleado'
import { DateTime } from 'luxon'

interface DailyAttendanceReport {
  fecha: string
  resumen: {
    total_empleados: number
    presentes: number
    ausentes: number
    retardos: number
    permisos: number
    porcentaje_asistencia: string
  }
  empleados_presentes: EmpleadoAsistencia[]
  empleados_ausentes: EmpleadoAusente[]
  empleados_retardos: EmpleadoAsistencia[]
  empleados_permisos: EmpleadoAsistencia[]
}

interface EmpleadoAsistencia {
  numero: number
  nombre: string
  nombre_completo: string
  grupo: string
  departamento: string
  planta: string
  entrada: string | null
  salida: string | null
  fingerprint_id: string | null
  minutos_tarde?: number
}

interface EmpleadoAusente {
  numero: number
  nombre: string
  nombre_completo: string
  grupo: string
  departamento: string
  planta: string
  fingerprint_id: string | null
  dias_consecutivos_ausente?: number
  fecha_ingreso: string | null
}

interface AttendanceFilters {
  planta_id?: number
  departamento_id?: number
  grupo_id?: number
  incluir_inactivos?: boolean
  incluir_permisos?: boolean
  solo_con_biometrico?: boolean
}

export default class AttendanceService {
  /**
   * Reporte completo de asistencia para una fecha específica
   */
  static async getDailyAttendanceReport(
    fecha: DateTime,
    filters: AttendanceFilters = {}
  ): Promise<DailyAttendanceReport> {
    
    // 1. Obtener todos los empleados que deberían trabajar ese día
    const empleadosQuery = Empleado.query()
      .preload('departamento')
      .preload('planta')
      .preload('grupo')

    // Filtros de empleados
    if (!filters.incluir_inactivos) {
      empleadosQuery.where('activo', true)
    }

    if (filters.planta_id) {
      empleadosQuery.where('planta_id', filters.planta_id)
    }

    if (filters.departamento_id) {
      empleadosQuery.where('departamento_id', filters.departamento_id)
    }

    if (filters.grupo_id) {
      empleadosQuery.where('grupo_id', filters.grupo_id)
    }

    // Solo empleados con método biométrico configurado
    if (filters.solo_con_biometrico) {
      empleadosQuery.where((query) => {
        query.whereNotNull('rfid_uid').orWhereNotNull('fingerprint_id')
      })
    }

    // Filtrar empleados que estaban activos en esa fecha
    empleadosQuery.where((query) => {
      query.whereNull('fecha_baja').orWhere('fecha_baja', '>=', fecha.toSQLDate()!)
    })

    // Solo empleados que ya habían ingresado en esa fecha
    empleadosQuery.where((query) => {
      query.whereNull('fecha_ingreso').orWhere('fecha_ingreso', '<=', fecha.toSQLDate()!)
    })

    const todosLosEmpleados = await empleadosQuery

    // 2. Obtener registros de asistencia para esa fecha
    const registrosAsistencia = await AttendanceLog.query()
      .where('fecha', fecha.toSQLDate()!)
      .preload('empleado', (empleadoQuery) => {
        empleadoQuery.preload('departamento').preload('planta').preload('grupo')
      })

    // 3. Crear mapas para análisis rápido
    const asistenciaMap = new Map<number, AttendanceLog>()
    registrosAsistencia.forEach(registro => {
      asistenciaMap.set(registro.empleadoId, registro)
    })

    // 4. Clasificar empleados
    const presentes: EmpleadoAsistencia[] = []
    const ausentes: EmpleadoAusente[] = []
    const retardos: EmpleadoAsistencia[] = []
    const permisos: EmpleadoAsistencia[] = []

    for (const empleado of todosLosEmpleados) {
      const registro = asistenciaMap.get(empleado.numero)
      const nombreCompleto = this.getNombreCompleto(empleado)

      if (!registro) {
        // Sin registro = ausente
        const diasConsecutivos = await this.getDiasConsecutivosAusente(empleado.numero, fecha)
        
        ausentes.push({
          numero: empleado.numero,
          nombre: empleado.nombre,
          nombre_completo: nombreCompleto,
          grupo: empleado.grupo?.nombre || 'Sin grupo',
          departamento: empleado.departamento?.nombre || 'Sin departamento',
          planta: empleado.planta?.planta || 'Sin planta',
          fingerprint_id: empleado.fingerprintId || 'No fingerprint',
          dias_consecutivos_ausente: diasConsecutivos,
          fecha_ingreso: empleado.fecha_ingreso?.toISODate() || null
        })
      } else {
        const empleadoData: EmpleadoAsistencia = {
          numero: empleado.numero,
          nombre: empleado.nombre,
          nombre_completo: nombreCompleto,
          grupo: empleado.grupo?.nombre || 'Sin grupo',
          departamento: empleado.departamento?.nombre || 'Sin departamento',
          planta: empleado.planta?.planta || 'Sin planta',
          entrada: registro.entrada?.toFormat('HH:mm:ss') || null,
          salida: registro.salida?.toFormat('HH:mm:ss') || null,
          fingerprint_id: empleado.fingerprintId || 'No fingerprint'
        }

        // Clasificar según estado
        switch (registro.estado) {
          case 'presente':
            presentes.push(empleadoData)
            break
          case 'retardo':
            // Calcular minutos de retraso (si tienes horarios definidos en otro modelo)
            if (registro.entrada) {
              const minutosRetraso = this.calcularMinutosRetraso(registro.entrada, empleado)
              empleadoData.minutos_tarde = minutosRetraso
            }
            retardos.push(empleadoData)
            break
          case 'permiso':
            if (filters.incluir_permisos) {
              permisos.push(empleadoData)
            }
            break
          case 'ausente':
            // Si hay registro pero marcado como ausente
            const diasConsecutivos = await this.getDiasConsecutivosAusente(empleado.numero, fecha)
            ausentes.push({
              numero: empleado.numero,
              nombre: empleado.nombre,
              nombre_completo: nombreCompleto,
              grupo: empleado.grupo?.nombre || 'Sin grupo',
              departamento: empleado.departamento?.nombre || 'Sin departamento',
              planta: empleado.planta?.planta || 'Sin planta',
              fingerprint_id: empleado.fingerprintId || 'No fingerprint',
              dias_consecutivos_ausente: diasConsecutivos,
              fecha_ingreso: empleado.fecha_ingreso?.toISODate() || null
            })
            break
        }
      }
    }

    // 5. Calcular estadísticas
    const totalEmpleados = todosLosEmpleados.length
    const totalPresentes = presentes.length + retardos.length
    const porcentajeAsistencia = totalEmpleados > 0 
      ? ((totalPresentes / totalEmpleados) * 100).toFixed(2)
      : '0.00'

    return {
      fecha: fecha.toISODate()!,
      resumen: {
        total_empleados: totalEmpleados,
        presentes: presentes.length,
        ausentes: ausentes.length,
        retardos: retardos.length,
        permisos: permisos.length,
        porcentaje_asistencia: porcentajeAsistencia
      },
      empleados_presentes: presentes,
      empleados_ausentes: ausentes,
      empleados_retardos: retardos,
      empleados_permisos: permisos
    }
  }

  /**
   * Obtener empleados ausentes para HOY
   */
  static async getAusentesHoy(filters: AttendanceFilters = {}): Promise<EmpleadoAusente[]> {
    const hoy = DateTime.now().startOf('day')
    const reporte = await this.getDailyAttendanceReport(hoy, filters)
    return reporte.empleados_ausentes
  }

  /**
   * Obtener empleados presentes para HOY
   */
  static async getPresentesHoy(filters: AttendanceFilters = {}): Promise<EmpleadoAsistencia[]> {
    const hoy = DateTime.now().startOf('day')
    const reporte = await this.getDailyAttendanceReport(hoy, filters)
    return [...reporte.empleados_presentes, ...reporte.empleados_retardos]
  }

  /**
   * Buscar empleado por RFID o Fingerprint
   */
  static async buscarEmpleadoPorBiometrico(biometricId: string): Promise<Empleado | null> {
    return await Empleado.query()
      .where('rfid_uid', biometricId)
      .orWhere('fingerprint_id', biometricId)
      .where('activo', true)
      .preload('departamento')
      .preload('planta')
      .preload('grupo')
      .first()
  }

  /**
   * Crear registros de ausencia para empleados faltantes
   * (Útil para ejecutar al final del día)
   */
  static async crearRegistrosAusencia(fecha: DateTime, filters: AttendanceFilters = {}): Promise<number> {
    const reporte = await this.getDailyAttendanceReport(fecha, filters)
    let registrosCreados = 0

    for (const empleadoAusente of reporte.empleados_ausentes) {
      // Verificar que no exista ya un registro
      const registroExistente = await AttendanceLog.query()
        .where('empleado_id', empleadoAusente.numero)
        .where('fecha', fecha.toSQLDate()!)
        .first()

      if (!registroExistente) {
        await AttendanceLog.create({
          empleadoId: empleadoAusente.numero,
          fecha: fecha,
          entrada: null,
          salida: null,
          estado: 'ausente',
          dispositivoId: null,
          plantaId: null
        })
        registrosCreados++
      }
    }

    return registrosCreados
  }

  /**
   * Obtener estadísticas por grupo
   */
  static async getEstadisticasPorGrupo(fecha: DateTime, filters: AttendanceFilters = {}): Promise<any> {
    const reporte = await this.getDailyAttendanceReport(fecha, filters)
    
    const estadisticasPorGrupo = new Map<string, any>()

    // Procesar todos los empleados (presentes y ausentes)
    const todosEmpleados = [
      ...reporte.empleados_presentes.map(e => ({ ...e, estado: 'presente' })),
      ...reporte.empleados_retardos.map(e => ({ ...e, estado: 'retardo' })),
      ...reporte.empleados_ausentes.map(e => ({ ...e, estado: 'ausente' })),
      ...reporte.empleados_permisos.map(e => ({ ...e, estado: 'permiso' }))
    ]

    todosEmpleados.forEach(empleado => {
      const grupo = empleado.grupo
      
      if (!estadisticasPorGrupo.has(grupo)) {
        estadisticasPorGrupo.set(grupo, {
          nombre_grupo: grupo,
          total: 0,
          presente: 0,
          ausente: 0,
          retardo: 0,
          permiso: 0
        })
      }

      const stats = estadisticasPorGrupo.get(grupo)!
      stats.total++
      stats[empleado.estado]++
    })

    // Convertir a array y calcular porcentajes
    return Array.from(estadisticasPorGrupo.values()).map(stats => ({
      ...stats,
      porcentaje_asistencia: stats.total > 0 ? 
        (((stats.presente + stats.retardo) / stats.total) * 100).toFixed(2) : '0.00'
    }))
  }

  /**
   * Calcular días consecutivos de ausencia
   */
  private static async getDiasConsecutivosAusente(empleadoNumero: number, fechaActual: DateTime): Promise<number> {
    let diasConsecutivos = 0
    let fechaCheck = fechaActual.minus({ days: 1 }) // Empezar desde ayer

    // Revisar hasta 30 días atrás como máximo
    for (let i = 0; i < 30; i++) {
      const registro = await AttendanceLog.query()
        .where('empleado_id', empleadoNumero)
        .where('fecha', fechaCheck.toSQLDate()!)
        .first()

      if (!registro || registro.estado === 'ausente') {
        diasConsecutivos++
        fechaCheck = fechaCheck.minus({ days: 1 })
      } else {
        // Si encuentra asistencia, rompe la secuencia
        break
      }
    }

    return diasConsecutivos
  }

  /**
   * Obtener nombre completo del empleado
   */
  private static getNombreCompleto(empleado: Empleado): string {
    const partes = [empleado.nombre, empleado.paterno]
    if (empleado.materno) {
      partes.push(empleado.materno)
    }
    return partes.join(' ')
  }

  /**
   * Calcular minutos de retraso
   * (Necesitarías definir horarios por grupo, departamento o empleado)
   */
  private static calcularMinutosRetraso(entrada: DateTime, empleado: Empleado): number {
    // Por ahora, asumir horario estándar de 8:00 AM
    // Deberías implementar esto según tu lógica de horarios
    const horarioEstandar = entrada.startOf('day').plus({ hours: 8 })
    
    if (entrada > horarioEstandar) {
      return Math.floor(entrada.diff(horarioEstandar, 'minutes').minutes)
    }
    
    return 0
  }

  /**
   * Generar alerta de ausencias críticas
   */
  static async getAusenciasCriticas(fecha: DateTime, filters: AttendanceFilters = {}): Promise<EmpleadoAusente[]> {
    const reporte = await this.getDailyAttendanceReport(fecha, filters)
    
    // Filtrar empleados con más de 2 días consecutivos de ausencia
    return reporte.empleados_ausentes.filter(
      empleado => (empleado.dias_consecutivos_ausente || 0) >= 2
    )
  }

  /**
   * Obtener empleados sin método biométrico configurado
   */
  static async getEmpleadosSinBiometrico(filters: AttendanceFilters = {}): Promise<Empleado[]> {
    const query = Empleado.query()
      .where('activo', true)
      .whereNull('rfid_uid')
      .whereNull('fingerprint_id')
      .preload('departamento')
      .preload('planta')
      .preload('grupo')

    if (filters.planta_id) {
      query.where('planta_id', filters.planta_id)
    }

    if (filters.departamento_id) {
      query.where('departamento_id', filters.departamento_id)
    }

    if (filters.grupo_id) {
      query.where('grupo_id', filters.grupo_id)
    }

    return await query
  }
}