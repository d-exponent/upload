import { Router } from 'express'
import multer from 'multer'

import { multerConfig, multerVideoAudioConfig } from '../config'
import {
  uploadBackgroundPicture,
  uploadEventPicture,
  uploadEventVideosORAudio,
  // uploadMedia,
  uploadProfilePicture,
  uploadHighlights,
} from '../controllers/upload.controller'
import { restrictUploadToMax } from '../middlewares/upload.middlewares'

const MAX_FILES = 4
const upload = multer(multerConfig)
const videoAudioUpload = multer(multerVideoAudioConfig)

const router = Router()

router.post('/event-pictures/:user_id', upload.array('files', MAX_FILES), restrictUploadToMax, uploadEventPicture)

router.post(
  '/videos-audio/:user_id',
  videoAudioUpload.array('files', MAX_FILES),
  restrictUploadToMax,
  uploadEventVideosORAudio,
)
// router.post('/media/:user_id', videoAudioUpload.array('files', MAX_FILES), restrictUploadToMax, trimVidoes, uploadMedia)

router.post('/highlight/:user_id', upload.array('files', MAX_FILES), restrictUploadToMax, uploadHighlights)

router.post('/profilepic/:user_id', upload.single('file'), restrictUploadToMax, uploadProfilePicture)

router.post('/backgroundpic/:user_id', upload.single('file'), restrictUploadToMax, uploadBackgroundPicture)

export default router
