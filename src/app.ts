import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { router as Router } from './routes'

import { globalErrorHandler, wildRoutesHandler } from './middlewares/errors.middlewares'
import { initiateS3Bucket } from './middlewares/upload.middlewares'
import { isProduction } from './env'

export const createApplication = () => {
  const app = express()

  app.set('trust proxy', 'loopback')

  app.use(cors())
  app.use(express.json())

  !isProduction && app.use(morgan('dev'))

  app.use('/api/v1', initiateS3Bucket, Router)

  app.use('/*', wildRoutesHandler)
  app.use(globalErrorHandler)

  return app
}
