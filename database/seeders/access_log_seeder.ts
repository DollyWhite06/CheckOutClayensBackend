import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import AccessLog from '#models/access_log'

export default class AccessLogSeeder extends BaseSeeder {
  public async run () {
    await AccessLog.createMany([
      {
        empleadoId: 1001,
        deviceId: 4,
        accesoConcedido: true,
        fechaHora: DateTime.now().minus({ minutes: 10 }).toJSDate(),
      },
      {
        empleadoId: 1002,
        deviceId: 5,
        accesoConcedido: true,
        fechaHora: DateTime.now().minus({ hours: 1 }).toJSDate(),
      },
      {
        empleadoId: 1003,
        deviceId: 4,
        accesoConcedido: false,
        fechaHora: DateTime.now().minus({ hours: 2 }).toJSDate(),
      },
      {
        empleadoId: 1004,
        deviceId: 6,
        accesoConcedido: true,
        fechaHora: DateTime.now().minus({ days: 1 }).toJSDate(),
      },
      {
        empleadoId: 1005,
        deviceId: 7,
        accesoConcedido: false,
        fechaHora: DateTime.now().minus({ days: 2 }).toJSDate(),
      },
      {
        empleadoId: 1006,
        deviceId: 5,
        accesoConcedido: true,
        fechaHora: DateTime.now().minus({ minutes: 30 }).toJSDate(),
      },
    ])
  }
}
