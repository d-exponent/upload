import express from 'express'
import UploadRouter from './upload.router'

const router = express.Router()

router.use('/upload', UploadRouter)

export { router }
