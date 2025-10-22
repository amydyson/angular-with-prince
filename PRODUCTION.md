# Production Deployment Guide

This guide shows you how to deploy your Angular + PrinceXML app to production.

## 🚀 Quick Start Options

### Option 1: Heroku (Easiest)
```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Add Node.js buildpack
heroku buildpacks:set heroku/nodejs

# 3. Create Procfile
echo "web: node server.js" > Procfile

# 4. Deploy
git add .
git commit -m "Production ready"
git push heroku main
```

### Option 2: DigitalOcean App Platform
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set run command: `node server.js`
4. Deploy automatically

### Option 3: Traditional Server (VPS/Dedicated)
See detailed instructions below.

## 📋 Prerequisites for Production

### 1. PrinceXML Installation on Server

**Ubuntu/Debian:**
```bash
# Download and install PrinceXML
wget https://www.princexml.com/download/prince_15.1-1_ubuntu22.04_amd64.deb
sudo dpkg -i prince_15.1-1_ubuntu22.04_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
prince --version  # Verify installation
```

**CentOS/RHEL:**
```bash
wget https://www.princexml.com/download/prince-15.1-1.centos8.x86_64.rpm
sudo rpm -ivh prince-15.1-1.centos8.x86_64.rpm
prince --version
```

**Windows Server:**
1. Download installer from https://www.princexml.com/download/
2. Run installer as Administrator
3. Add to system PATH
4. Verify: `prince --version`

## 🔧 Environment Setup

### Environment Variables
Set these on your production server:

```bash
# Required
NODE_ENV=production
PORT=80  # or 443 for HTTPS

# Optional
FRONTEND_URL=https://your-domain.com  # If frontend and backend are separate
```

### For Heroku:
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=80
```

## 🏗️ Build Process

### Local Build & Test
```bash
# Build for production
npm run build

# Test production build locally
NODE_ENV=production PORT=3000 node server.js
# Visit http://localhost:3000
```

### Production Deployment

**Single Server Deployment (Recommended):**
```bash
# 1. Build the application
npm run build

# 2. Copy files to server
scp -r dist/ package.json server.js user@your-server:/path/to/app/

# 3. Install dependencies on server
ssh user@your-server
cd /path/to/app
npm install --only=production

# 4. Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "angular-prince-app"
pm2 save
pm2 startup
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

# Install PrinceXML
RUN apk add --no-cache wget
RUN wget https://www.princexml.com/download/prince-15.1-alpine3.15-x86_64.tar.gz
RUN tar -xzf prince-15.1-alpine3.15-x86_64.tar.gz
RUN cp -r prince-15.1-alpine3.15-x86_64/* /usr/local/

# App setup
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Build and copy
COPY . .
RUN npm run build

EXPOSE 3001
CMD ["node", "server.js"]
```

### Docker Commands
```bash
# Build image
docker build -t angular-prince-app .

# Run container
docker run -p 80:3001 -e NODE_ENV=production angular-prince-app
```

## ☁️ Cloud Platform Specific Instructions

### Heroku Deployment

1. **Create Procfile:**
```
web: node server.js
```

2. **Deploy:**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create and deploy to Heroku
heroku create your-app-name
git push heroku main

# Set environment
heroku config:set NODE_ENV=production
```

### AWS EC2 Deployment

1. **Launch Ubuntu instance**
2. **Install dependencies:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PrinceXML (see above)
# Install PM2
sudo npm install -g pm2
```

3. **Deploy application:**
```bash
# Copy files
scp -r dist/ package.json server.js ubuntu@your-ec2-ip:/home/ubuntu/app/

# SSH and start
ssh ubuntu@your-ec2-ip
cd /home/ubuntu/app
npm install --only=production
pm2 start server.js
```

### DigitalOcean App Platform

1. **Connect GitHub repository**
2. **Configure build settings:**
   - Build Command: `npm run build`
   - Run Command: `node server.js`
   - Environment Variables: `NODE_ENV=production`

## 🔒 Security & Performance

### SSL/HTTPS Setup
```javascript
// Add to server.js for HTTPS
const https = require('https');
const fs = require('fs');

if (process.env.SSL_KEY && process.env.SSL_CERT) {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT)
  };
  
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
}
```

### Performance Optimizations
```javascript
// Add to server.js
const compression = require('compression');
app.use(compression()); // Gzip compression

// Cache static assets
app.use(express.static('dist/angular-with-prince', {
  maxAge: '1y',
  etag: false
}));
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor performance
pm2 monit

# Restart application
pm2 restart angular-prince-app

# View process status
pm2 status
```

### Health Checks
Your app includes a health check endpoint: `GET /api/health`

## 🔧 Troubleshooting

### Common Issues

1. **PrinceXML not found**
   - Ensure prince binary is in PATH
   - Check installation: `prince --version`

2. **Port conflicts**
   - Use environment PORT variable
   - Check: `netstat -tulpn | grep :80`

3. **CORS errors**
   - Set FRONTEND_URL environment variable
   - Check server CORS configuration

4. **Build failures**
   - Ensure Node.js version matches (18.x)
   - Clear node_modules: `rm -rf node_modules && npm install`

### Log Locations
- **PM2 logs**: `~/.pm2/logs/`
- **Heroku logs**: `heroku logs --tail`
- **Docker logs**: `docker logs container-name`

## 🎯 Production Checklist

- [ ] PrinceXML installed and working
- [ ] Environment variables set
- [ ] Build process successful
- [ ] SSL/HTTPS configured
- [ ] Health checks working
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Domain pointed to server
- [ ] DNS configured

## 📱 Testing Production

1. **Build and test locally:**
```bash
npm run build
NODE_ENV=production node server.js
```

2. **Test all features:**
   - PDF generation
   - PDF preview
   - File downloads
   - Error handling

3. **Performance testing:**
   - Load testing with multiple concurrent PDF generations
   - Memory usage monitoring
   - Response time analysis

Your Angular + PrinceXML app is now ready for production! 🚀