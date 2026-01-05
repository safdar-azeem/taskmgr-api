import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import app from './app'
import connectDB from './config/db'

const PORT = process.env.PORT || 4003

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  })
}

startServer()

export default app
