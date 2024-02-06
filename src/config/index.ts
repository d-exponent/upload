import { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { join } from 'path'

import { ApiError } from '../utils/ApiError'

type FileNameCallback = (error: Error | null, filename: string) => void

export const extractMimetype = (file: Express.Multer.File, onlyMime: boolean = true) => {
  const mimetypes = file.mimetype.split('/')
  return onlyMime ? mimetypes[0] : mimetypes
}

export const multerConfig: multer.Options = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (/jpeg|jpg|png|gif/.test(file.mimetype)) {
      return cb(null, true)
    }
    cb(new Error('Invalid file type. Allowed types are jpeg|jpg|png|gif'))
  },
}

export const multerVideoAudioConfig: multer.Options = {
  storage: multer.diskStorage({
    destination: join(process.cwd(), 'uploads'),
    filename: function (_: Request, file: Express.Multer.File, cb: FileNameCallback) {
      cb(null, file.originalname)
    },
  }),

  // storage: multer.memoryStorage(),
  fileFilter: (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const [mimetype, extension] = extractMimetype(file, false)

    if (mimetype === 'audio' && file.size > 35 * 1024 * 1024) {
      return cb(new ApiError(413, 'Max size of audio file is 35mb'))
    }

    if (mimetype === 'video' && file.size > 40 * 1024 * 1024) {
      return cb(new ApiError(413, 'Max size of video files is 40mb'))
    }

    if (/mp4|webm|ogg|mp3|wav|mpeg/.test(extension)) {
      return cb(null, true)
    }

    cb(new Error('Invalid file type. ALlowed types are mp4|webm|ogg|mp3|wav|mpeg'))
  },
}
