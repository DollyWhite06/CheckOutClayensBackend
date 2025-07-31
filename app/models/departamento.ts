import Empleado from './empleado.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, hasMany } from '@adonisjs/lucid/orm'

export default class Departamento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion?: string | null

  @hasMany(() => Empleado)
  declare empleados: HasMany<typeof Empleado>
}