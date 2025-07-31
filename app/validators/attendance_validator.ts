import vine from '@vinejs/vine'

/**
 * Validator para registrar entrada/salida biométrica
 */
export const registerBiometricValidator = vine.compile(
  vine.object({
    biometric_id: vine.string().trim().minLength(1),
    timestamp: vine.date({
      formats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'X']
    }),
    device_id: vine.number().positive().optional(),
    planta_id: vine.number().positive().optional(),
    type: vine.enum(['entrada', 'salida']).optional()
  })
)

/**
 * Validator para crear registro manual de asistencia
 */
export const createAttendanceValidator = vine.compile(
  vine.object({
    empleado_id: vine.number().positive(),
    fecha: vine.date({
      formats: ['YYYY-MM-DD']
    }),
    entrada: vine.date({
      formats: ['YYYY-MM-DD HH:mm:ss', 'HH:mm:ss', 'HH:mm']
    }).optional(),
    salida: vine.date({
      formats: ['YYYY-MM-DD HH:mm:ss', 'HH:mm:ss', 'HH:mm']
    }).optional(),
    estado: vine.enum(['presente', 'ausente', 'retardo', 'permiso']),
    dispositivo_id: vine.number().positive().optional(),
    planta_id: vine.number().positive().optional()
  })
)

/**
 * Validator para actualizar registro de asistencia
 */
export const updateAttendanceValidator = vine.compile(
  vine.object({
    entrada: vine.date({
      formats: ['YYYY-MM-DD HH:mm:ss', 'HH:mm:ss', 'HH:mm']
    }).optional(),
    salida: vine.date({
      formats: ['YYYY-MM-DD HH:mm:ss', 'HH:mm:ss', 'HH:mm']
    }).optional(),
    estado: vine.enum(['presente', 'ausente', 'retardo', 'permiso']).optional(),
    dispositivo_id: vine.number().positive().optional(),
    planta_id: vine.number().positive().optional()
  })
)

/**
 * Validator para reportes de asistencia
 */
export const attendanceReportValidator = vine.compile(
  vine.object({
    fecha_inicio: vine.date({
      formats: ['YYYY-MM-DD']
    }),
    fecha_fin: vine.date({
      formats: ['YYYY-MM-DD']
    }),
    empleado_id: vine.number().positive().optional(),
    planta_id: vine.number().positive().optional(),
    departamento_id: vine.number().positive().optional(),
    estado: vine.enum(['presente', 'ausente', 'retardo', 'permiso']).optional(),
    include_weekends: vine.boolean().optional(),
    format: vine.enum(['json', 'csv', 'excel']).optional()
  })
)

/**
 * Validator para reporte de porcentajes
 */
export const attendancePercentageValidator = vine.compile(
  vine.object({
    fecha_inicio: vine.date({
      formats: ['YYYY-MM-DD']
    }),
    fecha_fin: vine.date({
      formats: ['YYYY-MM-DD']
    }),
    empleado_ids: vine.array(vine.number().positive()).optional(),
    planta_id: vine.number().positive().optional(),
    departamento_id: vine.number().positive().optional(),
    group_by: vine.enum(['empleado', 'departamento', 'planta']).optional()
  })
)

/**
 * Validator para registros faltantes
 */
export const missingAttendanceValidator = vine.compile(
  vine.object({
    fecha: vine.date({
      formats: ['YYYY-MM-DD']
    }),
    planta_id: vine.number().positive().optional(),
    departamento_id: vine.number().positive().optional(),
    include_permissions: vine.boolean().optional()
  })
)