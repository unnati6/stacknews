import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const timeAgo = (dateStr) => {
  const date = new Date(dateStr)
  // Unix timestamp (seconds) ho to milliseconds mein convert karo
  const time = date.getTime() === 0 
    ? new Date(Number(dateStr) * 1000) 
    : date
  
  const diff = Date.now() - time.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

const StoryCard = ({ story, index, onBookmarkChange }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookmarked, setBookmarked] = useState(story.isBookmarked || false)
  const [toggling, setToggling] = useState(false)

  const handleBookmark = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setToggling(true)
    try {
      const { data } = await api.post(`/stories/${story._id}/bookmark`)
      setBookmarked(data.bookmarked)
      onBookmarkChange?.(story._id, data.bookmarked)
    } catch {
      // silently fail
    } finally {
      setToggling(false)
    }
  }

  const domain = getDomain(story.url)

  return (
    <article
      className="card-hover p-4 sm:p-5 group animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-col items-center min-w-[2.5rem]">
          <span className="font-mono text-xs text-gray-600 font-medium">
            #{String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-semibold text-gray-100 hover:text-brand-400 transition-colors leading-snug line-clamp-2 block"
              >
                {story.title}
              </a>

              {domain && (
                <span className="text-xs text-gray-600 font-mono mt-1 inline-block">
                  {domain}
                </span>
              )}
            </div>

            <button
              onClick={handleBookmark}
              disabled={toggling}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                bookmarked
                  ? 'text-brand-400 bg-brand-500/15 hover:bg-brand-500/25'
                  : 'text-gray-600 hover:text-gray-300 hover:bg-surface-hover'
              } ${toggling ? 'opacity-50' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <span className="badge bg-brand-500/10 text-brand-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {story.points} pts
            </span>

            <span className="text-xs text-gray-500 font-body">
              by{' '}
              <a
                href={`https://news.ycombinator.com/user?id=${story.author}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-400 transition-colors"
              >
                {story.author}
              </a>
            </span>

            <span className="text-xs text-gray-600 font-body">
              {timeAgo(story.postedAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default StoryCard
