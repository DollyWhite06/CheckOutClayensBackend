import { defineConfig } from '@adonisjs/auth'
import { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import { tokensUserProvider } from '@adonisjs/auth/access_tokens'
import { jwtGuard } from '@maximemrf/adonisjs-jwt/jwt_config'
import { JwtGuardUser, BaseJwtContent } from '@maximemrf/adonisjs-jwt/types'
import Usuario from '#models/usuario'
import env from '#start/env'

interface JwtContent extends BaseJwtContent {
  email: string
}

const authConfig = defineConfig({
  // define the default authenticator to jwt
  default: 'jwt',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: sessionUserProvider({
        model: () => import('#models/usuario'),
      }),
    }),
    // add the jwt guard
    jwt: jwtGuard({
      // tokenName is the name of the token passed as cookie, it can be optional, by default it is 'token'
      tokenName: 'custom-name',
      // tokenExpiresIn can be a string or a number, it can be optional
      tokenExpiresIn: '1h',
      // if you want to use cookies for the authentication instead of the bearer token (optional)
      // secret is the secret used to sign the token, it can be optional, by default it uses the application key
      // you can use a env variable like JWT_SECRET or set it directly with a string
      // if you don't have specific needs, please discard this option
      secret: env.get('JWT_SECRET'),


      
      provider: sessionUserProvider({
        model: () => import('#models/usuario'),
      }),
      // if you want to use refresh tokens, you have to set the refreshTokenUserProvider
      refreshTokenUserProvider: tokensUserProvider({
        tokens: 'refreshTokens',
        model: () => import('#models/usuario'),

      }),
      // content is a function that takes the user and returns the content of the token, it can be optional, by default it returns only the user id
      content: <T>(user: JwtGuardUser<T>): JwtContent => {
        return {
          userId: user.getId(),
          email: (user.getOriginal() as Usuario).email,
        }
      },
    }),
  },
})

export default authConfig

declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
