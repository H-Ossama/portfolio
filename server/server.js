require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { initCronJobs } = require('./utils/cronManager');

const app = express();
const PORT = process.env.PORT || 3000; // Changed port to 3000

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve data files directly
app.use('/data', express.static(path.join(__dirname, 'data')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
});

// Apply rate limiting to contact endpoint
app.use('/api/contact', limiter);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/portfolio', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    initializeDefaultUser();
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Models
const Project = mongoose.model('Project', {
    title: String,
    description: String,
    image: String,
    githubLink: String,
    liveLink: String,
    technologies: [String]
});

const Education = mongoose.model('Education', {
    year: Number,
    title: String,
    institution: String,
    highlights: [String],
    skills: [String]
});

const Technology = mongoose.model('Technology', {
    category: {
        type: String,
        required: true,
        enum: ['Backend', 'Frontend', 'Database', 'DevOps', 'Tools & Frameworks']
    },
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    experience: {
        type: String,
        required: true
    },
    projectCount: {
        type: Number,
        default: 0
    },
    description: String,
    keyFeatures: [String]
});

const About = mongoose.model('About', {
    description: String,
    visitors: Number,
    cvViews: Number
});

const User = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    settings: {
        cursor: String,
        theme: String
    }
});

// JWT Secret
const JWT_SECRET = 'your-secret-key';

// Authentication Middleware
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Initialize default user if none exists
async function initializeDefaultUser() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const defaultPassword = 'admin123'; // You can change this
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            
            const defaultUser = new User({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                settings: {
                    cursor: 'default',
                    theme: 'dark'
                }
            });
            
            await defaultUser.save();
            console.log('Default user created - Username: admin, Password: admin123');
        }
    } catch (error) {
        console.error('Error creating default user:', error);
    }
}

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ossamahattan@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Add your app password here
    }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/assets/images'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type'));
            return;
        }
        cb(null, true);
    }
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Load data helper
const loadData = async (filename) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', filename));
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return null;
    }
};

// Save data helper
const saveData = async (filename, data) => {
    try {
        await fs.writeFile(
            path.join(__dirname, 'data', filename),
            JSON.stringify(data, null, 2)
        );
        return true;
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        return false;
    }
};

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await loadData('users.json');
        
        const user = users.find(u => u.username === username);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Projects API
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await loadData('projects.json');
        res.json(Array.isArray(projects) ? projects : []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load projects' });
    }
});

app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const projects = await loadData('projects.json') || [];
        const newProject = {
            id: Date.now().toString(),
            ...req.body,
            image: req.file ? `/assets/images/${req.file.filename}` : null,
            createdAt: new Date().toISOString()
        };

        if (!Array.isArray(projects)) {
            await saveData('projects.json', [newProject]);
        } else {
            projects.push(newProject);
            await saveData('projects.json', projects);
        }
        res.json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const projects = await loadData('projects.json') || [];
        const index = projects.findIndex(p => p.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updatedProject = {
            ...projects[index],
            ...req.body,
            image: req.file ? `/assets/images/${req.file.filename}` : projects[index].image,
            updatedAt: new Date().toISOString()
        };

        projects[index] = updatedProject;
        await saveData('projects.json', projects);
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const projects = await loadData('projects.json') || [];
        const filteredProjects = projects.filter(p => p.id !== req.params.id);
        
        if (projects.length === filteredProjects.length) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await saveData('projects.json', filteredProjects);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Education API
app.get('/api/education', authenticateToken, async (req, res) => {
    try {
        const education = await loadData('education.json');
        res.json(education || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load education entries' });
    }
});

app.post('/api/education', authenticateToken, async (req, res) => {
    try {
        const education = await loadData('education.json') || [];
        const newEntry = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };

        education.push(newEntry);
        await saveData('education.json', education);
        res.json(newEntry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create education entry' });
    }
});

app.put('/api/education/:id', authenticateToken, async (req, res) => {
    try {
        const education = await loadData('education.json') || [];
        const index = education.findIndex(e => e.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Education entry not found' });
        }

        const updatedEntry = {
            ...education[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        education[index] = updatedEntry;
        await saveData('education.json', education);
        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update education entry' });
    }
});

app.delete('/api/education/:id', authenticateToken, async (req, res) => {
    try {
        const education = await loadData('education.json') || [];
        const filteredEducation = education.filter(e => e.id !== req.params.id);
        
        if (education.length === filteredEducation.length) {
            return res.status(404).json({ error: 'Education entry not found' });
        }

        await saveData('education.json', filteredEducation);
        res.json({ message: 'Education entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete education entry' });
    }
});

// Technologies API
app.get('/api/technologies', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json');
        res.json(skills || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load technologies' });
    }
});

app.post('/api/technologies', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json') || [];
        const newSkill = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };

        skills.push(newSkill);
        await saveData('skills.json', skills);
        res.json(newSkill);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create technology' });
    }
});

