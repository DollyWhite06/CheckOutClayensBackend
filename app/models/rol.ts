import type { HasMany } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, hasMany } from '@adonisjs/lucid/orm'
import Usuario from './usuario.js'

export default class Rol extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tipo: 'Admin' | 'Gerencia' | 'RH' | 'HSE' | 'Caseta'

  @hasMany(() => Usuario)
  declare usuarios: HasMany<typeof Usuario>
}
