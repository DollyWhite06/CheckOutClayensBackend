import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empleado from './empleado.js'
import Planta from './planta.js'

export default class Externo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare empresa: string

  @column()
  declare empleadoAnfitrionId: number

  @column()
  declare tipo: 'Proveedor' | 'Transportista' | 'Visita'

  @column()
  declare motivo?: string | null

  @column()
  declare vehiculo: boolean

  @column()
  declare identificacion: boolean

  @column()
  declare plantaId: number

  @column()
  declare fecha: Date

  @column()
  declare horaEntrada: string

  @column()
  declare horaSalida?: string | null

  @column()
  declare status: 'activo' | 'inactivo'

  @belongsTo(() => Empleado, { foreignKey: 'empleadoAnfitrionId' })
  declare empleadoAnfitrion: BelongsTo<typeof Empleado>

  @belongsTo(() => Planta)
  declare planta: BelongsTo<typeof Planta>
}
