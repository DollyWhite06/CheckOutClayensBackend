import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Planta from '#models/planta'

export default class PlantaSeeder extends BaseSeeder {
  async run() {
    await Planta.createMany([
      {
        planta: 'Planta 1'
      },
      {
        planta: 'Planta 2'
      }
    ])
  }
}