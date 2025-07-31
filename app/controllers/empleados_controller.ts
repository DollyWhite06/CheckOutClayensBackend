// app/controllers/empleados_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import Empleado from '#models/empleado'
import Grupo from '#models/grupo' // Asumiendo que tienes estos modelos
import Planta from '#models/planta'
import Departamento from '#models/departamento'
import { DateTime } from 'luxon'
import { 
  createEmpleadoValidator, 
  updateEmpleadoValidator, 
  findByRfidValidator 
} from '#validators/empleado_validator'
import EmpleadoException from '#exceptions/empleados_exception'

export default class EmpleadosController {
  /**
   * Listar empleados con paginación
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 100)
    const search = request.input('search', '')
    const activo = request.input('activo')

    const query = Empleado.query()
      .preload('grupo')
      .preload('planta')
      .preload('departamento')

    // Filtro por estado activo
    if (activo !== undefined && activo !== null && activo !== '') {
      const isActive = activo === 'true' || activo === '1' || activo === 1
      query.where('activo', isActive)
    }

    // Filtro por búsqueda
    if (search) {
      query.where((builder) => {
        builder
          .where('nombre', 'like', `%${search}%`)
          .orWhere('paterno', 'like', `%${search}%`)
          .orWhere('materno', 'like', `%${search}%`)
          .orWhere('numero', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`)
      })
    }

    const empleados = await query.orderBy('numero', 'asc').paginate(page, perPage)

    return response.ok({
      status: 'success',
      data: empleados
    })
  }

  /**
   * Crear nuevo empleado
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createEmpleadoValidator)

    // Validar que el número de empleado no exista
    const existingEmpleado = await Empleado.findBy('numero', payload.numero)
    if (existingEmpleado) {
      throw EmpleadoException.numeroEmpleadoExists()
    }

    // Validar que el RFID no esté en uso
    if (payload.rfidUid) {
      const rfidExists = await Empleado.findBy('rfidUid', payload.rfidUid)
      if (rfidExists) {
        throw EmpleadoException.rfidUidAlreadyExists()
      }
    }

    // Validar que las relaciones existan
    if (payload.grupoId) {
      const grupo = await Grupo.find(payload.grupoId)
      if (!grupo) {
        throw EmpleadoException.grupoNotFound()
      }
    }

    if (payload.plantaId) {
      const planta = await Planta.find(payload.plantaId)
      if (!planta) {
        throw EmpleadoException.plantaNotFound()
      }
    }

    if (payload.departamentoId) {
      const departamento = await Departamento.find(payload.departamentoId)
      if (!departamento) {
        throw EmpleadoException.departamentoNotFound()
      }
    }

    // Validar rango de fechas
    if (payload.fecha_ingreso && payload.fecha_baja) {
      const fechaIngreso = DateTime.fromJSDate(payload.fecha_ingreso)
      const fechaBaja = DateTime.fromJSDate(payload.fecha_baja)
      
      if (fechaBaja < fechaIngreso) {
        throw EmpleadoException.invalidDateRange()
      }
    }

    // Preparar datos para creación
    const empleadoData = {
      ...payload,
      fecha_ingreso: payload.fecha_ingreso ? DateTime.fromJSDate(payload.fecha_ingreso) : undefined,
      fecha_baja: payload.fecha_baja ? DateTime.fromJSDate(payload.fecha_baja) : undefined,
      activo: payload.activo ?? true
    }

    const empleado = await Empleado.create(empleadoData)

    // Cargar relaciones
    await empleado.load('grupo')
    await empleado.load('planta')
    await empleado.load('departamento')

    return response.created({
      status: 'success',
      message: 'Empleado creado exitosamente',
      data: empleado
    })
  }

  /**
   * Mostrar detalles de empleado
   */
  async show({ params, response }: HttpContext) {
    const empleado = await Empleado.query()
      .where('numero', params.id)
      .preload('grupo')
      .preload('planta')
      .preload('departamento')
      .first()

    if (!empleado) {
      throw EmpleadoException.empleadoNotFound()
    }

    return response.ok({
      status: 'success',
      data: empleado
    })
  }

