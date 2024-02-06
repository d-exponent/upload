import { NextFunction, Request, Response } from 'express'
import { BAD_REQUEST, OK } from 'http-status'

import {
  createHighlight,
  createUpload,
  updateBackgroundImage,
  updateUserProfilePicture,
} from '../dbServices/upload.table'

import {
  uploadEventHighlightToS3,
  uploadImageEventToS3,
  uploadProfileOrBgToS3,
} from '../services/s3buckets/uploadToS3'

import { rimraf } from 'rimraf'
import handleUploadTranscode from '../services/handler'
import { ApiError } from '../utils/ApiError'
import catchAsync from '../utils/catchAsync'

export const uploadHighlights = catchAsync(
  async ({ s3, files, body: { event, user, type, textHighLight } }: Request, res: Response, next: NextFunction) => {
    if (!files) {
      return next(new ApiError(BAD_REQUEST, 'Upload at least one file'))
    }

    const acceptedTypes = ['image', 'text']

    if (!acceptedTypes.includes(type)) {
      const message = `${acceptedTypes.map((t) => `<${t}>`).join(' ')} are the only accepted types`
      return next(new ApiError(BAD_REQUEST, message))
    }

    let uploadRes = {}

    if (type !== 'image' && type !== 'text') {
      return next(new ApiError(BAD_REQUEST, '<type> must be an image or a text'))
    }

    if (type === 'image') {
      const imageBg: any = files

      const fileArray = await uploadEventHighlightToS3(s3, imageBg)
      uploadRes = await createHighlight({
        user,
        event,
        highlight: fileArray.data,
      })
    }

    if (type === 'text') {
      uploadRes = await createUpload({
        user,
        event,
        highLight: [{ textHighLight }],
      })
    }

    res.status(OK).json(uploadRes)
  },
)

export const uploadEventPicture = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const files: any = req.files

  if (!files) {
    return next(new ApiError(BAD_REQUEST, 'Upload at least one file'))
  }

  const imageEventData = await uploadImageEventToS3(req.s3, files)

  if (!imageEventData.success) {
    return next(new ApiError(BAD_REQUEST, 'Bad Request'))
  }

  res.status(OK).json({
    error: false,
    message: 'Success!',
    data: imageEventData,
  })
})

export const uploadBackgroundPicture = catchAsync(
  async ({ params, file, s3 }: Request, res: Response, next: NextFunction) => {
    if (!file) return next(new ApiError(400, 'Please upload a file'))

    const bgUpload = await uploadProfileOrBgToS3(s3, file, 'bg')

    res.status(OK).json({
      success: true,
      message: 'Background Image upload successful!',
      data: await updateBackgroundImage(params.user_id, bgUpload.Location),
    })
  },
)

export const uploadProfilePicture = catchAsync(
  async ({ params, file, s3 }: Request, res: Response, next: NextFunction) => {
    if (!file) return next(new ApiError(BAD_REQUEST, 'Provide a file'))

    const profileUpload = await uploadProfileOrBgToS3(s3, file, 'profile')

    res.status(OK).json({
      success: true,
      message: 'File upload successful!',
      data: await updateUserProfilePicture(params.user_id, profileUpload.Location),
    })
  },
)

export const uploadEventVideosORAudio = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const files: any = req.files

  if (!files) {
    return next(new ApiError(BAD_REQUEST, 'Upload at least one file'))
  }

  const pathsToDelete: string[] = []

  res.status(OK).json({
    error: false,
    message: 'success',
    data: await handleUploadTranscode(req.s3, files, pathsToDelete),
  })

  Promise.allSettled(pathsToDelete.map(path => rimraf(path))).catch(console.error)
})

///////
// export const uploadMedia = catchAsync(
//   async ({ body: { event }, s3, file, params: { user_id: user } }: Request, res: Response, next: NextFunction) => {
//     if (!event) {
//       return next(new ApiError(BAD_REQUEST, 'The event is required'))
//     }

//     if (file == undefined) {
//       return next(new ApiError(BAD_REQUEST, 'The file is required'))
//     }

//     const mimetype = file.mimetype.split('/')[0]
//     const allowedMimetypes = ['video', 'audio']

//     if (!allowedMimetypes.includes(mimetype)) {
//       return next(new ApiError(BAD_REQUEST, 'File must be video or audio'))
//     }

//     let data = {}

//     if (mimetype === 'video') {
//       const videoUpload = await uploadMediaToS3(s3, file, 'video')
//       const triggerVideoUpload: any = await createJob(videoUpload, 'video')
//       if (triggerVideoUpload !== null) {
//         data = {
//           user,
//           event,
//           mediaSource: triggerVideoUpload.data.outputURL,
//           fileName: triggerVideoUpload.data.filename,
//           duration: triggerVideoUpload.data.duration,
//           fileSize: triggerVideoUpload.data.filesize,
//         }
//       }
//     }

//     if (mimetype === 'audio') {
//       const audioUpload = await uploadMediaToS3(s3, file, 'audio')
//       const triggerAudioUpload: any = await createJob(audioUpload, 'audio')
//       if (triggerAudioUpload !== null) {
//         data = {
//           user,
//           event,
//           mediaSource: triggerAudioUpload.data.outputURL,
//           fileName: triggerAudioUpload.data.filename,
//           duration: triggerAudioUpload.data.duration,
//           fileSize: triggerAudioUpload.data.filesize,
//         }
//       }
//     }

//     res.status(OK).json(await createUpload(data))
//   },
// )
