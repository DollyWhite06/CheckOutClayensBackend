import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Externos extends BaseSchema {
  protected tableName = 'externos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 100).notNullable()
      table.string('empresa', 100).notNullable()
      table.integer('empleado_anfitrion_id').unsigned().references('empleados.numero').onDelete('CASCADE')
      table.enum('tipo', ['Proveedor', 'Transportista', 'Visita']).notNullable()
      table.text('motivo')
      table.boolean('vehiculo').defaultTo(false)
      table.boolean('identificacion').defaultTo(false)
      table.integer('planta_id').unsigned().references('plantas.id')
      table.date('fecha').notNullable()
      table.time('hora_entrada').notNullable()
      table.time('hora_salida')
      table.enum('status', ['activo', 'inactivo']).defaultTo('activo')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
