# Deployment Guide - Vercel + Supabase

This guide will help you deploy the Project-Ops Dashboard to Vercel with Supabase as the database (both free tiers).

## Prerequisites
- A GitHub account
- A Vercel account (free)
- A Supabase account (free)

---

## Step 1: Set Up Supabase Database

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in:
     - **Project name**: `priyam-ops-hub` (or any name you prefer)
     - **Database password**: Create a strong password (save it!)
     - **Region**: Choose closest to you
   - Click "Create new project" and wait ~2 minutes for setup

3. **Get Your Database Connection String**
   - Once the project is ready, go to **Settings** → **Database**
   - Scroll down to **Connection string**
   - Select **Session pooler** (this is important for Vercel!)
   - Copy the connection string - it looks like:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password

4. **Set Up Database Schema**
   - You'll run the schema migration after deploying to Vercel
   - Keep the connection string ready for the next step

---

## Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub

1. Create a new GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2.2 Import to Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Build Settings**
   - Vercel should auto-detect the framework as Vite
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`

4. **Add Environment Variables**
   
   Click "Environment Variables" and add the following:

   **Required:**
   - **Name**: `DATABASE_URL`  
     **Value**: Your Supabase connection string from Step 1.3
   
   - **Name**: `SESSION_SECRET`  
     **Value**: Generate a random string (32+ characters)
     You can generate one with: `openssl rand -base64 32`
     
   **Note**: The app is configured to trust Vercel's proxy for secure cookie handling
   
   - **Name**: `NODE_ENV`  
     **Value**: `production`

   **Environment**: Select "Production", "Preview", and "Development" for all

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)

---

## Step 3: Initialize Database Schema

After your first deployment:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to **Settings** → **Functions**

2. **Run Database Migration**
   
   Option A: Use Vercel CLI (Recommended)
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   npm run db:push
   ```

   Option B: Use Supabase SQL Editor
   - Go to your Supabase project
   - Navigate to **SQL Editor**
   - Create a new query and paste the schema from `db/schema.ts` converted to SQL
   - Alternatively, run the migration from your local machine:
     ```bash
     DATABASE_URL="your-supabase-connection-string" npm run db:push
     ```

3. **Verify Database**
   - In Supabase, go to **Table Editor**
   - You should see: `projects`, `issues`, `credentials`, `team_members`, `goals`, `users`
   - The default user will be created automatically on first API call

---

## Step 4: Test Your Deployment

1. **Visit Your Site**
   - Vercel will provide a URL like: `https://your-project.vercel.app`
   - Open it in your browser

2. **Login**
   - Username: `priyam`
   - Password: `priyam@2653`

3. **Verify Functionality**
   - Create a test project
   - Check if data is saved (refresh the page)
   - Try all CRUD operations

---

## Step 5: (Optional) Custom Domain

1. **In Vercel Dashboard**
   - Go to your project → **Settings** → **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string (Session Pooler) | Yes |
| `SESSION_SECRET` | Random secret key for session encryption | Yes |
| `NODE_ENV` | Set to `production` for deployment | Yes |

---

## Troubleshooting

### Database Connection Errors
- Verify you're using the **Session Pooler** connection string, not the direct connection
- Check if DATABASE_URL is set correctly in Vercel environment variables
- Ensure your Supabase project is active (free tier has limits)

### API Routes Not Working
- Check Vercel Function Logs: Project → Deployments → [Latest] → Functions
- Verify `/api` routes are working by testing: `https://your-site.vercel.app/api/auth/status`

### Build Failures
- Check build logs in Vercel
- Ensure all dependencies are in `package.json` (not just devDependencies)
- Verify TypeScript types are correct

### Session Issues
- Clear browser cookies
- Check SESSION_SECRET is set
- In production, cookies require HTTPS (Vercel provides this automatically)

---

## Cost Considerations

**Vercel Free Tier:**
- 100GB bandwidth/month
- 100 hours of serverless function execution/month
- Perfect for personal projects

**Supabase Free Tier:**
- 500MB database storage
- Unlimited API requests
- Paused after 1 week of inactivity (auto-resumes on access)

Both are free forever for personal use! 🎉

---

## Updating Your Deployment

To deploy updates:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Vercel automatically deploys the new version

---

## Support

If you encounter issues:
- Check Vercel Function Logs for backend errors
- Check Browser Console for frontend errors
- Verify Supabase database is active
- Ensure all environment variables are set correctly

---

## Security Notes

**Important:**
- Change the default login credentials after first deployment
- Never commit `.env` files to GitHub
- Use strong SESSION_SECRET in production
- Supabase automatically encrypts data at rest
- All connections use SSL/TLS in production

---

**Deployment Complete! 🚀**

Your Project-Ops Dashboard is now live on Vercel with Supabase database!
