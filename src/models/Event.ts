import { Document, Schema, model } from 'mongoose'

interface IEvent extends Document {
  type: String
}

const eventSchema = new Schema({
  image: {
    type: String,
    required: true,
  },
  thumbnails: [
    {
      type: String,
      required: true,
    },
  ],
  media: {
    mediaType: {
      type: String,
    },
    fileSize: {
      type: String,
    },
    duration: {
      type: Number,
    },
    fileName: {
      type: String,
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
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  attendees: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  details: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  mapUrl: {
    type: String,
    required: function (this: IEvent) {
      return this.type === 'Physical'
    },
  },
  eventTags: [
    {
      type: String,
      required: true,
    },
  ],
  turnOffComments: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  eventUrl: {
    type: String,
    required: true,
  },
  geolocation: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  invitedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  shares: [
    {
      sharedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      sharedTo: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      ],
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  likesCount: {
    type: Number,
    default: 0,
  },
  sharesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  invitedUsersCount: {
    type: Number,
    default: 0,
  },
})

export const EventModel = model('Event', eventSchema)
