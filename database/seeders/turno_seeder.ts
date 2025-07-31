import Turno from '#models/turno'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class TurnoSeeder extends BaseSeeder {
  async run () {
    await Turno.createMany([
      {
        nombre: 'Matutino',
        horaEntrada: '07:00:00',
        horaSalida: '15:00:00',
        toleranciaMinutos: 10,
      },
      {
        nombre: 'Vespertino',
        horaEntrada: '15:00:00',
        horaSalida: '23:00:00',
        toleranciaMinutos: 10,
      }
    ])
  }
}
