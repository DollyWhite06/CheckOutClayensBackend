import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Grupos extends BaseSchema {
  protected tableName = 'grupos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 50).notNullable().unique()
      table.text('descripcion')
      table.integer('turno_id').unsigned().references('turnos.id').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
