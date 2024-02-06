import { NextFunction, Request, Response } from 'express'
import { METHOD_NOT_ALLOWED } from 'http-status'
import { isProduction } from '../env'
import { ApiError } from '../utils/ApiError'

export const globalErrorHandler = (err: any, _: Request, res: Response, __: NextFunction) => {
  const response = {
    success: false,
    error: true,
    message: err.message || 'Something went wrong',
  }

  const e = {
    ...err,
    name: err.name,
    stack: err.stack,
  }

  res.status(err.statusCode || 500).json(isProduction ? response : { ...response, ...e })
}

export const wildRoutesHandler = ({ method, originalUrl }: Request, _: Response, next: NextFunction) => {
  const error = new ApiError(
    METHOD_NOT_ALLOWED,
    `${method.toUpperCase()}: ${originalUrl} does not exist on this server`,
  )

  next(error)
}
