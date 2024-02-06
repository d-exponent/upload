import { connectMongo } from './db'
import { createApplication } from './app'
import env from './env'

const { PORT } = env

connectMongo()
  .then((res) => {
    console.log(res)
    createApplication().listen(PORT, () => console.log('Server is running on port', PORT))
  })
  .catch((e) => console.log(e.message))

