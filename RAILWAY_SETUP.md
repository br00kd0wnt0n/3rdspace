# Railway Deployment Guide

## Step 1: Install Dependencies Locally (Optional - for testing)

```bash
npm install
```

## Step 2: Set Up Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`br00kd0wnt0n/3rdspace`**

## Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click **"New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will automatically create a PostgreSQL database and add the `DATABASE_URL` environment variable to your app

## Step 4: Verify Environment Variables

1. Click on your app service in Railway
2. Go to the **"Variables"** tab
3. Verify that `DATABASE_URL` is present (automatically added when you created the PostgreSQL database)
4. Add `NODE_ENV` with value `production`

Your variables should look like:
```
DATABASE_URL: postgresql://...  (auto-generated)
NODE_ENV: production
```

## Step 5: Deploy

1. Railway will automatically deploy your app after connecting the GitHub repo
2. Once deployed, click **"Generate Domain"** to get a public URL
3. Your site will be live at the generated domain (e.g., `https://3rdspace-production.up.railway.app`)

## Step 6: Test Email Signup

1. Visit your deployed site
2. Scroll to the bottom
3. Enter an email address
4. Click Submit
5. You should see a success message: "Thank you for signing up! We will be in touch soon."

## Step 7: View Collected Emails

To view the emails collected in your database:

1. In Railway, click on your **PostgreSQL** service
2. Go to the **"Data"** tab
3. You can run SQL queries to view emails:
   ```sql
   SELECT * FROM email_signups ORDER BY created_at DESC;
   ```

Or use the **"Connect"** tab to get connection details and use a database client like pgAdmin or TablePlus.

## Troubleshooting

- **Database not connecting**: Make sure `DATABASE_URL` is set in environment variables
- **500 errors on signup**: Check the logs in Railway (click on your app → Deployments → View Logs)
- **CORS errors**: The server is configured to accept requests from any origin in production

## Database Schema

The `email_signups` table structure:
- `id`: Serial primary key
- `email`: Unique email address (varchar 255)
- `created_at`: Timestamp of signup (defaults to current time)
