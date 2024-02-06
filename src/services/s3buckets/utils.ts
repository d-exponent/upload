import { S3 } from 'aws-sdk'
import sharp from 'sharp'
import uniqid from 'uniqid'
import { createReadStream } from 'fs'

import env from '../../env'

import { path } from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
ffmpeg.setFfmpegPath(path)

export const getRandom = () => ({
  number: Math.round(Math.random() * 1e9),
  id: uniqid(),
  date: Date.now(),
})

export const mainHighLightAspectRatio = async (file: any, caller: 'event' | 'highlight') => {
  const response = await Promise.all(
    file.map(async (obj: any) => {
      const image = sharp(obj.buffer)

      // Highlights images are already compressed
      if (caller === 'event') image.webp({ lossless: true })

      return {
        buffer: await image.toBuffer(),
        mimetype: obj.mimetype,
      }
    }),
  )
  return response
}

export const thumbnailDimension = async (file: any) => {
  const response = await Promise.all(
    file.map(async (obj: any) => {
      const buffer = await sharp(obj.buffer).resize({ width: 300, height: 300 }).toBuffer()
      const mimetype = obj.mimetype
      return {
        buffer,
        mimetype,
      }
    }),
  )
  return response
}

export const completeImageEventUpload = async (s3: S3, data: any) => {
  let response = []
  for (let i = 0; i < data.length; i++) {
    const extension = data[i].mimetype.split('/')
    const params: any = {
      Bucket: env.AWS_OUTPUT_BUCKET,
      Key: `events/images/${uniqid()}-taron-events-${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension[1]}`,
      Body: data[i].buffer,
      ContentType: data[i].mimetype,
      ACL: 'public-read',
    }
    const images = await s3.upload(params).promise()
    response.push(images.Location)
  }
  return response
}

export const completeThumbnailsEventUpload = async (s3: S3, data: any) => {
  let response = []
  for (let j = 0; j < data.length; j++) {
    const extension = data[j].mimetype.split('/')
    const params: any = {
      Bucket: env.AWS_OUTPUT_BUCKET,
      Key: `events/thumbnails/${uniqid()}-taron-events-${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension[1]}`,
      Body: data[j].buffer,
      ContentType: data[j]!.mimetype,
      ACL: 'public-read',
    }
    const images = await s3.upload(params).promise()
    response.push(images.Location)
  }
  return response
}

export const HightLightCoverUpload = async (s3: S3, data: Array<Buffer>, fileData?: Express.Multer.File) => {
  let uploads = []
  for (let i = 0; i < data.length; i++) {
    const result = {
      Bucket: env.AWS_OUTPUT_BUCKET,
      Key: `highlightcovers/${uniqid()}-taron-highlight-${Date.now()}_${Math.round(Math.random() * 1e9)}`,
      Body: data[i],
      // ContentType: fileData!.mimetype,
      ACL: 'public-read',
    }
    const cover = await s3.upload(result).promise()
    uploads.push(cover)
  }
  return uploads
}

export const highLightOriginalUpload = async (s3: S3, data: Array<Buffer>) => {
  let uploads = []
  for (let i = 0; i < data.length; i++) {
    const result = {
      Bucket: env.AWS_OUTPUT_BUCKET,
      Key: `highlightoriginal/${uniqid()}-taron-highlight-${Date.now()}_${Math.round(Math.random() * 1e9)}`,
      Body: data[i],
      // ContentType: fileData!.mimetype,
      ACL: 'public-read',
    }
    const cover = await s3.upload(result).promise()
    uploads.push(cover)
  }
  return uploads
}

export const highLightResize = async (file: any) => {
  const response = await Promise.all(
    file.map(async (obj: any) => {
      const imageData = sharp(obj.buffer)

      const { width, height } = await imageData.metadata()

      // Width is greater than  height in landScape so make potrait
      if (width && height && width > height) imageData.rotate(90)

      imageData.resize({ width: 1080, height: 1920 }).webp({ lossless: true })
      return imageData.toBuffer()
    }),
  )
  return response
}

export const resizeImage = (width: number, height: number, file: Buffer) =>
  sharp(file).resize({ width, height }).webp({ lossless: true }).toBuffer()

export const trimVideo = (oldPath: string, newPath: string) =>
  new Promise<void>((resolve, reject) => {
    ffmpeg(oldPath).setStartTime(0).setDuration(30).saveToFile(newPath).on('error', reject).on('end', resolve)
  })

export const injectUniqueId = (path: string) => {
  const pathArr = path.split('.')
  const extention = pathArr.pop()
  return pathArr.join('.') + `-${uniqid()}.` + extention
}
