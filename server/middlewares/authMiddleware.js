const jwt = require('jsonwebtoken')
const User = require('../models/user.models')

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_env'

const normalizeRole = (role) => String(role || '').trim().toLowerCase()

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: normalizeRole(user.role)
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )
}

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is inactive' })
    }

    req.user = {
      ...user.toObject ? user.toObject() : user,
      role: normalizeRole(user.role)
    }
    req.userId = user._id
    req.hospitalId = user.hospitalId || null
    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token.', code: 'TOKEN_INVALID' })
    }

    console.error('authMiddleware error:', error)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

const requireRole = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole)

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const actualRole = normalizeRole(req.user.role)
    if (!normalizedAllowedRoles.includes(actualRole)) {
      return res.status(403).json({ message: 'Access denied for this role' })
    }

    req.user.role = actualRole
    return next()
  }
}

const roleMiddleware = requireRole

module.exports = {
  signToken,
  authMiddleware,
  requireRole,
  roleMiddleware
}
