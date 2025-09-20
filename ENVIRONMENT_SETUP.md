# Environment Variables Setup

## Frontend Environment Variables

Create a `.env` file in the root of the GradeMate directory with the following variables:

```bash
# API Configuration
# For development, use your local backend URL
VITE_API_BASE_URL=http://127.0.0.1:8000

# For production, use your deployed backend URL
# VITE_API_BASE_URL=https://your-backend-url.com

# Example for Render deployment:
# VITE_API_BASE_URL=https://your-app-name.onrender.com
```

## Vercel Deployment

When deploying to Vercel, add the environment variable in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add `VITE_API_BASE_URL` with your production backend URL

**For Render backend deployment:**
- Use format: `https://your-render-app-name.onrender.com`

## Development vs Production

- **Development**: Use `http://127.0.0.1:8000` (local backend)
- **Production**: Use your Render backend URL (e.g., `https://grademate-backend.onrender.com`)

The frontend will automatically use the environment variable if set, otherwise it defaults to the local development URL.

## Complete Setup Flow

1. **Deploy backend to Render** (follow Backend/ENVIRONMENT_SETUP.md)
2. **Get your Render URL** (e.g., `https://grademate-backend.onrender.com`)
3. **Update Vercel environment variable** with your Render URL
4. **Redeploy frontend** (Vercel will automatically redeploy when you update environment variables)
