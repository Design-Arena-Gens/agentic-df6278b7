import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'
import { jwtConfig } from '../config/appConfig.js'

const generateToken = (userId) =>
  jwt.sign({ sub: userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })

export const register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password } = req.body
  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Registration failed' })
  }
}

export const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Login failed' })
  }
}

export const me = async (req, res) => {
  return res.json({ user: req.user })
}
