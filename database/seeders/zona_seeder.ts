import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Zona from '#models/zona'

export default class ZonaSeeder extends BaseSeeder {
  async run() {
    await Zona.createMany ([
      {
        nombre:'Oficinas planta 1',
        plantaId:1,
        accesoRequerido:true
      },
      {
        nombre:'Produccion planta 1',
        plantaId:1,
        accesoRequerido:true
      },
      {
        nombre:'Oficinas planta 2',
        plantaId:2,
        accesoRequerido:true
      },
      {
        nombre:'Produccion planta 2',
        plantaId:2,
        accesoRequerido:true
      },
      {
        nombre:'Sala Blanca',
        plantaId:1,
        accesoRequerido:true
      },
      {
        nombre:'Entrada p1',
        plantaId:1,
        accesoRequerido:true
      },
      {
        nombre:'Entrada p2',
        plantaId:2,
        accesoRequerido:true
      },
    ])
  }
}