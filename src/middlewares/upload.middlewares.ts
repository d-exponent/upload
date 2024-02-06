import { join } from 'path'
import { NextFunction, Request, Response } from 'express'
import { rimraf } from 'rimraf'
import uniqid from 'uniqid'
import S3 from 'aws-sdk/clients/s3'
import { path } from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'

import { FORBIDDEN, INTERNAL_SERVER_ERROR } from 'http-status'
import { ApiError } from '../utils/ApiError'
import { UploadModel } from '../models/Upload'
import { UserModel } from '../models/User'
import catchAsync from '../utils/catchAsync'

import { initBucket } from '../services/s3buckets'
import env from '../env'

ffmpeg.setFfmpegPath(path)

const s3 = new S3({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_ACCESS_SECRET_KEY,
  },
})

export const restrictUploadToMax = async ({ params: { user_id }, files }: Request, _: Response, next: NextFunction) => {
  const user = await UserModel.findById(user_id)

  if (!user) next(new ApiError(FORBIDDEN, 'You shall not pass'))

  const userUploads = await UploadModel.find({ user: user_id })

  const maxUploadsPerUser = 5
  const totalCurrentUploads = userUploads.length

  if (totalCurrentUploads >= maxUploadsPerUser) {
    return next(new ApiError(FORBIDDEN, 'The user has already reached maximun uploads'))
  }

  if (files && Array.isArray(files) && files.length + totalCurrentUploads > maxUploadsPerUser) {
    const message = `The user can only upload ${maxUploadsPerUser - totalCurrentUploads} more files. `
    return next(new ApiError(FORBIDDEN, message))
  }
  next()
}

export const initiateS3Bucket = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bucketIsInitiated = await initBucket(s3)

  if (!bucketIsInitiated) {
    return next(new ApiError(INTERNAL_SERVER_ERROR, 'Could not initiate Bucket', {}, true))
  }

  req.s3 = s3
  next()
})
