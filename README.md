# Portfolio Project

A modern, full-stack portfolio website built with clean separation between frontend and backend.

## 🏗️ Project Structure

```
portfolio/
├── frontend/          # 🎨 Frontend Application
│   ├── index.html     # Main portfolio page
│   ├── assets/        # Images, certificates, etc.
│   ├── styles/        # CSS files
│   ├── scripts/       # JavaScript files
│   ├── data/          # Static data (projects, skills)
│   └── package.json   # Frontend dependencies
│
├── backend/           # ⚙️ Backend API Server
│   ├── server.js      # Main server file
│   ├── data/          # Server data files
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── package.json   # Backend dependencies
│
├── docs/              # 📚 Documentation
├── start-dev.bat      # 🚀 Development startup script
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Development

**Option 1: Quick Start (Recommended)**
```bash
# Double-click this file to start both servers:
start-dev.bat
```

**Option 2: Manual Start**
```bash
# Terminal 1 - Start Backend
cd backend
npm install
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm install
npm run dev
```

### Access URLs
- 🌐 **Portfolio Website:** http://localhost:8080
- 🔌 **Backend API:** http://localhost:3001

## ✨ Features

### Frontend
- 📱 Responsive design for all devices
- 🎨 Multiple themes (light, dark, winter)
- 🌍 Multi-language support
- 📧 Contact form
- 👨‍💼 Admin dashboard
- ⚡ Fast loading and optimized performance

### Backend
- 🔄 RESTful API endpoints
- 📧 Contact form handling
- 👤 Personal information management
- 📊 Projects and skills data serving
- 🔐 Admin authentication
- 📁 Message archiving
- 🛡️ Security middleware

## 📡 API Endpoints

### Public Endpoints
- `GET /api/personal-info` - Get personal information
- `GET /api/projects` - Get projects data
- `GET /api/skills` - Get skills data
- `POST /api/contact` - Submit contact form
- `POST /api/stats/visitor` - Record visitor statistics

### Admin Endpoints
- `GET /api/messages` - Get all messages (admin only)
- `PUT /api/personal-info` - Update personal info (admin only)

## 🛠️ Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive Grid & Flexbox
- Local Storage for settings
- HTTP Server for development

### Backend
- Node.js & Express.js
- JSON file storage
- CORS middleware
- Security headers
- Rate limiting

## 🚀 Deployment

### Frontend Deployment
Deploy the `frontend/` directory to static hosting:
- **Netlify** (Recommended)
- **Vercel**
- **GitHub Pages**
- **AWS S3 + CloudFront**

### Backend Deployment
Deploy the `backend/` directory to Node.js hosting:
- **Railway** (Recommended)
- **Heroku**
- **DigitalOcean App Platform**
- **AWS EC2**

### Environment Variables
Create `.env` file in backend directory:
```env
PORT=3001
NODE_ENV=production
```

## 📖 Documentation

Additional documentation can be found in the `docs/` directory:
- API Configuration
- Mobile Improvements
- Security Guidelines
- Development Notes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:

1. **Backend won't start:** Check if port 3001 is available
2. **Frontend can't connect:** Ensure backend is running on port 3001
3. **Dependencies issues:** Run `npm install` in both directories

For more help, check the documentation in the `docs/` folder.

---

Built with ❤️ using modern web technologies
