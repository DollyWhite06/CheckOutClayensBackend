import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Empleado from './empleado.js'
import Device from './device.js'
import Planta from './planta.js'

export default class AttendanceLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare empleadoId: number

  @column.dateTime()
  declare fecha: DateTime | null

  @column.dateTime()
  declare entrada: DateTime | null

  @column.dateTime()
  declare salida: DateTime | null

  @column()
  declare dispositivoId: number | null

  @column()
  declare estado: 'presente' | 'ausente' | 'retardo' | 'permiso'

  @column()
  declare plantaId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Empleado)
  declare empleado: BelongsTo<typeof Empleado>

  @belongsTo(() => Device)
  declare dispositivo: BelongsTo<typeof Device>

  @belongsTo(() => Planta)
  declare planta: BelongsTo<typeof Planta>
}