import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Grupo from './grupo.js'
import Zona from './zona.js'

export default class GrupoZonaAcceso extends BaseModel {

  public static table = 'grupo_zona_acceso'
  @column()
  declare grupoId: number

  @column()
  declare zonaId: number

  @belongsTo(() => Grupo)
  declare grupo: BelongsTo<typeof Grupo>

  @belongsTo(() => Zona)
  declare zona: BelongsTo<typeof Zona>

}
