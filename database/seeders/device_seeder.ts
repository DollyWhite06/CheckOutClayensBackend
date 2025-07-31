import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Device from '#models/device'

export default class DeviceSeeder extends BaseSeeder {
  async run () {
    await Device.createMany([
      {
        nombre: 'Lector RFID Entrada Principal p1',
        tipo: 'rfid',
        serialNumber: 'RFID-001',
        zonaId: 7,
      },
      {
        nombre: 'Lector Biométrico Oficinas p1',
        tipo: 'biometrico',
        serialNumber: 'BIO-001',
        zonaId: 2,
      },
      {
        nombre: 'Lector RFID Produccion p1',
        tipo: 'rfid',
        serialNumber: 'RFID-002',
        zonaId: 3,
      },
      {
        nombre: 'Lector Biométrico Oficinas p2',
        tipo: 'biometrico',
        serialNumber: 'BIO-002',
        zonaId: 4,
      },
      {
        nombre: 'Lector RFID Entrada Planta 2',
        tipo: 'rfid',
        serialNumber: 'RFID-003',
        zonaId: 8,
      },
      {
        nombre: 'Lector RFID Produccion p2',
        tipo: 'rfid',
        serialNumber: 'RFID-004',
        zonaId: 5,
      },
    ])
  }
}
