import S3 from 'aws-sdk/clients/s3'

export {}

declare global {
  namespace Express {
    export interface Request {
      s3: S3
    }
  }
}
