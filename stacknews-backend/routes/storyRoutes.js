const express = require('express')
const router = express.Router()
const {
  getAllStories,
  getStoryById,
  toggleBookmark,
  getBookmarkedStories,
} = require('../controllers/storyController')
const { protect } = require('../middleware/authMiddleware')

// Optional auth middleware — attaches user if token present, but doesn't block
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next)
  }
  next()
}

// GET /api/stories?page=1&limit=10
router.get('/', optionalAuth, getAllStories)

// GET /api/stories/bookmarks  (must come before /:id)
router.get('/bookmarks', protect, getBookmarkedStories)

// GET /api/stories/:id
router.get('/:id', optionalAuth, getStoryById)

// POST /api/stories/:id/bookmark
router.post('/:id/bookmark', protect, toggleBookmark)

module.exports = router
