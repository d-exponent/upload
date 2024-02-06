import { S3 } from 'aws-sdk'
import { CreateBucketRequest } from 'aws-sdk/clients/s3'

import env from '../../env'

const bucketState = {
  isInit: false,
}

export const initBucket = async (s3: S3) => {
  // So we don't keep running checkBucket and createBucket after the first successfull initBucket call
  if (bucketState.isInit) return true

  if (await checkBucket(s3, env.AWS_OUTPUT_BUCKET)) {
    bucketState.isInit = true
    return true
  }

  if (await createBucket(s3)) {
    bucketState.isInit = true
    return true
  }
  return false
}

export const checkBucket = async (s3: S3, bucket: string) => {
  try {
    await s3.headBucket({ Bucket: bucket }).promise()
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

export const createBucket = async (s3: S3) => {
  const params: CreateBucketRequest = {
    Bucket: env.AWS_OUTPUT_BUCKET,
    CreateBucketConfiguration: {
      LocationConstraint: '',
    },
  }

  try {
    await s3.createBucket(params).promise()
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}
