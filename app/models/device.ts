import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Zona from './zona.js'

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare tipo: 'rfid' | 'biometrico'

  @column()
  declare serialNumber?: string | null

  @column()
  declare zonaId: number

  @belongsTo(() => Zona)
  declare zona: BelongsTo<typeof Zona>
}
