# Heroku Deployment Script

## Prerequisites
1. Heroku CLI installed ✅
2. Git repository ready ✅

## Manual Deployment Steps

### Step 1: Login to Heroku
```bash
heroku login
```
This will open a browser window. Log in with your Heroku credentials.

### Step 2: Create Heroku App
```bash
heroku create angular-with-prince-backend
```
Note: Replace "angular-with-prince-backend" with your preferred app name.
The app name must be unique across all Heroku apps.

### Step 3: Add Buildpacks (IMPORTANT - Order matters!)
```bash
heroku buildpacks:add --index 1 heroku-community/apt
heroku buildpacks:add --index 2 heroku/nodejs
```

### Step 4: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-amplify-app.amplifyapp.com
```
Replace "your-amplify-app" with your actual AWS Amplify domain.

### Step 5: Deploy to Heroku
```bash
git push heroku main
```

### Step 6: Check Deployment
```bash
heroku logs --tail
```

### Step 7: Test Your Backend
After deployment, your backend will be available at:
https://your-app-name.herokuapp.com/api/generate-pdf

### Step 8: Update Frontend Environment
Once deployed, update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-actual-heroku-app-name.herokuapp.com/api'
};
```

Then commit and push to trigger AWS Amplify rebuild:
```bash
git add .
git commit -m "Update production API URL"
git push origin main
```

## Troubleshooting

### If PrinceXML installation fails:
1. Check heroku logs: `heroku logs --tail`
2. Verify buildpacks are in correct order: `heroku buildpacks`
3. Check that Aptfile dependencies are correct

### If CORS errors occur:
1. Verify FRONTEND_URL environment variable is set correctly
2. Check that your Amplify URL matches the CORS configuration

### If app won't start:
1. Check package.json has correct start script: `"start": "node server.js"`
2. Verify Procfile exists (we created one): `web: node server.js`
3. Check heroku logs for specific errors

## Quick Command Reference

```bash
# View app logs
heroku logs --tail

# View app info
heroku apps:info

# View environment variables
heroku config

# Restart app
heroku restart

# Open app in browser
heroku open
```