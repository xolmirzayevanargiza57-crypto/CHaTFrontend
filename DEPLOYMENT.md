# Frontend Deployment

## Vercel Deployment

### Steps:

1. **Push to GitHub:**
```bash
git push -u origin main
```

2. **Create Vercel Account:**
   - Go to https://vercel.com
   - Sign up with GitHub

3. **Import Project:**
   - Click "Add New..." and select "Project"
   - Select your GitHub repository (CHaTFrontend)

4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   - Go to Settings > Environment Variables
   - Add: `VITE_API_URL` = `https://chat-backend.onrender.com`
     (Replace with your actual Render backend URL)

6. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy from the main branch

### Environment Variables (.env file for local):
```
VITE_API_URL=http://localhost:5000  # For local development
# For production, this is set in Vercel dashboard
```

### Important Notes:
- Keep the `.env.example` file in the repo
- Never commit the `.env.local` file to GitHub
- Use Vercel's dashboard for production environment variables
- The frontend will be available at: `https://chatapp.vercel.app` (or your custom domain)
- Set `CLIENT_URL` in backend to match your Vercel frontend URL

### After Both Deployments:

1. Update Backend's `CLIENT_URL` environment variable to your Vercel frontend URL
2. Update Frontend's `VITE_API_URL` environment variable to your Render backend URL
3. Both services should now communicate properly
