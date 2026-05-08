const axios = require('axios')
const cheerio = require('cheerio')
const Story = require('../models/Story')

const HN_URL = 'https://news.ycombinator.com'

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

const scrapeHackerNews = async () => {
  console.log('🕷️  Starting HN scrape...')
  const { data: html } = await axios.get(HN_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; StackNews-Bot/1.0)',
    },
    timeout: 10000,
  })

  const $ = cheerio.load(html)
  const stories = []

  $('.athing').each((i, el) => {
    if (i >= 10) return false

    const row = $(el)
    const subRow = row.next('tr')

    const titleEl = row.find('.titleline > a').first()
    const title = titleEl.text().trim()
    let url = titleEl.attr('href') || ''

    if (url.startsWith('item?id=')) {
      url = `${HN_URL}/${url}`
    }

    const hnId = row.attr('id')
    const pointsText = subRow.find('.score').text().trim()
    const points = parseInt(pointsText) || 0
    const author = subRow.find('.hnuser').text().trim() || 'unknown'

    const ageEl = subRow.find('.age')
    const titleAttr = ageEl.attr('title') || ''
    const ageText = ageEl.text().trim()

    let postedAt = new Date()
    if (titleAttr) {
      const isoDate = new Date(titleAttr)
      if (!isNaN(isoDate.getTime())) {
        postedAt = isoDate
      } else {
        const ts = parseInt(titleAttr, 10)
        if (!isNaN(ts)) {
          postedAt = new Date(ts * 1000)
        } else {
          postedAt = parsePostedAt(ageText)
        }
      }
    } else if (ageText) {
      postedAt = parsePostedAt(ageText)
    }

    if (title && url) {
      stories.push({ title, url, points, author, postedAt, hnId })
    }
  })

  console.log(`Scraped ${stories.length} stories from HN`)
  return stories
}

const saveStories = async (stories) => {
  // upsert on hnId if available, else on url
  const ops = stories.map((story) => ({
    updateOne: {
      filter: story.hnId ? { hnId: story.hnId } : { url: story.url },
      update: { $set: story },
      upsert: true,
    },
  }))

  const result = await Story.bulkWrite(ops, { ordered: false })
  console.log(`Saved: ${result.upsertedCount} new, ${result.modifiedCount} updated`)
  return result
}

const runScraper = async () => {
  const stories = await scrapeHackerNews()
  await saveStories(stories)
  return stories
}

module.exports = { runScraper, scrapeHackerNews, saveStories }