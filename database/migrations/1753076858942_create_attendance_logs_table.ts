import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AttendanceLogs extends BaseSchema {
  protected tableName = 'attendance_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('empleado_id').unsigned().references('empleados.numero').onDelete('CASCADE')
      table.date('fecha').notNullable()
      table.time('entrada')
      table.time('salida')
      table.integer('dispositivo_id').unsigned().references('devices.id')
      table.enum('estado', ['presente', 'ausente', 'retardo', 'permiso']).defaultTo('ausente')
      table.integer('planta_id').unsigned().nullable().references('plantas.id')
      table.index(['fecha'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
