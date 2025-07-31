import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuario'
import hash from '@adonisjs/core/services/hash'
import {loginValidator} from '#validators/login_validator'
import { error } from 'console'
import { errorResponse } from '../helpers/response_helper.js'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import JwtRefreshToken from '#models/jwt_refresh_token'
import AuthException from '#exceptions/auth_exception'

export default class UsersController {
    async register({request, response}: HttpContext) {
        const data = request.only(['nombre','apellido','usuario', 'email', 'password', 'rolId'])
        const exists = await Usuario.findBy('usuario', data.usuario)
        if (exists) {
            throw AuthException.userAlreadyExists()
        }
      
          const hashedPassword = await hash.make(data.password)
      
          const nuevoUsuario = await Usuario.create({
            ...data,
            password: hashedPassword,
            estado: true,
          })
      
          return response.created({ message: 'Usuario registrado', usuario: nuevoUsuario })
          }

  // login if we use authorization bearer
async login({ request, response, auth }: HttpContext) {
  const { email, password } = await request.validateUsing(loginValidator)

  const user = await Usuario.verifyCredentials(email, password)

  // Genera token de acceso (JWT normal)
  const token = await auth.use('jwt').generate(user)

 
  // Genera refresh token
  const refreshToken = await Usuario.refreshTokens.create(user)

  return response.ok({
    status: 'success',
    message: 'Inicio de sesión exitoso',
    token,
    refreshToken,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      usuario: user.usuario,
      estado: user.estado,
      rol: user.rol,
    },
  })
}


async profile({ auth, response }: HttpContext) {
  try {
    // Autenticar al usuario usando JWT
    const user = auth.getUserOrFail()
    
    return user

  } catch (error) {
    throw AuthException.invalidToken()
  }
}

async refreshToken({ auth, request, response }: HttpContext) {
  try {
    // 1. Obtener el refresh token del header Authorization
    const refreshToken = request.header('Authorization')?.replace('Bearer ', '')
    if (!refreshToken) {
      return response.unauthorized({
        status: 'error',
        message: 'Error en la sesion'
      })
    }

    // 2. Autenticar usando el refresh token (esto automáticamente:
    //    - Verifica el token
    //    - Elimina el viejo refresh token
    //    - Genera uno nuevo
    const user = await auth.use('jwt').authenticateWithRefreshToken(refreshToken)

    // 3. Generar nuevo token de acceso JWT
    const newToken = await auth.use('jwt').generate(user)

    // 4. Obtener el nuevo refresh token (generado automáticamente)
    const newRefreshToken = user.currentToken

    return response.ok({
      status: 'success',
      message: 'Tokens renovados exitosamente',
      token: newToken,
      refreshToken: newRefreshToken,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        estado: user.estado,
        rol: user.rol,
      }
    })
  } catch (error) {
    return response.unauthorized({
      status: 'error',
      message: 'Error al renovar tokens',
      error: this.mapRefreshTokenError(error)
    })
  }
}

// Método auxiliar para manejar errores específicos
private mapRefreshTokenError(error: any): string {
  if (error.message.includes('expired')) {
    return 'Refresh token expirado'
  }
  if (error.message.includes('invalid') || error.message.includes('malformed')) {
    return 'Refresh token inválido'
  }
  if (error.message.includes('revoked')) {
    return 'Refresh token revocado'
  }
  return 'Error de autenticación'
}
}