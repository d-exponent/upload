import { UploadModel } from '../models/Upload'
import { UserModel } from '../models/User'

export const createUpload = async (data: any) => UploadModel.create(data)

export const createHighlight = async (data: any) => {
  return await UploadModel.create({
    user: data.user,
    event: data.event,
    highlight: [
      {
        caption: data.caption,
        mediaSourceCover: data.mediaSourceCover,
        mediaSourceOriginal: data.mediaSourceOriginal,
        textHighLight: data.textHighLight,
      },
    ],
  })
}

export const updateBackgroundImage = (user_id: string, location: string) => {
  return UserModel.findByIdAndUpdate(user_id, { backgroundBanner: location }, { new: true })
}

export const updateUserProfilePicture = async (user_id: any, location: string) => {
  return UserModel.findByIdAndUpdate(user_id, { profilePhoto: location }, { new: true })
}

export const fetchUploadedEvent = async (data: any) => {
  return await UploadModel.find(data).populate('user event').sort({ createdAt: -1 })
}
