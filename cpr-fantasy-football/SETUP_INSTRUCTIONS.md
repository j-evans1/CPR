# Match Submission Setup Instructions

## Step 1: Set up Vercel Postgres

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a database name (e.g., "cpr-fantasy-db")
6. Select a region close to you
7. Click "Create"

## Step 2: Get Your Database Connection String

1. After creating the database, go to the ".env.local" tab
2. Copy all the environment variables shown
3. Create a file called `.env.local` in your `cpr-fantasy-football` directory
4. Paste the environment variables into this file

It should look something like:
```
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

## Step 3: Initialize the Database

1. Start your dev server: `npm run dev`
2. Visit: http://localhost:3000/api/init-db
3. You should see: `{"success":true,"message":"Database initialized"}`

## Step 4: Test the Feature

1. Go to http://localhost:3000/matches
2. Find the "TESTING" match
3. Click on it to expand
4. Click "Submit Match Data"
5. Fill in player stats
6. Submit
7. The match should now show "SUBMITTED" badge
8. Players will show "Pending" for points

## Step 5: Admin Panel

1. Go to http://localhost:3000/admin
2. Enter password: `slugfest`
3. View all submissions
4. Copy data to Google Sheets
5. Click "Clear Submission" to remove from database
6. App will now show Google Sheets data with calculated points

## Notes

- The `.env.local` file is already in `.gitignore` so it won't be committed
- Admin page is not linked in navigation (secret page)
- Submitted data takes priority over Google Sheets data until cleared
- Fantasy points show as "Pending" for submitted matches
