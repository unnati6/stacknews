require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const { runScraper } = require('./config/scraper')

const authRoutes = require('./routes/authRoutes')
const storyRoutes = require('./routes/storyRoutes')
const scraperRoutes = require('./routes/scraperRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://stacknews.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/scrape', scraperRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StackNews API is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

// Start server — connect DB first, then auto-scrape HN on boot
const start = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })

  // Auto-run scraper after server starts
  try {
    console.log('⏳ Running initial HN scrape on startup...')
    await runScraper()
  } catch (err) {
    console.error('⚠️  Auto-scrape failed on startup:', err.message)
  }
}

start()
