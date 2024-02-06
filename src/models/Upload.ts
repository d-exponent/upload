import { FORBIDDEN } from 'http-status'
import { Schema, model } from 'mongoose'
import { ApiError } from '../utils/ApiError'

const uploadSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    mediaSource: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    highLight: [
      {
        caption: String,
        mediaSourceCover: String,
        mediaSourceOriginal: String,
        textHighLight: String,
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

uploadSchema.statics.getUserUploadsCount = async function getUserUploadCount(userId: string) {
  const userUploads = await this.find({ user: userId })
  return userUploads.length
}

export const UploadModel = model('Upload', uploadSchema)
