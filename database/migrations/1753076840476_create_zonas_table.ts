import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Zonas extends BaseSchema {
  protected tableName = 'zonas'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 50).notNullable()
      table.integer('planta_id').unsigned().references('plantas.id').onDelete('CASCADE')
      table.boolean('acceso_requerido').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
