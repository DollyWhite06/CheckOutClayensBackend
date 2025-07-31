// app/utils/response.ts

import { Response } from '@adonisjs/core/http'
// Update the path below to the correct relative path if 'auth_errors' is in the 'constants' folder at the project root
import { ErrorDictionary } from '../constants/auth_errors.js'

export function errorResponse(response: Response, errorKey: keyof typeof ErrorDictionary) {
  const error = ErrorDictionary[errorKey]
  return response.status(error.httpCode).json({
    error_code: error.error_code,
    status: error.status,
    message: error.message,
    description: error.description,
  })
}
