import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Grupo from './grupo.js'
import Planta from './planta.js'
import Departamento from './departamento.js'
import { DateTime } from 'luxon'

export default class Empleado extends BaseModel {
  @column({ isPrimary: true })
  declare numero: number

  @column()
  declare nombre: string

  @column()
  declare paterno: string

  @column()
  declare materno?: string | null

  @column()
  declare grupoId: number

  @column()
  declare plantaId: number

  @column()
  declare departamentoId: number

  @column()
  declare rfidUid?: string | null

  @column()
  declare fingerprintId?: string | null

  @column()
  declare activo: boolean


  @column.dateTime()
  declare fecha_ingreso: DateTime | null

  @column.dateTime()
  declare fecha_baja: DateTime | null

  @belongsTo(() => Grupo)
  declare grupo: BelongsTo<typeof Grupo>

  @belongsTo(() => Planta)
  declare planta: BelongsTo<typeof Planta>

  @belongsTo(() => Departamento)
  declare departamento: BelongsTo<typeof Departamento>
}
