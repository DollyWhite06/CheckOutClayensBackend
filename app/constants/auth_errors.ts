// app/constants/errors.ts

export const ErrorDictionary = {
  AUTH_INVALID_CREDENTIALS: {
    error_code: 'AUTH_001',
    status: 'error',
    message: 'Credenciales inválidas',
    description: 'Usuario o contraseña incorrectos.',
    httpCode: 401,
  },
  AUTH_FORBIDDEN: {
    error_code: 'AUTH_002',
    status: 'error',
    message: 'Acceso denegado',
    description: 'El usuario no tiene permisos suficientes.',
    httpCode: 403,
  },
 
}
