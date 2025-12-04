import dotenv from 'dotenv'
import http from 'http'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import { Server as SocketIOServer } from 'socket.io'
import apiRouter from './routes/index.js'
import { registerSocketHandlers } from './services/socketService.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') ?? '*', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiRouter)

const PORT = process.env.PORT || 4000
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
})

registerSocketHandlers(io)

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('Connected to MongoDB')
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error', err)
    process.exit(1)
  })
