import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AccessLogs extends BaseSchema {
  protected tableName = 'access_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('empleado_id').unsigned().references('empleados.numero').onDelete('CASCADE')
      table.integer('device_id').unsigned().references('devices.id').onDelete('CASCADE')
      table.boolean('acceso_concedido').notNullable()
      table.timestamp('fecha_hora', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
