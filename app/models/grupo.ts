import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Turno from './turno.js'
import Empleado from './empleado.js'
import GrupoZonaAcceso from './grupo_zona_acceso.js'

export default class Grupo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion?: string | null

  @column()
  declare turnoId: number

  @belongsTo(() => Turno)
  declare turno: BelongsTo<typeof Turno>

  @hasMany(() => Empleado)
  declare empleados: HasMany<typeof Empleado>

  @hasMany(() => GrupoZonaAcceso)
  declare grupoZonaAcceso: HasMany<typeof GrupoZonaAcceso>
}
