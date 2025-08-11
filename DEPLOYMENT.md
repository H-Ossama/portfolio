# Portfolio Deployment Guide

This portfolio application is now configured for deployment with Nixpacks and Railway.

## Project Structure
```
portfolio/
├── backend/           # Express.js server
├── frontend/          # Static frontend files
├── package.json       # Root package.json for deployment
├── Procfile          # Process definition for deployment
├── nixpacks.toml     # Nixpacks configuration
├── railway.toml      # Railway-specific configuration
└── .node-version     # Node.js version specification
```

## Deployment Configuration

### Required Environment Variables
Make sure to set these environment variables in your Railway dashboard:

- `MONGO_URI` - MongoDB connection string
- `EMAIL_USER` - Gmail address for contact form
- `EMAIL_PASSWORD` - Gmail app password for SMTP

### Files Created/Updated for Deployment

1. **package.json** - Root package configuration for Nixpacks detection
2. **Procfile** - Defines how to start the application
3. **nixpacks.toml** - Nixpacks build configuration
4. **railway.toml** - Railway deployment settings
5. **.node-version** - Specifies Node.js version 18
6. **.env.example** - Documents required environment variables

### How It Works

1. Nixpacks detects the Node.js project from the root `package.json`
2. It installs dependencies from `backend/package.json`
3. The application starts with `node backend/server.js`
4. Static frontend files are served from the Express server

## Local Development

```bash
# Install backend dependencies
cd backend && npm install

# Start development server
npm run dev

# Or start production server
npm start
```

## Deployment Steps

1. Push these changes to your repository
2. Set the required environment variables in Railway
3. Deploy - Nixpacks should now successfully build your application

The deployment will serve both your backend API and frontend static files from the same Express server.
