import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Zona from './zona.js'
import Empleado from './empleado.js'
import AttendanceLog from './attendance_log.js'
import Externo from './externo.js'

export default class Planta extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare planta: string

  @hasMany(() => Zona)
  declare zonas: HasMany<typeof Zona>

  @hasMany(() => Empleado)
  declare empleados: HasMany<typeof Empleado>

  @hasMany(() => AttendanceLog)
  declare attendanceLogs: HasMany<typeof AttendanceLog>

  @hasMany(() => Externo)
  declare externos: HasMany<typeof Externo>
}
