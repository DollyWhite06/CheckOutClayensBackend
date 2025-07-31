import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Turnos extends BaseSchema {
  protected tableName = 'turnos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('nombre', ['Matutino', 'Vespertino']).notNullable()
      table.time('hora_entrada').notNullable()
      table.time('hora_salida').notNullable()
      table.integer('tolerancia_minutos').defaultTo(15)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
