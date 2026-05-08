const mongoose = require('mongoose')

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    postedAt: {
      type: Date,
      required: true,
    },
    hnId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
)

storySchema.index({ points: -1 })

module.exports = mongoose.model('Story', storySchema)
