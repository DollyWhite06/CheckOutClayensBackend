import { BaseSeeder } from '@adonisjs/lucid/seeders'
import GrupoZonaAcceso from '#models/grupo_zona_acceso'

export default class GrupoZonaAccesoSeeder extends BaseSeeder {
  async run () {
    await GrupoZonaAcceso.createMany([
      {
        grupoId: 1,
        zonaId: 3,
      },
      {
        grupoId: 2,
        zonaId: 5,
      },
      {
        grupoId: 3,
        zonaId: 3,
      },
      {
        grupoId: 4,
        zonaId: 5,
      },
      {
        grupoId: 5,
        zonaId: 2,
      },
      {
        grupoId: 5,
        zonaId: 4,
      },
      {
        grupoId: 6,
        zonaId: 3
      },
      {
        grupoId: 7,
        zonaId: 2,
      },
      {
        grupoId: 8,
        zonaId: 2,
      },
       {
        grupoId: 8,
        zonaId: 3,
      },
       {
        grupoId: 8,
        zonaId: 4,
      },
      {
        grupoId: 8,
        zonaId: 5,
      },
       {
        grupoId: 8,
        zonaId: 6,
      },
    ])
  }
}
