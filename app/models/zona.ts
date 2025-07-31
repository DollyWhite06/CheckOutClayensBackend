import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm' 
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations';
import Planta from './planta.js'
import Device from './device.js'
import GrupoZonaAcceso from './grupo_zona_acceso.js'

export default class Zona extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare plantaId: number

  @column()
  declare accesoRequerido: boolean

  @belongsTo(() => Planta)
  declare planta: BelongsTo<typeof Planta>

  @hasMany(() => Device)
  declare devices: HasMany<typeof Device>

  @hasMany(() => GrupoZonaAcceso)
  declare grupoZonaAcceso: HasMany<typeof GrupoZonaAcceso>
}
