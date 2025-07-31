import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'usuarios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 50).notNullable()
      table.string('apellido', 50).notNullable()
      table.string('usuario', 8).notNullable().unique()
      table.string('email', 100).notNullable().unique() // <- Campo agregado
      table.string('password', 255).notNullable()
      table.boolean('estado').notNullable().defaultTo(true)
      table
        .integer('rol_id')
        .unsigned()
        .references('roles.id')
        .onDelete('SET NULL')
        .defaultTo(3)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
