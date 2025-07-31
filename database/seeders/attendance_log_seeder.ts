import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import AttendanceLog from '#models/attendance_log'

export default class AttendanceLogSeeder extends BaseSeeder {
  async run() {
    const today = DateTime.now().toJSDate()

    await AttendanceLog.createMany([
      {
        empleadoId: 1001,
        fecha: today,
        entrada: '08:02:00',
        salida: '16:00:00',
        dispositivoId: 4,
        estado: 'retardo',
        plantaId: 1,
      },
      {
        empleadoId: 1002,
        fecha: today,
        entrada: '07:55:00',
        salida: '16:05:00',
        dispositivoId: 5,
        estado: 'presente',
        plantaId: 1,
      },
      {
        empleadoId: 1003,
        fecha: today,
        entrada: null,
        salida: null,
        dispositivoId: null,
        estado: 'ausente',
        plantaId: 1,
      },
      {
        empleadoId: 1004,
        fecha: today,
        entrada: '08:00:00',
        salida: '15:50:00',
        dispositivoId: 6,
        estado: 'presente',
        plantaId: 2,
      },
      {
        empleadoId: 1005,
        fecha: today,
        entrada: null,
        salida: null,
        dispositivoId: null,
        estado: 'permiso',
        plantaId: 1,
      },
      {
        empleadoId: 1006,
        fecha: today,
        entrada: '08:20:00',
        salida: '16:10:00',
        dispositivoId: 7,
        estado: 'retardo',
        plantaId: 2,
      },
    ])
  }
}
