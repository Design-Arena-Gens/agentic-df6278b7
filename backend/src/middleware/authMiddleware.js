import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/appConfig.js'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  const token = header.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, jwtConfig.secret)
    const user = await User.findById(payload.sub).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    req.user = user
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
