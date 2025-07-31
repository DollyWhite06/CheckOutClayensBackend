import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Devices extends BaseSchema {
  protected tableName = 'devices'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 100).notNullable()
      table.enum('tipo', ['rfid', 'biometrico']).notNullable()
      table.string('serial_number', 100).unique()
      table.integer('zona_id').unsigned().references('zonas.id').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
