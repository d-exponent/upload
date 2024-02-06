import { S3 } from 'aws-sdk'
import { CreateJobCommand, ElasticTranscoderClient, ReadJobCommand } from '@aws-sdk/client-elastic-transcoder'
import { createReadStream } from 'fs'
import { injectUniqueId, trimVideo } from './s3buckets/utils'

import env from '../env'
import { getRandom } from './s3buckets/utils'
import { extractMimetype } from '../config'
import { ApiError } from '../utils/ApiError'
import { BAD_REQUEST } from 'http-status'

interface IJobCommandParams {
  PipelineId: string
  Input: {
    Key: string
    frame_rate: string
    resolution: string
    aspect_ratio: string
    container: string
  }
  Outputs: [{ Key: string; PresetId: string }]
}

const client = new ElasticTranscoderClient({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_ACCESS_SECRET_KEY,
  },
})

const audioPipeline = '1688075020790-xpttmw'
const videoPipelineID = '1688075475898-a42ghp'

type AudioVideo = 'audio' | 'video'

export const s3Params = (file: Express.Multer.File, type: AudioVideo, altPath?: string) => {
  const extension = file.path.split('.').pop()
  const { number, id, date } = getRandom()
  return {
    Bucket: env.AWS_INPUT_BUCKET,
    Key: `events/${type}/${id}-taron-${type}-${date}_${number}.${extension}`,
    Body: createReadStream(altPath ? altPath : file.path),
    ContentType: file.mimetype,
  }
}

const uploadSingleMediaToS3 = async (s3: S3, file: Express.Multer.File, type: AudioVideo, pathsToRemove: string[]) => {
  let params

  if (type === 'audio') {
    params = s3Params(file, type)
    pathsToRemove.push(file.path)
    return s3.upload(params).promise()
  }

  const newPath = injectUniqueId(file.path)
  await trimVideo(file.path, newPath)
  params = s3Params(file, type, newPath)
  pathsToRemove.push(file.path)
  pathsToRemove.push(newPath)
  return s3.upload(params).promise()
}

const handleUploadTranscode = async (s3: S3, files: Express.Multer.File[], usedPaths: string[]) => {
  const validFiles = files.filter((file) => {
    const mimetype = extractMimetype(file)
    return mimetype === 'video' || mimetype === 'audio'
  })

  if (!validFiles.length) throw new ApiError(BAD_REQUEST, 'Upload at least one video or audio file')

  const uploads = await Promise.all(
    validFiles.map((file) => {
      const mimetype = extractMimetype(file) as 'audio' | 'video'
      return uploadSingleMediaToS3(s3, file, mimetype, usedPaths)
    }),
  )

  return Promise.all(uploads.map((upload) => createSingleJob(upload.Key)))
}

export default handleUploadTranscode

const createSingleJob = async (Key: string) => {
  const isAudioJob = Key.split('/')[1] === 'audio'
  const PipelineId = isAudioJob ? audioPipeline : videoPipelineID
  const PresetId = isAudioJob ? env.AUDIO_PRESET_ID : env.VIDEO_PRESET_ID

  return jobCommands({
    PipelineId,
    Input: {
      Key,
      frame_rate: 'auto',
      resolution: 'auto',
      aspect_ratio: 'auto',
      container: 'auto',
    },
    Outputs: [{ Key, PresetId }],
  })
}

const jobCommands = async (input: IJobCommandParams) => {
  const createJobCommand = new CreateJobCommand(input)
  const response = await client.send(createJobCommand)

  if (!response || !response.Job) return Promise.reject('Could not get Job Command.')

  await waitForJobCompletion(response.Job.Id as string)
  const readJobCommand = new ReadJobCommand({ Id: response.Job.Id })
  const jobDetails = await client.send(readJobCommand)

  if (!jobDetails || !jobDetails.Job || !jobDetails.Job.Outputs?.length) return Promise.reject('Could not read Job')

  const jobDetailsOutput = jobDetails.Job.Outputs[0]

  if (!jobDetailsOutput.Key) return Promise.reject('Could not get response credentials from job')

  const { Duration, FileSize, Key } = jobDetailsOutput

  return {
    outputObjectURL: `https://${env.AWS_BUCKET_REGION}.amazonaws.com/${env.AWS_OUTPUT_BUCKET}/${Key}`,
    duration: Duration,
    filename: Key.split('/').pop(),
    filesize: FileSize,
  }
}

const waitForJobCompletion = async (jobId: string) => {
  while (true) {
    const readJobCommand = new ReadJobCommand({ Id: jobId })
    const jobDetails: any = await client.send(readJobCommand)
    const status = jobDetails.Job.Status

    if (status === 'Complete' || status === 'Error' || status === 'Canceled') {
      break
    }

    await delay(2000) // Wait for 5 seconds before checking the job status again
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
