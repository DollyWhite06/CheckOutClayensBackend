import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Rol from './rol.js'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { AccessTokensProviderContract } from '@adonisjs/auth/types/access_tokens'
import hash from '@adonisjs/core/services/hash'
import { Exception } from '@adonisjs/core/exceptions'
import AuthException from '../exceptions/auth_exception.js'
import { DateTime } from 'luxon'


export default class Usuario extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare apellido: string

  @column()
  declare usuario: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare estado: boolean

  @column()
  declare rolId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Rol)
  declare rol: BelongsTo<typeof Rol>

  static accessTokens = DbAccessTokensProvider.forModel(Usuario)

  static refreshTokens = DbAccessTokensProvider.forModel(Usuario, {
    prefix: 'rt_',
    table: 'jwt_refresh_tokens',
    type: 'jwt_refresh_token',
    tokenSecretLength: 40,
  })

  static async verifyCredentials(email: string, password: string) {
    const user = await this.findBy('email', email)

    if (!user) {
      throw AuthException.invalidCredentials()
    }

    if (!user.estado) {
      throw AuthException.accountInactive()
    }

    if (!(await hash.verify(user.password, password))) {
      throw AuthException.invalidCredentials()
    }

    return user
  }
}

