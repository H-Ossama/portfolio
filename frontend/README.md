# Portfolio Frontend

This is the frontend part of the portfolio application, containing all client-side code including HTML, CSS, and JavaScript files.

## Structure
- `index.html` - Main portfolio page
- `contact.html` - Contact form page
- `login.html` - Admin login page
- `dashboard.html` - Admin dashboard
- `assets/` - Images, certificates, and other static assets
- `styles/` - CSS files
- `scripts/` - JavaScript files
- `data/` - Static data files (projects, skills, translations)

## Features
- Responsive design for all devices
- Multiple themes (light, dark, winter)
- Multi-language support
- Interactive portfolio sections
- Contact form
- Admin dashboard for content management

## Getting Started

### Prerequisites
- Node.js (for development server)

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
# Start development server
npm run dev
# or
npm start
```

The frontend will be available at `http://localhost:8080`

### Production
For production, serve the files using any static file server like Nginx, Apache, or deploy to services like Netlify, Vercel, etc.

## Configuration
- Update `config.js` to point to your backend API URL
- Modify data files in `data/` directory for content updates
- Customize styles in `styles/` directory

## API Endpoints Used
The frontend communicates with the backend using these endpoints:
- `GET /api/personal-info` - Get personal information
- `POST /api/contact` - Submit contact form
- `GET /api/projects` - Get projects data
- `GET /api/skills` - Get skills data
- `PUT /api/personal-info` - Update personal info (admin only)
