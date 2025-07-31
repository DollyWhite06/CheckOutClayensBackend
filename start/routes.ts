import router from '@adonisjs/core/services/router'
import UsersController from '#controllers/users_controller'
import EmpleadosController from '#controllers/empleados_controller'
import TarjetasRfidsController from '#controllers/tarjetas_rfids_controller'
import { middleware } from './kernel.js'
import AttendanceController from '#controllers/attendance_logs_controller'

router.group(() => {
  router.post('/register', [UsersController, 'register'])
  router.post('/login', [UsersController, 'login'])
  router.post('/refresh-token', [UsersController, 'refreshToken'])
  router.get('/profile',[UsersController, 'profile']).use(middleware.auth({guards: ['jwt']}))
}).prefix('/api')

// Rutas para empleados
router.group(() => {
  // Listar todos los empleados con paginación y filtros
  router.get('/empleados', [EmpleadosController, 'index'])
  
  // Crear un nuevo empleado
  router.post('/empleados', [EmpleadosController, 'store'])
  
    // Buscar empleado por RFID (colocar antes de /:id para evitar conflictos)
    //router.get('/empleados/rfid', [EmpleadosController, 'findByRfid'])
  
  // Obtener un empleado específico por número
  router.get('/empleados/:id', [EmpleadosController, 'show'])
  
  // Actualizar un empleado existente
  router.put('/empleados/:id', [EmpleadosController, 'update'])
  
  // Dar de baja a un empleado (desactivar)
  router.post('/empleados/:id/deactivate', [EmpleadosController, 'deactivate'])
  
  // Reactivar un empleado
  router.post('/empleados/:id/activate', [EmpleadosController, 'activate'])
  
  // Eliminar empleado permanentemente (usar con precaución)
  router.delete('/empleados/:id', [EmpleadosController, 'destroy'])
  
}).prefix('/api').use(middleware.auth({ guards: ['jwt'] }))


//TARJETAS RFID
router.group(() => {
  // Listar todas las tarjetas RFID con paginación y filtros
  router.get('/tarjetasRfid', [TarjetasRfidsController, 'index'])
  
  // Crear una nueva tarjeta RFID
  router.post('/tarjetasRfid', [TarjetasRfidsController, 'store'])
  
  // Obtener una tarjeta RFID específica por ID
  router.get('/tarjetasRfid/:id', [TarjetasRfidsController, 'show'])
  
  // Actualizar una tarjeta RFID existente
  router.put('/tarjetasRfid/:id', [TarjetasRfidsController, 'update'])
  
  // Eliminar una tarjeta RFID
  router.delete('/tarjetasRfid/:id', [TarjetasRfidsController, 'destroy'])
  
  // Asignar una tarjeta RFID a un empleado
  router.post('/tarjetasRfid/:id/asignar', [TarjetasRfidsController, 'asignar'])
  
  // Desasignar una tarjeta RFID de un empleado
  router.post('/tarjetasRfid/:id/desasignar', [TarjetasRfidsController, 'desasignar'])
  
  // Alternar el estado activo/inactivo de una tarjeta RFID
  router.post('/tarjetasRfid/:id/toggle-estado', [TarjetasRfidsController, 'toggleEstado'])
  
  // Buscar tarjeta RFID por UID (endpoint para lectores RFID)
  router.get('/tarjetasRfid/uid/:uid', [TarjetasRfidsController, 'buscarPorUid'])
  
}).prefix('/api').use(middleware.auth({ guards: ['jwt'] }))

//ASISTENCIA
router.group(() => {
  // Registrar entrada o salida mediante lector biométrico
  router.post('/attendance/register-biometric', [AttendanceController, 'registerBiometric'])

  // Crear un registro manual de asistencia
  router.post('/attendance', [AttendanceController, 'create'])

  // Listar registros de asistencia con paginación y filtros (empleado_id, planta_id, fecha, etc.)
  router.get('/attendance', [AttendanceController, 'index'])

  // Obtener un registro de asistencia específico por ID
  router.get('/attendance/:id', [AttendanceController, 'show'])

  // Actualizar un registro de asistencia existente
  router.patch('/attendance/:id', [AttendanceController, 'update'])

  // Eliminar un registro de asistencia
  router.delete('/attendance/:id', [AttendanceController, 'destroy'])

  // Generar reporte de asistencia con filtros (fecha_inicio, fecha_fin, empleado_id, planta_id, etc.)
  router.get('/attendance/report', [AttendanceController, 'generateReport'])

  // Obtener porcentajes de asistencia agrupados por empleado, departamento o planta
  router.get('/attendance/percentages', [AttendanceController, 'getAttendancePercentages'])

  // Obtener reporte diario de asistencia para una fecha específica
  router.get('/attendance/daily-report', [AttendanceController, 'getDailyReport'])

  // Listar empleados ausentes hoy con filtros opcionales (planta_id, departamento_id)
  router.get('/attendance/ausentes-hoy', [AttendanceController, 'getAusentesHoy'])

  // Listar empleados presentes hoy con filtros opcionales (planta_id, departamento_id)
  router.get('/attendance/presentes-hoy', [AttendanceController, 'getPresentesHoy'])

  // Crear registros de ausencia para empleados faltantes en una fecha específica
  router.post('/attendance/crear-ausencias', [AttendanceController, 'crearRegistrosAusencia'])

  // Obtener estadísticas de asistencia por grupo (planta, departamento) para una fecha
  router.get('/attendance/estadisticas-grupo', [AttendanceController, 'getEstadisticasPorGrupo'])

  // Listar empleados sin método biométrico configurado con filtros opcionales
  router.get('/attendance/sin-biometrico', [AttendanceController, 'getEmpleadosSinBiometrico'])

  // Obtener ausencias críticas (más de 2 días consecutivos) para una fecha
  router.get('/attendance/ausencias-criticas', [AttendanceController, 'getAusenciasCriticas'])
}).prefix('/api').use(middleware.auth({ guards: ['jwt'] }))