# Portfolio Backend

This is the backend repository for the portfolio website. It contains the server-side code, API endpoints, and data management for the portfolio.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env` file with the following variables:

```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your-jwt-secret-key
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
```

3. Start the development server:

```bash
npm run dev
```

4. For production:

```bash
npm start
```

## API Endpoints

The backend provides the following API endpoints:

- `/api/projects` - Get all projects
- `/api/education` - Get education data
- `/api/skills` - Get skills data
- `/api/messages` - Contact form submissions
- `/api/login` - Authentication for admin dashboard
- And more...

## Directory Structure

- `server.js` - Main server file
- `init-db.js` - Database initialization script
- `data/` - JSON data files
- `middleware/` - Express middleware
- `models/` - Mongoose models
- `routes/` - API routes
- `services/` - Business logic
- `utils/` - Utility functions

## Development

Make sure MongoDB is running if using MongoDB database functionality. For static JSON file storage, no additional setup is required.
