import { S3 } from 'aws-sdk'
import { createReadStream } from 'fs'
import { rimraf } from 'rimraf'
import uniqid from 'uniqid'

import env from '../../env'
import {
  HightLightCoverUpload,
  completeImageEventUpload,
  completeThumbnailsEventUpload,
  highLightOriginalUpload,
  highLightResize,
  mainHighLightAspectRatio,
  resizeImage,
  thumbnailDimension,
  trimVideo,
  injectUniqueId,
} from './utils'

const s3Params = (file: any, type: any, altPath?: string) => {
  const extension = file.path.split('.').pop()
  return {
    Bucket: env.AWS_INPUT_BUCKET,
    Key: `events/${type}/${uniqid()}-taron-${type}-${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension}`,
    Body: createReadStream(altPath ? altPath : file.path),
    ContentType: file.mimetype,
  }
}

export const uploadMediaToS3 = async (s3: S3, fileData: any, type: 'audio' | 'video' | 'videos') => {
  let response: any[] = []

  for (let i = 0; i < fileData.length; i++) {
    const file = fileData[i]

    if (type === 'audio') {
      const params = s3Params(file, type)
      response.push(await s3.upload(params).promise())
    }

    if (type === 'video' || type === 'videos') {
      const newPath = injectUniqueId(file.path)
      await trimVideo(file.path, newPath)

      const params = s3Params(file, type, newPath)
      response.push(await s3.upload(params).promise())

      rimraf(newPath).catch(console.error)
    }
    rimraf(file.path).catch(console.error)
  }
  return response
}

export const uploadImageEventToS3 = async (s3: S3, file: Express.Multer.File) => {
  const ImageData = await mainHighLightAspectRatio(file, 'event')
  const thumbnailsData = await thumbnailDimension(file)
  let uploadedEventImage = await completeImageEventUpload(s3, ImageData)
  let thumbnailsUploadEventImage = await completeThumbnailsEventUpload(s3, thumbnailsData)
  return {
    success: true,
    data: {
      images: uploadedEventImage,
      thumbnails: thumbnailsUploadEventImage,
    },
  }
}

export const uploadProfileOrBgToS3 = async (s3: S3, file: Express.Multer.File, folder: 'bg' | 'profile') => {
  const width = folder === 'profile' ? 400 : 1200
  const height = folder === 'profile' ? 400 : 400

  const params = {
    Bucket: env.AWS_OUTPUT_BUCKET,
    Key: `images/${folder}/${uniqid()}-${file.originalname}`,
    Body: await resizeImage(width, height, file.buffer),
    ContentType: file!.mimetype,
    ACL: 'public-read',
  }
  return s3.upload(params).promise()
}

export const uploadEventHighlightToS3 = async (s3: S3, fileData: Express.Multer.File) => {
  const highLightCover = await highLightResize(fileData)
  const highLightOriginal = await mainHighLightAspectRatio(fileData, 'highlight')
  let highLightCoverResult = await HightLightCoverUpload(s3, highLightCover, fileData)
  let highLightOriginalResult = await highLightOriginalUpload(s3, highLightOriginal)

  return {
    data: {
      highLightCover: highLightCoverResult,
      highLightOriginal: highLightOriginalResult,
    },
  }
}
