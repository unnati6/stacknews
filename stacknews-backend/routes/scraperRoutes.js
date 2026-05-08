const express = require('express')
const router = express.Router()
const { triggerScrape } = require('../controllers/scraperController')

// POST /api/scrape
router.post('/', triggerScrape)

module.exports = router
