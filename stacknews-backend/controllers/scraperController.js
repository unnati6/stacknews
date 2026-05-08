const { runScraper } = require('../config/scraper')

const triggerScrape = async (req, res) => {
  try {
    const stories = await runScraper()
    res.json({
      message: `Successfully scraped ${stories.length} stories from Hacker News`,
      count: stories.length,
    })
  } catch (error) {
    console.error('Scrape error:', error.message)
    res.status(500).json({ message: 'Scraping failed', error: error.message })
  }
}

module.exports = { triggerScrape }
