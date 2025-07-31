import { BaseSchema } from '@adonisjs/lucid/schema'

export default class TarjetasRfid extends BaseSchema {
  protected tableName = 'tarjetas_rfid'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uid').unique().notNullable()
      table.boolean('activa').defaultTo(true) 
      table
        .integer('empleado_id')
        .unsigned()
        .references('id')
        .inTable('empleados')
        .onDelete('SET NULL')
        .nullable()
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}