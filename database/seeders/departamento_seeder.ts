import Departamento from '#models/departamento'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class DepartamentoSeeder extends BaseSeeder {
  async run () {
    await Departamento.createMany([
  
      {
        nombre: 'Higiene y Seguridad',
        descripcion: 'Departamento de seguirdad',
      },
      {
        nombre: 'Recursos Humanos',
        descripcion: 'Gestiona el personal y procesos laborales',
      },
      {
        nombre: 'IT',
        descripcion: 'Infraestructura, soporte y desarrollo de sistemas',
      },
      {
        nombre: 'Ventas y Contabilidad',
        descripcion: 'Departamento contable',
      },
      {
        nombre: 'Customer Service',
        descripcion: 'Atencion al cliente',
      },
      {
        nombre: 'Procesos Industriales',
        descripcion: 'Ingenieria y tecnicos de inyeccion',
      },
      {
        nombre: 'Moldes',
        descripcion: 'Ingenieria de moldes',
      },
      {
        nombre: 'Mantenimiento',
        descripcion: 'Mantenimiento de planta',
      },
      {
        nombre: 'Gerencia',
        descripcion: 'Gerencia de planta',
      },
    ])
  }
}
