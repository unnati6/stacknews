const axios = require('axios')
const cheerio = require('cheerio')
const Story = require('../models/Story')

const HN_URL = 'https://news.ycombinator.com'

/**
 * Parses HN relative time strings like "2 hours ago", "3 days ago"
 * into a JavaScript Date object.
 */
const parsePostedAt = (timeStr) => {
  if (!timeStr) return new Date()

  const now = new Date()
  const match = timeStr.match(/(\d+)\s+(minute|hour|day|month|year)s?\s+ago/)

  if (!match) return now

  const value = parseInt(match[1], 10)
  const unit = match[2]

  const map = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  }

  return new Date(now.getTime() - value * (map[unit] || 0))
}

/**
 * Scrapes the top 10 stories from Hacker News front page.
 * Uses cheerio to parse the HTML structure of HN's table layout.
 */
const scrapeHackerNews = async () => {
  console.log('🕷️  Starting HN scrape...')

  const { data: html } = await axios.get(HN_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; StackNews-Bot/1.0; +https://stacknews.app)',
    },
    timeout: 10000,
  })

  const $ = cheerio.load(html)
  const stories = []

  // HN uses .athing for each story row, .subtext for meta info
  $('.athing').each((i, el) => {
    if (i >= 10) return false // top 10 only

    const row = $(el)
    const subRow = row.next('tr') // the row below contains points, author, time

    // Title and URL
    const titleEl = row.find('.titleline > a').first()
    const title = titleEl.text().trim()
    let url = titleEl.attr('href') || ''

    // HN-internal links start with "item?id=" — make them absolute
    if (url.startsWith('item?id=')) {
      url = `${HN_URL}/${url}`
    }

    // HN story ID
    const hnId = row.attr('id')

    // Points — inside .score span
    const pointsText = subRow.find('.score').text().trim()
    const points = parseInt(pointsText) || 0

    // Author — inside .hnuser
    const author = subRow.find('.hnuser').text().trim() || 'unknown'

    // Posted time — .age element
    // title attr format: "2024-01-15T10:30:00" (Unix timestamp seconds as string on some versions)
    // text format: "2 hours ago", "3 days ago"
    const ageEl = subRow.find('.age')
    const titleAttr = ageEl.attr('title') || ''
    const ageText = ageEl.text().trim()
    console.log({ hnId, titleAttr, ageText }) 

    let postedAt = new Date()

if (titleAttr) {
  const isoPart = titleAttr.split(' ')[0]  // "2026-05-07T14:06:10"
  const isoDate = new Date(isoPart)
  if (!isNaN(isoDate.getTime())) {
    postedAt = isoDate
  } else {
    postedAt = parsePostedAt(ageText)
  }
} else if (ageText) {
  postedAt = parsePostedAt(ageText)
}

    if (title && url) {
      stories.push({ title, url, points, author, postedAt, hnId })
    }
  })

  console.log(`✅ Scraped ${stories.length} stories from HN`)
  return stories
}

/**
 * Saves scraped stories to MongoDB.
 * Uses upsert on URL to avoid duplicates — updates points/author if re-scraped.
 */
const saveStories = async (stories) => {
  const ops = stories.map((story) => ({
    updateOne: {
      filter: { url: story.url },
      update: { $set: story },
      upsert: true,
    },
  }))

  const result = await Story.bulkWrite(ops)
  console.log(
    `💾 Saved: ${result.upsertedCount} new, ${result.modifiedCount} updated`
  )
  return result
}

/**
 * Main scraper function — scrapes + saves in one call.
 */
const runScraper = async () => {
  const stories = await scrapeHackerNews()
  await saveStories(stories)
  return stories
}

module.exports = { runScraper, scrapeHackerNews, saveStories }