app.put('/api/technologies/:id', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json') || [];
        const index = skills.findIndex(s => s.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Technology not found' });
        }

        const updatedSkill = {
            ...skills[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        skills[index] = updatedSkill;
        await saveData('skills.json', skills);
        res.json(updatedSkill);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update technology' });
    }
});

app.delete('/api/technologies/:id', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json') || [];
        const filteredSkills = skills.filter(s => s.id !== req.params.id);
        
        if (skills.length === filteredSkills.length) {
            return res.status(404).json({ error: 'Technology not found' });
        }

        await saveData('skills.json', filteredSkills);
        res.json({ message: 'Technology deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete technology' });
    }
});

// About API
app.get('/api/about', async (req, res) => {
    try {
        const about = await About.findOne();
        res.json(about);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.put('/api/about', auth, async (req, res) => {
    try {
        const about = await About.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(about);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// User Settings API
app.get('/api/user/settings', authenticateToken, async (req, res) => {
    try {
        const users = await loadData('users.json') || [];
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...settings } = user;
        res.json(settings);
    } catch (error) {
        console.error('Error loading user settings:', error);
        res.status(500).json({ error: 'Failed to load user settings' });
    }
});

app.put('/api/user/settings', authenticateToken, async (req, res) => {
    try {
        const users = await loadData('users.json') || [];
        const index = users.findIndex(u => u.id === req.user.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate required fields
        const { username, cursor } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const updatedUser = {
            ...users[index],
            username,
            cursor: cursor || 'default',
            updatedAt: new Date().toISOString()
        };

        if (req.body.password) {
            updatedUser.password = await bcrypt.hash(req.body.password, 10);
        }

        // Update user in array
        users[index] = updatedUser;
        
        // Save to file
        await saveData('users.json', users);

        // Return user data without password
        const { password, ...settings } = updatedUser;
        res.json(settings);
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Failed to update user settings' });
    }
});

// Theme preferences endpoint
app.put('/api/user/theme', authenticateToken, async (req, res) => {
    try {
        const { theme } = req.body;
        if (!theme) {
            return res.status(400).json({ error: 'Theme preference is required' });
        }

        const users = await loadData('users.json') || [];
        const index = users.findIndex(u => u.id === req.user.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[index].settings = {
            ...users[index].settings,
            theme,
            lastUpdated: new Date().toISOString()
        };

        await saveData('users.json', users);
        res.json({ theme });
    } catch (error) {
        console.error('Error updating theme preference:', error);
        res.status(500).json({ error: 'Failed to update theme preference' });
    }
});

// Skills routes
app.get('/api/skills', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json');
        res.json(skills || { skills: [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load skills data' });
    }
});

app.get('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json');
        if (!skills || !skills.skills) {
            return res.status(404).json({ error: 'Skills data not found' });
        }

        const skill = skills.skills.find(s => s.id === req.params.id);
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.json({ skill });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load skill data' });
    }
});

app.post('/api/skills', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json') || { skills: [] };
        const newSkill = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };

        skills.skills.push(newSkill);
        await saveData('skills.json', skills);
        res.json(newSkill);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create skill' });
    }
});

app.put('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json');
        if (!skills || !skills.skills) {
            return res.status(404).json({ error: 'Skills data not found' });
        }

        const index = skills.skills.findIndex(s => s.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        skills.skills[index] = {
            ...skills.skills[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        await saveData('skills.json', skills);
        res.json(skills.skills[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update skill' });
    }
});

app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        const skills = await loadData('skills.json');
        if (!skills || !skills.skills) {
            return res.status(404).json({ error: 'Skills data not found' });
        }

        const filteredSkills = skills.skills.filter(s => s.id !== req.params.id);
        if (filteredSkills.length === skills.skills.length) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        await saveData('skills.json', { skills: filteredSkills });
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, company, projectType, projectPriority, requirements, message } = req.body;

        // Create email content
        const mailOptions = {
            from: 'ossamahattan@gmail.com',
            to: 'ossamahattan@gmail.com',
            subject: `[IMPORTANT] New Project Inquiry from ${name}`,
            html: `
                <h2>New Project Inquiry</h2>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Company:</strong> ${company || 'Not specified'}</p>
                <p><strong>Project Type:</strong> ${projectType}</p>
                <p><strong>Priority:</strong> ${projectPriority}</p>
                <p><strong>Requirements:</strong> ${requirements.join(', ')}</p>
                <h3>Message:</h3>
                <p>${message}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
});

// Message creation endpoint
app.post('/api/messages', async (req, res) => {
    try {
        const messages = await loadData('messages.json') || [];
        const newMessage = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            read: false
        };

        messages.unshift(newMessage);
        await saveData('messages.json', messages);

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Portfolio Message from ${newMessage.name}`,
            html: `
                <h2>New Message Received</h2>
                <p><strong>From:</strong> ${newMessage.name} (${newMessage.email})</p>
                <p><strong>Company:</strong> ${newMessage.company || 'Not specified'}</p>
                <p><strong>Project Type:</strong> ${newMessage.projectType}</p>
                <p><strong>Timeline:</strong> ${newMessage.timeline}</p>
                <h3>Message:</h3>
                <p>${newMessage.message}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Analytics endpoints
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await loadData('stats.json') || {
            visitors: 0,
            cvViews: 0,
            cvDownloads: 0,
            messageCount: 0,
            monthlyVisitors: Array(12).fill(0)
        };

        // Get current message count
        const messages = await loadData('messages.json') || [];
        stats.messageCount = messages.length;

        // Save updated stats
        await saveData('stats.json', stats);
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

app.post('/api/stats/cv-view', async (req, res) => {
    try {
        await incrementCounter('cvViews');
        res.json({ success: true });
    } catch (error) {
        console.error('Error recording CV view:', error);
        res.status(500).json({ error: 'Failed to record CV view' });
    }
});

app.post('/api/stats/cv-download', async (req, res) => {
    try {
        await incrementCounter('cvDownloads');
        res.json({ success: true });
    } catch (error) {
        console.error('Error recording CV download:', error);
        res.status(500).json({ error: 'Failed to record CV download' });
    }
});

app.post('/api/stats/visitor', async (req, res) => {
    try {
        const stats = await loadData('stats.json') || {
            visitors: 0,
            cvViews: 0,
            cvDownloads: 0,
            messageCount: 0,
            monthlyVisitors: Array(12).fill(0)
        };

        // Increment total visitors
        stats.visitors += 1;

        // Update monthly visitors
        const currentMonth = new Date().getMonth();
        stats.monthlyVisitors[currentMonth] += 1;

        await saveData('stats.json', stats);
        res.json({ success: true });
    } catch (error) {
        console.error('Error recording visitor:', error);
        res.status(500).json({ error: 'Failed to record visitor' });
    }
});

// Message Management Routes
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await loadData('messages.json') || [];
        res.json(messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load messages' });
    }
});

app.get('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const messages = await loadData('messages.json') || [];
        const message = messages.find(m => m.id === req.params.id);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load message' });
    }
});

app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const messages = await loadData('messages.json') || [];
        const index = messages.findIndex(m => m.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }

        messages[index].read = true;
        messages[index].readAt = new Date().toISOString();
        
        await saveData('messages.json', messages);
        res.json(messages[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const messages = await loadData('messages.json') || [];
        const filteredMessages = messages.filter(m => m.id !== req.params.id);
        
        if (messages.length === filteredMessages.length) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await saveData('messages.json', filteredMessages);
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

app.get('/api/messages/unread-count', authenticateToken, async (req, res) => {
    try {
        const messages = await loadData('messages.json') || [];
        const count = messages.filter(m => !m.read).length;
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

// Helper functions for analytics
async function getVisitorCount() {
    try {
        const stats = await loadData('stats.json') || {};
        return stats.visitors || 0;
    } catch (error) {
        console.error('Error getting visitor count:', error);
        return 0;
    }
}

async function getCVViewCount() {
    try {
        const stats = await loadData('stats.json') || {};
        return stats.cvViews || 0;
    } catch (error) {
        console.error('Error getting CV view count:', error);
        return 0;
    }
}

async function getCVDownloadCount() {
    try {
        const stats = await loadData('stats.json') || {};
        return stats.cvDownloads || 0;
    } catch (error) {
        console.error('Error getting CV download count:', error);
        return 0;
    }
}

async function getMessageCount() {
    try {
        const messages = await loadData('messages.json') || [];
        return messages.length;
    } catch (error) {
        console.error('Error getting message count:', error);
        return 0;
    }
}

async function incrementCounter(counterName) {
    try {
        const stats = await loadData('stats.json') || {};
        stats[counterName] = (stats[counterName] || 0) + 1;
        await saveData('stats.json', stats);
    } catch (error) {
        console.error(`Error incrementing ${counterName}:`, error);
        throw error;
    }
}

// Error handling
app.use(errorHandler);

// Initialize cron jobs
initCronJobs();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});