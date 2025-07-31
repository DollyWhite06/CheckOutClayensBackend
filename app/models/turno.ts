import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Grupo from './grupo.js'

export default class Turno extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: 'Matutino' | 'Vespertino'

  @column()
  declare horaEntrada: string

  @column()
  declare horaSalida: string

  @column()
  declare toleranciaMinutos: number

  @hasMany(() => Grupo)
  declare grupos: HasMany<typeof Grupo>
}
