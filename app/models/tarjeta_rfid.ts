import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empleado from './empleado.js'
import { DateTime } from 'luxon'

export default class TarjetaRfid extends BaseModel {
  static table = 'tarjetas_rfid'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uid: string

  @column()
  declare activa: boolean

  @column()
  declare empleadoNumero: number | null

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime
 
   @column.dateTime({ autoCreate: true, autoUpdate: true })
   declare updatedAt: DateTime

  @belongsTo(() => Empleado, {
    foreignKey: 'empleadoNumero',
    localKey: 'numero',
  })
  declare empleado: BelongsTo<typeof Empleado>
}
