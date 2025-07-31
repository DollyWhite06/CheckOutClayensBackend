// app/controllers/tarjetas_rfids_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import TarjetaRfid from '#models/tarjeta_rfid'
import Empleado from '#models/empleado'
import RfidException from '#exceptions/rfid_exception'
import { 
  createTarjetaRfidValidator, 
  updateTarjetaRfidValidator,
  asignarTarjetaValidator 
} from '#validators/rfid_validator'

export default class TarjetasRfidsController {
  
  /**
   * Listar tarjetas RFID con paginación y filtros
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 100)
    const search = request.input('search', '')
    const activo = request.input('activo')

    const query = TarjetaRfid.query().preload('empleado')

    // Filtro por búsqueda (UID o número de empleado)
    if (search) {
      query.where((builder) => {
        builder
          .where('uid', 'like', `%${search}%`)
          .orWhere('empleado_numero', 'like', `%${search}%`)
      })
    }

    // Filtro por estado activo
    if (activo !== undefined && activo !== null && activo !== '') {
      const isActive = activo === 'true' || activo === '1' || activo === 1
      query.where('activa', isActive)
    }

    // Ordenar por fecha de creación descendente
    query.orderBy('created_at', 'desc')

    const tarjetas = await query.paginate(page, perPage)

    return response.ok({
      status: 'success',
      data: tarjetas
    })
  }

  /**
   * Mostrar una tarjeta RFID específica
   */
  async show({ params, response }: HttpContext) {
    const tarjeta = await TarjetaRfid.query()
      .where('id', params.id)
      .preload('empleado')
      .first()

    if (!tarjeta) {
      throw RfidException.tarjetaNotFound()
    }

    return response.ok({
      status: 'success',
      data: tarjeta
    })
  }

  /**
   * Crear una nueva tarjeta RFID
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTarjetaRfidValidator)

    // Verificar que el UID no exista
    const existingCard = await TarjetaRfid.findBy('uid', payload.uid)
    if (existingCard) {
      throw RfidException.uidAlreadyExists()
    }

    // Si se especifica un empleado, verificar que exista
    if (payload.empleadoNumero) {
      const empleado = await Empleado.findBy('numero', payload.empleadoNumero)
      if (!empleado) {
        throw RfidException.empleadoNotFound()
      }

      // Verificar que el empleado no tenga ya una tarjeta activa
      const tarjetaEmpleado = await TarjetaRfid.query()
        .where('empleado_numero', payload.empleadoNumero)
        .where('activa', true)
        .first()

      if (tarjetaEmpleado) {
        throw RfidException.tarjetaYaAsignada()
      }
    }

    const tarjeta = await TarjetaRfid.create({
      uid: payload.uid,
      activa: payload.activa ?? true,
      empleadoNumero: payload.empleadoNumero || null
    })

    // Cargar la relación para la respuesta
    await tarjeta.load('empleado')

    return response.created({
      status: 'success',
      message: 'Tarjeta RFID creada exitosamente',
      data: tarjeta
    })
  }

  /**
   * Actualizar una tarjeta RFID
   */
  async update({ params, request, response }: HttpContext) {
    const tarjeta = await TarjetaRfid.find(params.id)
    if (!tarjeta) {
      throw RfidException.tarjetaNotFound()
    }

    const payload = await request.validateUsing(updateTarjetaRfidValidator)

    // Si se está actualizando el UID, verificar que no exista
    if (payload.uid && payload.uid !== tarjeta.uid) {
      const existingCard = await TarjetaRfid.findBy('uid', payload.uid)
      if (existingCard) {
        throw RfidException.uidAlreadyExists()
      }
    }

    // Si se especifica un empleado, verificar que exista
    if (payload.empleadoNumero) {
      const empleado = await Empleado.findBy('numero', payload.empleadoNumero)
      if (!empleado) {
        throw RfidException.empleadoNotFound()
      }

      // Verificar que el empleado no tenga ya otra tarjeta activa
      const tarjetaEmpleado = await TarjetaRfid.query()
        .where('empleado_numero', payload.empleadoNumero)
        .where('activa', true)
        .whereNot('id', tarjeta.id)
        .first()

      if (tarjetaEmpleado) {
        throw RfidException.tarjetaYaAsignada()
      }
    }

    // Actualizar los campos
    if (payload.uid) tarjeta.uid = payload.uid
    if (payload.activa !== undefined) tarjeta.activa = payload.activa
    if (payload.empleadoNumero !== undefined) {
      tarjeta.empleadoNumero = payload.empleadoNumero
    }

    await tarjeta.save()
    await tarjeta.load('empleado')

    return response.ok({
      status: 'success',
      message: 'Tarjeta RFID actualizada exitosamente',
      data: tarjeta
    })
  }

