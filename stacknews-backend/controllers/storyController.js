const Story = require('../models/Story')
const User = require('../models/User')

const getAllStories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Story.countDocuments()
    const stories = await Story.find()
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit)

    // If user is authenticated, mark their bookmarked stories
    let bookmarkedIds = []
    if (req.user) {
      const user = await User.findById(req.user._id).select('bookmarks')
      bookmarkedIds = user.bookmarks.map((id) => id.toString())
    }

    const storiesWithBookmark = stories.map((story) => ({
      ...story.toObject(),
      isBookmarked: bookmarkedIds.includes(story._id.toString()),
    }))

    res.json({
      stories: storiesWithBookmark,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stories' })
  }
}

const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) {
      return res.status(404).json({ message: 'Story not found' })
    }

    let isBookmarked = false
    if (req.user) {
      const user = await User.findById(req.user._id).select('bookmarks')
      isBookmarked = user.bookmarks.some(
        (id) => id.toString() === story._id.toString()
      )
    }

    res.json({ ...story.toObject(), isBookmarked })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch story' })
  }
}

const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(req.user._id)

    const story = await Story.findById(id)
    if (!story) {
      return res.status(404).json({ message: 'Story not found' })
    }

    const isBookmarked = user.bookmarks.some(
      (bookmarkId) => bookmarkId.toString() === id
    )

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (bookmarkId) => bookmarkId.toString() !== id
      )
    } else {
      user.bookmarks.push(id)
    }

    await user.save()

    res.json({
      bookmarked: !isBookmarked,
      message: !isBookmarked ? 'Bookmarked' : 'Bookmark removed',
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle bookmark' })
  }
}

const getBookmarkedStories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks')

    const stories = user.bookmarks.map((story) => ({
      ...story.toObject(),
      isBookmarked: true,
    }))

    res.json(stories)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookmarks' })
  }
}

module.exports = {
  getAllStories,
  getStoryById,
  toggleBookmark,
  getBookmarkedStories,
}
