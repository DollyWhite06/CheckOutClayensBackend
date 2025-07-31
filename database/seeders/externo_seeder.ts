// database/seeders/ExternoSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Externo from '#models/externo'
import { DateTime } from 'luxon'

export default class ExternoSeeder extends BaseSeeder {
  public async run () {
    await Externo.createMany([
      {
        nombre: 'Juan Pérez',
        empresa: 'Logística MX',
        empleadoAnfitrionId: 1001,
        tipo: 'Transportista',
        motivo: 'Entrega de mercancía',
        vehiculo: true,
        identificacion: true,
        plantaId: 1,
        fecha: DateTime.now().minus({ days: 1 }).toJSDate(),
        horaEntrada: '08:30',
        horaSalida: '10:00',
        status: 'inactivo',
      },
      {
        nombre: 'Laura Gómez',
        empresa: 'Tecnologías SA',
        empleadoAnfitrionId: 1002,
        tipo: 'Proveedor',
        motivo: 'Revisión técnica',
        vehiculo: false,
        identificacion: true,
        plantaId: 2,
        fecha: DateTime.now().toJSDate(),
        horaEntrada: '09:15',
        horaSalida: null,
        status: 'activo',
      },
      {
        nombre: 'Carlos Sánchez',
        empresa: 'Consulting Pro',
        empleadoAnfitrionId: 1003,
        tipo: 'Visita',
        motivo: 'Reunión de negocios',
        vehiculo: false,
        identificacion: true,
        plantaId: 1,
        fecha: DateTime.now().minus({ days: 2 }).toJSDate(),
        horaEntrada: '11:00',
        horaSalida: '13:00',
        status: 'inactivo',
      },
      {
        nombre: 'Ana Torres',
        empresa: 'Transportes Norte',
        empleadoAnfitrionId: 1004,
        tipo: 'Transportista',
        motivo: 'Entrega urgente',
        vehiculo: true,
        identificacion: false,
        plantaId: 2,
        fecha: DateTime.now().toJSDate(),
        horaEntrada: '07:45',
        horaSalida: null,
        status: 'activo',
      }
    ])
  }
}
