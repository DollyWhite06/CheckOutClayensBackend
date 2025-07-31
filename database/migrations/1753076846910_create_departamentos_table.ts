import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Departamentos extends BaseSchema {
  protected tableName = 'departamentos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 100).notNullable().unique()
      table.text('descripcion')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
