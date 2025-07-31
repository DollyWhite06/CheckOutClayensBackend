import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Grupo from '#models/grupo'

export default class GrupoSeeder extends BaseSeeder {
  async run() {
    await Grupo.createMany([
      {
        nombre:'Grupo A',
        descripcion:'Operativo',
        turnoId:1
      },
      {
        nombre:'Grupo B',
        descripcion:'Operativo',
        turnoId:1
      },
      {
        nombre:'Grupo C',
        descripcion:'Operativo',
        turnoId:2
      },
      {
        nombre:'Grupo D',
        descripcion:'Operativo',
        turnoId:2
      },
      {
        nombre:'Administrativos',
        descripcion:'Oficinas',
        turnoId:1
      },
      {
        nombre:'Ingenieria y Tecnicos Matutino',
        descripcion:'Produccion',
        turnoId:1
      },
      {
        nombre:'Ingenieria y Tecnicos Vespertino',
        descripcion:'Produccion',
        turnoId:2
      },
      {
        nombre:'Gerencia',
        descripcion:'Gerencia',
        turnoId:1
      },
    ])
  }
}