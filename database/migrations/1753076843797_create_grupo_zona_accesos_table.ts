import { BaseSchema } from '@adonisjs/lucid/schema'

export default class GrupoZonaAcceso extends BaseSchema {
  protected tableName = 'grupo_zona_acceso'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('grupo_id').unsigned().references('grupos.id').onDelete('CASCADE')
      table.integer('zona_id').unsigned().references('zonas.id').onDelete('CASCADE')
      table.primary(['grupo_id', 'zona_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
