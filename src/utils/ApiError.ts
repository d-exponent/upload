export class ApiError extends Error {
  isOperational
  statusCode
  extra
  constructor(statusCode: Number, message: string, extra: {} = {}, isOperational = false, stack = '') {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.extra = extra

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
