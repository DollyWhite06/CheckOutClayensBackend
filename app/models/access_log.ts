import { BaseModel, column, belongsTo} from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empleado from './empleado.js'
import Device from './device.js'

export default class AccessLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare empleadoId: number

  @column()
  declare deviceId: number

  @column()
  declare accesoConcedido: boolean

  @column()
  declare fechaHora: Date

  @belongsTo(() => Empleado)
  declare empleado: BelongsTo<typeof Empleado>

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>
}
