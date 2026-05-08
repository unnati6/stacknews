# StackNews — Backend

Node.js + Express + MongoDB backend for StackNews, with a Hacker News scraper.

## Tech Stack

- **Node.js** + **Express** — REST API
- **MongoDB** + **Mongoose** — Database & ODM
- **Cheerio** + **Axios** — Web scraping
- **JWT** + **bcryptjs** — Authentication

## Folder Structure

```
stacknews-backend/
├── config/
│   ├── db.js           # MongoDB connection
│   └── scraper.js      # HN scraper logic (axios + cheerio)
├── controllers/
│   ├── authController.js
│   ├── storyController.js
│   └── scraperController.js
├── middleware/
│   └── authMiddleware.js   # JWT protect middleware
├── models/
│   ├── User.js
│   └── Story.js
├── routes/
│   ├── authRoutes.js
│   ├── storyRoutes.js
│   └── scraperRoutes.js
├── server.js
├── .env.example
└── package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` file

```bash
cp .env.example .env
```

Fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stacknews
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Run the server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

On startup, the server will:
1. Connect to MongoDB
2. Automatically scrape the top 10 Hacker News stories

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Stories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stories` | Optional | Get all stories (sorted by points) |
| GET | `/api/stories?page=1&limit=10` | Optional | Paginated stories |
| GET | `/api/stories/:id` | Optional | Get single story |
| GET | `/api/stories/bookmarks` | Required | Get user's bookmarked stories |
| POST | `/api/stories/:id/bookmark` | Required | Toggle bookmark |

### Scraper

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Manually trigger HN scrape |

## How the Scraper Works

The scraper (`config/scraper.js`) uses:
- **Axios** to fetch the raw HTML from `https://news.ycombinator.com`
- **Cheerio** to parse HN's table layout and extract:
  - `title` — Story headline
  - `url` — Link (absolute or HN-internal)
  - `points` — Upvote count from `.score`
  - `author` — Username from `.hnuser`
  - `postedAt` — Parsed from `.age` title attribute
- **Upsert** to avoid duplicates — re-scraping updates existing stories