  /**
   * Actualizar empleado
   */
  async update({ params, request, response }: HttpContext) {
    const empleado = await Empleado.findBy('numero', params.id)
    if (!empleado) {
      throw EmpleadoException.empleadoNotFound()
    }

    const payload = await request.validateUsing(updateEmpleadoValidator)

    // Validar número de empleado único si se está cambiando
    if (payload.numero && payload.numero !== empleado.numero) {
      const existingEmpleado = await Empleado.findBy('numero', payload.numero)
      if (existingEmpleado) {
        throw EmpleadoException.numeroEmpleadoExists()
      }
    }

    // Validar RFID único si se está cambiando
    if (payload.rfidUid !== undefined && payload.rfidUid !== empleado.rfidUid) {
      if (payload.rfidUid) {
        const rfidExists = await Empleado.query()
          .where('rfidUid', payload.rfidUid)
          .whereNot('numero', empleado.numero)
          .first()
        
        if (rfidExists) {
          throw EmpleadoException.rfidUidAlreadyExists()
        }
      }
    }

    // Validar que las relaciones existan
    if (payload.grupoId) {
      const grupo = await Grupo.find(payload.grupoId)
      if (!grupo) {
        throw EmpleadoException.grupoNotFound()
      }
    }

    if (payload.plantaId) {
      const planta = await Planta.find(payload.plantaId)
      if (!planta) {
        throw EmpleadoException.plantaNotFound()
      }
    }

    if (payload.departamentoId) {
      const departamento = await Departamento.find(payload.departamentoId)
      if (!departamento) {
        throw EmpleadoException.departamentoNotFound()
      }
    }

    // Validar rango de fechas
    const fechaIngreso = payload.fecha_ingreso ? 
      DateTime.fromJSDate(payload.fecha_ingreso) : empleado.fecha_ingreso
    const fechaBaja = payload.fecha_baja ? 
      DateTime.fromJSDate(payload.fecha_baja) : empleado.fecha_baja

    if (fechaIngreso && fechaBaja && fechaBaja < fechaIngreso) {
      throw EmpleadoException.invalidDateRange()
    }

    // Preparar datos para actualización, filtrando valores null excepto para campos específicos
    const updateData: any = {}
    
    // Campos que pueden ser null explícitamente
    const nullableFields = ['rfidUid', 'grupoId', 'plantaId', 'departamentoId', 'materno', 'email', 'telefono', 'observaciones']
    
    // Solo agregar campos que no sean undefined
    Object.keys(payload).forEach(key => {
      const value = payload[key as keyof typeof payload]
      if (value !== undefined) {
        // Si es un campo que puede ser null, lo permitimos
        if (nullableFields.includes(key) || value !== null) {
          updateData[key] = value
        }
      }
    })

    // Manejar fechas específicamente
    if (payload.fecha_ingreso) {
      updateData.fecha_ingreso = DateTime.fromJSDate(payload.fecha_ingreso)
    }
    
    if (payload.fecha_baja) {
      updateData.fecha_baja = DateTime.fromJSDate(payload.fecha_baja)
    }

    empleado.merge(updateData)
    await empleado.save()

    // Cargar relaciones
    await empleado.load('grupo')
    await empleado.load('planta')
    await empleado.load('departamento')

    return response.ok({
      status: 'success',
      message: 'Empleado actualizado exitosamente',
      data: empleado
    })
  }

  /**
   * Dar de baja a empleado (baja lógica)
   */
  async deactivate({ params, response }: HttpContext) {
    const empleado = await Empleado.findBy('numero', params.id)
    if (!empleado) {
      throw EmpleadoException.empleadoNotFound()
    }

    if (!empleado.activo) {
      throw EmpleadoException.empleadoAlreadyInactive()
    }

    empleado.activo = false
    empleado.fecha_baja = DateTime.now()

    await empleado.save()

    return response.ok({
      status: 'success',
      message: 'Empleado desactivado exitosamente',
      data: {
        numero: empleado.numero,
        activo: empleado.activo,
        fecha_baja: empleado.fecha_baja
      }
    })
  }

  /**
   * Reactivar empleado
   */
  async activate({ params, response }: HttpContext) {
    const empleado = await Empleado.findBy('numero', params.id)
    if (!empleado) {
      throw EmpleadoException.empleadoNotFound()
    }

    if (empleado.activo) {
      return response.badRequest({
        status: 'error',
        message: 'El empleado ya está activo'
      })
    }

    empleado.activo = true
    empleado.fecha_baja = null

    await empleado.save()

    return response.ok({
      status: 'success',
      message: 'Empleado reactivado exitosamente',
      data: {
        numero: empleado.numero,
        activo: empleado.activo,
        fecha_baja: empleado.fecha_baja
      }
    })
  }

  /**
   * Buscar empleado por RFID
   */
  async findByRfid({ request, response }: HttpContext) {
    const payload = await request.validateUsing(findByRfidValidator)

    const empleado = await Empleado.query()
      .where('rfidUid', payload.rfid)
      .where('activo', true) // Solo empleados activos
      .preload('grupo')
      .preload('planta')
      .preload('departamento')
      .first()

    if (!empleado) {
      throw EmpleadoException.empleadoByRfidNotFound()
    }

    return response.ok({
      status: 'success',
      data: empleado
    })
  }

  /**
   * Eliminar empleado (eliminación física - usar con precaución)
   */
  async destroy({ params, response }: HttpContext) {
    const empleado = await Empleado.findBy('numero', params.id)
    if (!empleado) {
      throw EmpleadoException.empleadoNotFound()
    }

    await empleado.delete()

    return response.ok({
      status: 'success',
      message: 'Empleado eliminado permanentemente'
    })
  }
}