  /**
   * Asignar tarjeta a un empleado
   */
  async asignar({ params, request, response }: HttpContext) {
    const tarjeta = await TarjetaRfid.find(params.id)
    if (!tarjeta) {
      throw RfidException.tarjetaNotFound()
    }

    if (!tarjeta.activa) {
      throw RfidException.tarjetaInactiva()
    }

    const payload = await request.validateUsing(asignarTarjetaValidator)

    // Verificar que el empleado exista
    const empleado = await Empleado.findBy('numero', payload.empleadoNumero)
    if (!empleado) {
      throw RfidException.empleadoNotFound()
    }

    // Verificar que el empleado no tenga ya una tarjeta activa
    const tarjetaEmpleado = await TarjetaRfid.query()
      .where('empleado_numero', payload.empleadoNumero)
      .where('activa', true)
      .whereNot('id', tarjeta.id)
      .first()

    if (tarjetaEmpleado) {
      throw RfidException.tarjetaYaAsignada()
    }

    tarjeta.empleadoNumero = payload.empleadoNumero
    await tarjeta.save()
    await tarjeta.load('empleado')

    return response.ok({
      status: 'success',
      message: 'Tarjeta asignada exitosamente',
      data: tarjeta
    })
  }

  /**
   * Desasignar tarjeta de un empleado
   */
  async desasignar({ params, response }: HttpContext) {
    const tarjeta = await TarjetaRfid.find(params.id)
    if (!tarjeta) {
      throw RfidException.tarjetaNotFound()
    }

    tarjeta.empleadoNumero = null
    await tarjeta.save()

    return response.ok({
      status: 'success',
      message: 'Tarjeta desasignada exitosamente',
      data: tarjeta
    })
  }

  /**
   * Activar/desactivar una tarjeta
   */
  async toggleEstado({ params, response }: HttpContext) {
    const tarjeta = await TarjetaRfid.find(params.id)
    if (!tarjeta) {
      throw RfidException.tarjetaNotFound()
    }

    tarjeta.activa = !tarjeta.activa
    await tarjeta.save()
    await tarjeta.load('empleado')

    return response.ok({
      status: 'success',
      message: `Tarjeta ${tarjeta.activa ? 'activada' : 'desactivada'} exitosamente`,
      data: tarjeta
    })
  }

  /**
   * Eliminar una tarjeta RFID
   */
  async destroy({ params, response }: HttpContext) {
    const tarjeta = await TarjetaRfid.find(params.id)
    if (!tarjeta) {
      throw RfidException.tarjetaNotFound()
    }

    await tarjeta.delete()

    return response.ok({
      status: 'success',
      message: 'Tarjeta RFID eliminada exitosamente'
    })
  }

  /**
   * Buscar tarjeta por UID (útil para lectores RFID)
   */
  async buscarPorUid({ params, response }: HttpContext) {
    const tarjeta = await TarjetaRfid.query()
      .where('uid', params.uid.toUpperCase())
      .preload('empleado')
      .first()

    if (!tarjeta) {
      throw RfidException.tarjetaNotFound()
    }

    if (!tarjeta.activa) {
      throw RfidException.tarjetaInactiva()
    }

    return response.ok({
      status: 'success',
      data: tarjeta
    })
  }
}