# Heroku Deployment Guide

This guide will help you deploy the backend server with PrinceXML support to Heroku.

## Prerequisites

1. Install the Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create a Heroku account: https://signup.heroku.com/

## Step 1: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create a new Heroku app (replace 'your-app-name' with a unique name)
heroku create your-app-name

# Example:
heroku create angular-prince-backend
```

## Step 2: Configure Buildpacks

The app requires two buildpacks: apt (for system dependencies) and nodejs.

```bash
# Add the apt buildpack for installing system dependencies
heroku buildpacks:add --index 1 heroku-community/apt

# Add the Node.js buildpack
heroku buildpacks:add --index 2 heroku/nodejs
```

## Step 3: Set Environment Variables

```bash
# Set the frontend URL for CORS (replace with your actual Amplify URL)
heroku config:set FRONTEND_URL=https://your-amplify-app.amplifyapp.com

# Set Node environment
heroku config:set NODE_ENV=production
```

## Step 4: Deploy

```bash
# Deploy to Heroku
git push heroku main
```

## Step 5: Verify Deployment

```bash
# Check logs
heroku logs --tail

# Open your app
heroku open
```

Your backend will be available at: `https://your-app-name.herokuapp.com`

## Step 6: Update Frontend Configuration

Once deployed, you need to update your frontend to point to the Heroku backend.

Your backend API endpoint will be: `https://your-app-name.herokuapp.com/api`

## Troubleshooting

### If deployment fails:

1. Check logs: `heroku logs --tail`
2. Verify buildpacks: `heroku buildpacks`
3. Check environment variables: `heroku config`

### Common issues:

1. **PrinceXML installation fails**: Check the logs for specific error messages
2. **CORS errors**: Make sure FRONTEND_URL is set correctly
3. **Memory issues**: Heroku free tier has 512MB RAM limit

### Testing the API

You can test your deployed backend:

```bash
# Test the API endpoint
curl https://your-app-name.herokuapp.com/api/generate-pdf \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test</h1>","options":{}}'
```

## Next Steps

After successful deployment:

1. Update your frontend environment to point to the Heroku URL
2. Redeploy your frontend to AWS Amplify
3. Test the complete flow from frontend to backend