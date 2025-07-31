import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Empleados extends BaseSchema {
  protected tableName = 'empleados'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('numero').unsigned().primary()
      table.string('nombre', 50).notNullable()
      table.string('paterno', 50).notNullable()
      table.string('materno', 50)
      table.integer('grupo_id').unsigned().references('grupos.id').onDelete('CASCADE')
      table.integer('planta_id').unsigned().references('plantas.id').onDelete('CASCADE')
      table.integer('departamento_id').unsigned().notNullable().references('departamentos.id')
      table.string('rfid_uid', 100).unique()
      table.string('fingerprint_id', 100).unique()
      table.boolean('activo').defaultTo(true)
      table.date('fecha_ingreso')
      table.date('fecha_baja').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
