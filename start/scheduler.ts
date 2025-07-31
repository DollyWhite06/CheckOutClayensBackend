// start/scheduler.ts
import cron from 'node-cron'

// Ejecutar todos los días a las 6:00 AM
const dailyJob = cron.schedule('0 6 * * *', async () => {
  try {
    console.log('🕕 Iniciando generación de registros diarios de asistencia...')
    
    // Importar dinámicamente para evitar problemas de carga
    const { default: AttendanceLog } = await import('#models/attendance_log')
    const { default: Empleado } = await import('#models/empleado')
    const { DateTime } = await import('luxon')
    
    const hoy = DateTime.now().startOf('day')
    const empleadosActivos = await Empleado.query().where('estado', true)
    
    let registrosCreados = 0
    
    for (const empleado of empleadosActivos) {
      const existingLog = await AttendanceLog.query()
        .where('empleado_id', empleado.numero)
        .where('fecha', hoy.toFormat('yyyy-MM-dd'))
        .first()
      
      if (!existingLog) {
        await AttendanceLog.create({
          empleadoId: empleado.numero,
          fecha: hoy,
          entrada: null,
          salida: null,
          estado: 'ausente',
          dispositivoId: null,
          plantaId: empleado.plantaId || null,
        })
        registrosCreados++
      }
    }
    
    console.log(`✅ Registros diarios generados: ${registrosCreados} de ${empleadosActivos.length} empleados`)
  } catch (error) {
    console.error('❌ Error al generar registros diarios:', error)
  }
}, {
  timezone: "America/Mexico_City" // Solo timezone, sin scheduled
})

// Iniciar el job
dailyJob.start()

// Job para días laborales únicamente (Lunes a Viernes) - opcional
const workdaysJob = cron.schedule('0 6 * * 1-5', async () => {
  console.log('📋 Job de días laborales ejecutado...')
  // Puedes agregar lógica diferente aquí si necesitas
}, {
  timezone: "America/Mexico_City"
})

// Comentar esta línea si solo quieres el job diario
// workdaysJob.start()

console.log('⏰ Scheduler configurado: Registros diarios a las 6:00 AM')