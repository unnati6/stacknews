import { useState, useEffect, useCallback } from 'react'
import StoryCard from '../components/StoryCard'
import api from '../api/axios'

const Stories = () => {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const fetchStories = useCallback(async (currentPage = 1) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/stories?page=${currentPage}&limit=${limit}`)
      setStories(data.stories || data)
      if (data.totalPages) setTotalPages(data.totalPages)
    } catch {
      setError('Failed to load stories. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStories(page)
  }, [fetchStories, page])

  const handleScrape = async () => {
    setScraping(true)
    try {
      await api.post('/scrape')
      await fetchStories(1)
      setPage(1)
    } catch {
      setError('Scraping failed.')
    } finally {
      setScraping(false)
    }
  }

  const handleBookmarkChange = (storyId, isBookmarked) => {
    setStories((prev) =>
      prev.map((s) => (s._id === storyId ? { ...s, isBookmarked } : s))
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            Top Stories
          </h1>
          <p className="text-gray-500 text-sm font-body mt-1">
            Curated from Hacker News, sorted by points
          </p>
        </div>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="btn-ghost text-sm flex items-center gap-2"
        >
          {scraping ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Scraping...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-body">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-8 h-4 bg-surface-hover rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-hover rounded w-3/4" />
                  <div className="h-3 bg-surface-hover rounded w-1/4" />
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
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500 font-body">No stories yet. Hit Refresh to scrape Hacker News!</p>
          <button onClick={handleScrape} className="btn-primary mt-4">
            Scrape Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story, i) => (
            <StoryCard
              key={story._id}
              story={story}
              index={(page - 1) * limit + i}
              onBookmarkChange={handleBookmarkChange}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-mono transition-colors ${
                  page === i + 1
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-500 hover:bg-surface-hover hover:text-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default Stories
