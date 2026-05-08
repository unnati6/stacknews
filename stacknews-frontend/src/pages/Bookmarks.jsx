import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StoryCard from '../components/StoryCard'
import api from '../api/axios'

const Bookmarks = () => {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/stories/bookmarks')
        setStories(data)
      } catch {
        setError('Failed to load bookmarks.')
      } finally {
        setLoading(false)
      }
    }
    fetchBookmarks()
  }, [])

  const handleBookmarkChange = (storyId, isBookmarked) => {
    if (!isBookmarked) {
      setStories((prev) => prev.filter((s) => s._id !== storyId))
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white tracking-tight">
          Bookmarks
        </h1>
        <p className="text-gray-500 text-sm font-body mt-1">
          {stories.length} saved {stories.length === 1 ? 'story' : 'stories'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-body">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-8 h-4 bg-surface-hover rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-hover rounded w-3/4" />
                  <div className="flex gap-2 mt-3">
                    <div className="h-5 w-16 bg-surface-hover rounded" />
                    <div className="h-5 w-20 bg-surface-hover rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🔖</div>
          <p className="text-gray-500 font-body mb-4">
            No bookmarks yet. Start saving stories you want to read later!
          </p>
          <Link to="/" className="btn-primary">
            Browse Stories
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story, i) => (
            <StoryCard
              key={story._id}
              story={{ ...story, isBookmarked: true }}
              index={i}
              onBookmarkChange={handleBookmarkChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookmarks
