import mongoose, { MongooseError } from 'mongoose'
import env from './env'

const connection = {
  isActive: false,
}

export const connectMongo = async () => {
  if (connection.isActive === true) return 'Connection is active 🐱‍🏍'
  try {
    await mongoose.connect(env.DB_URL)
    connection.isActive = true
    return 'Connected to mongodb successfully 👍✔'
  } catch (e: unknown) {
    connection.isActive = false
    return Promise.reject(e instanceof MongooseError ? e.message : 'Error🛑: could not connect to mongoDB')
  }
}
