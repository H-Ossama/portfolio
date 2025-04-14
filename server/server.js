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

// Import routes
const translationsRouter = require('./routes/translations');

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
        user: 'ebookrealm.info@gmail.com',
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

// API Routes
app.use('/api/translations', translationsRouter);

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

// Projects API
// Allow public GET access, but protect POST, PUT, DELETE
app.get('/api/projects', async (req, res) => { // Removed authenticateToken middleware
    try {
        const projects = await loadData('projects.json');
        // Ensure projects is always an array, even if loadData returns null or non-array
        res.json(Array.isArray(projects) ? projects : []);
    } catch (error) {
        console.error('Error in GET /api/projects:', error); // Add logging
        res.status(500).json({ error: 'Failed to load projects' });
    }
});

// Add this new route to get a single project by ID
app.get('/api/projects/:id', async (req, res) => {
    try {
        const projects = await loadData('projects.json');
        if (!Array.isArray(projects)) {
             console.error('Projects data is not an array or failed to load.');
             return res.status(500).json({ error: 'Failed to load projects data' });
        }
        const project = projects.find(p => p.id === req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error(`Error in GET /api/projects/${req.params.id}:`, error); // Add logging
        res.status(500).json({ error: 'Failed to load project details' });
    }
});


app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const projects = await loadData('projects.json') || [];
        // Ensure projects is treated as an array even if file was empty/corrupt initially
        const projectsArray = Array.isArray(projects) ? projects : [];

        const newProject = {
            id: Date.now().toString(), // Simple ID generation
            title: req.body.title,
            description: req.body.description,
            // Ensure technologies is saved as an array
            technologies: req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
            // Use the correct web-accessible path for the image
            image: req.file ? `/assets/images/${req.file.filename}` : (req.body.existingImage || null), // Keep existing if no new file
            githubLink: req.body.githubLink || '',
            liveLink: req.body.liveLink || '',
            createdAt: new Date().toISOString()
        };

        projectsArray.push(newProject); // Add to the array
        const saved = await saveData('projects.json', projectsArray); // Save the whole array

        if (!saved) {
             throw new Error('Failed to save project data');
        }
        res.status(201).json(newProject); // Send 201 status for creation
    } catch (error) {
        console.error('Error in POST /api/projects:', error); // Add logging
        // Handle potential Multer errors specifically
         if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: `Image upload error: ${error.message}` });
        }
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const projects = await loadData('projects.json') || [];
         if (!Array.isArray(projects)) {
             console.error('Projects data is not an array or failed to load for update.');
             return res.status(500).json({ error: 'Failed to load projects data for update' });
        }
        const index = projects.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // --- Refined Validation ---
        const { title, description, technologies, githubLink, liveLink, existingImage } = req.body;
        const errors = [];
        if (!title || title.trim() === '') errors.push('Title is required.');
        if (!description || description.trim() === '') errors.push('Description is required.');
        if (!technologies || technologies.trim() === '') errors.push('Technologies are required.');
        // Optional fields like githubLink, liveLink don't need validation here unless specific format is needed

        if (errors.length > 0) {
            // Log the received body for debugging
            console.error('Validation failed for PUT /api/projects/:id. Body:', req.body);
            console.error('Validation errors:', errors);
            // Send a more specific error message
            return res.status(400).json({ error: `Validation failed: ${errors.join(' ')}` });
        }
        // --- End Refined Validation ---


        const updatedProjectData = {
            ...projects[index], // Start with existing data
            title: title.trim(),
            description: description.trim(),
             // Ensure technologies is saved as an array
            technologies: technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
            githubLink: githubLink || '', // Allow empty strings
            liveLink: liveLink || '',   // Allow empty strings
            updatedAt: new Date().toISOString()
        };

        // --- Improved Image Handling ---
        console.log('PUT /api/projects/:id - req.file:', req.file); // Log file info
        console.log('PUT /api/projects/:id - req.body.existingImage:', existingImage); // Log existing image info

        if (req.file) {
            // A new file was uploaded
            updatedProjectData.image = `/assets/images/${req.file.filename}`;
            console.log(`New image uploaded: ${updatedProjectData.image}`);
            // Optionally: Delete the old image file if it exists and is different
            const oldImagePath = projects[index].image;
            if (oldImagePath && oldImagePath !== updatedProjectData.image) {
               try {
                   // *** CORRECTED PATH: Go up one level from server directory ***
                   const oldFilePath = path.join(__dirname, '..', 'public', oldImagePath);
                   // Use fs.promises.access to check existence asynchronously
                   await fs.access(oldFilePath); // Throws error if file doesn't exist or no permissions
                   await fs.unlink(oldFilePath);
                   console.log("Old image deleted:", oldFilePath);
               } catch (unlinkError) {
                   // Log specific errors for non-existence vs. other issues
                   if (unlinkError.code === 'ENOENT') {
                       console.warn("Old image file not found, skipping delete:", oldFilePath);
                   } else {
                       console.error("Error deleting old image:", oldFilePath, unlinkError);
                       // Decide if this error should prevent the update or just be logged
                       // For now, we'll log it but allow the update to proceed
                   }
               }
            }
        } else if (existingImage && existingImage !== 'undefined' && existingImage !== 'null' && existingImage.trim() !== '') {
            // No new file uploaded, keep the existing image path sent from the frontend
            updatedProjectData.image = existingImage;
            console.log(`Keeping existing image: ${updatedProjectData.image}`);
        } else {
             // No new file and no valid existing image path sent.
             // Keep the original image path from the loaded data if it exists, otherwise set to null.
             updatedProjectData.image = projects[index].image || null;
             console.log(`No new image and no valid existingImage received. Using original: ${updatedProjectData.image}`);
        }
        // --- End Improved Image Handling ---


        projects[index] = updatedProjectData; // Update the project in the array

        // *** ADDED LOG: Log data before saving ***
        console.log('Attempting to save updated project data:', updatedProjectData);

        const saved = await saveData('projects.json', projects); // Save the updated array

        if (!saved) {
             // Throw a more specific error if saving fails
             throw new Error('Failed to save updated project data to projects.json');
        }

        console.log('Project updated and saved successfully:', updatedProjectData);
        res.json(updatedProjectData); // Send back the updated project

    } catch (error) {
        // *** Enhanced Error Logging ***
        console.error(`Error in PUT /api/projects/${req.params.id}:`, error.message);
        console.error('Stack trace:', error.stack); // Log the full stack trace
         if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: `Image upload error: ${error.message}` });
        }
        // Ensure a response is always sent
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Failed to update project. Check server logs.' });
        }
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

// Use multer middleware for FormData parsing, including the optional 'avatar' file
app.put('/api/user/settings', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        const users = await loadData('users.json') || [];
        const index = users.findIndex(u => u.id === req.user.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Access text fields from req.body (parsed by multer)
        const { username, email, theme } = req.body; 
        if (!username || !email) { // Added email validation
            return res.status(400).json({ error: 'Username and Email are required' });
        }

        const updatedUser = {
            ...users[index],
            username,
            email, // Added email update
            settings: {
                ...users[index].settings,
                theme: theme || users[index].settings?.theme || 'dark' // Update theme if provided
            },
            updatedAt: new Date().toISOString()
        };

        // Handle password update
        if (req.body.password) {
            updatedUser.password = await bcrypt.hash(req.body.password, 10);
        }

        // Handle avatar update
        if (req.file) {
            // Optionally: delete old avatar file if it exists
            // ... (logic to find and delete old file path stored in users[index].avatar)
            updatedUser.avatar = `/assets/images/${req.file.filename}`; // Store the web-accessible path
        }

        // Update user in array
        users[index] = updatedUser;
        
        // Save to file
        await saveData('users.json', users);

        // Return user data without password
        const { password, ...userResponse } = updatedUser;
        res.json(userResponse);
    } catch (error) {
        console.error('Error updating user settings:', error);
        // Handle multer errors specifically if needed
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: `File upload error: ${error.message}` });
        }
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
app.get('/api/skills', async (req, res) => {
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

// Define specific routes like /unread-count BEFORE dynamic routes like /:id
app.get('/api/messages/unread-count', authenticateToken, async (req, res) => {
    console.log('GET /api/messages/unread-count hit'); // Keep logging
    try {
        const messages = await loadData('messages.json') || [];
        const count = messages.filter(m => !m.read).length;
        res.json({ count });
    } catch (error) {
        console.error('Error in /api/messages/unread-count:', error); // Keep enhanced error logging
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

app.get('/api/messages/:id', authenticateToken, async (req, res) => {
    console.log(`GET /api/messages/:id hit with id: ${req.params.id}`); // Add logging
    try {
        const messages = await loadData('messages.json') || [];
        const message = messages.find(m => m.id === req.params.id);
        
        if (!message) {
            console.log(`Message with id "${req.params.id}" not found.`); // Add logging
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        console.error(`Error in /api/messages/:id for id ${req.params.id}:`, error); // Add logging
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

// Password Reset Endpoints
app.post('/api/auth/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Find user by email
        const users = await loadData('users.json') || [];
        const user = users.find(u => u.email === email);
        
        // If no user found with this email, save the email for future reference and return an error
        if (!user) {
            // Save the attempted email in a recovery-attempts.json file
            const recoveryFile = path.join(__dirname, 'data', 'recovery-attempts.json');
            let attempts = [];
            
            try {
                // Try to read existing attempts
                const data = await fs.readFile(recoveryFile, 'utf8').catch(() => '[]');
                attempts = JSON.parse(data);
            } catch (err) {
                // If file doesn't exist or has invalid JSON, start with empty array
                attempts = [];
            }
            
            // Add this attempt
            attempts.push({
                email,
                timestamp: new Date().toISOString(),
                ip: req.ip || 'unknown'
            });
            
            // Save attempts
            await fs.writeFile(recoveryFile, JSON.stringify(attempts, null, 2));
            
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.status(404).json({ error: 'No account found with this email address.' });
        }
        
        // Generate reset token (expires in 1 hour)
        const resetToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Store token hash and expiry with user for verification (optional but recommended)
        // Hashing the token before storing adds another layer of security
        const hashedToken = await bcrypt.hash(resetToken, 10);
        user.resetToken = hashedToken;
        user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

        await saveData('users.json', users);

        // Construct reset URL (adjust domain/port as needed for your environment)
        const resetUrl = `http://localhost:${PORT}/reset-password.html?token=${resetToken}`;

        // Send the password reset link via email
        const mailOptions = {
            from: '"Your Portfolio Admin" <ebookrealm.info@gmail.com>', // Use a display name
            to: email,
            subject: 'Password Reset Request for Your Portfolio',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset for your portfolio account.</p>
                <p>Click the link below to set a new password. This link is valid for 1 hour:</p>
                <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${resetUrl}</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Password reset link sent to ${email}`);
            res.status(200).json({ message: 'If your email is registered, you will receive a password reset link shortly.' });
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Inform the user that email sending failed, but don't expose details
            res.status(500).json({ error: 'Could not send password reset email. Please contact support or try again later.' });
        }

    } catch (error) {
        console.error('Error in password reset request:', error);
        res.status(500).json({ error: 'An error occurred during the password reset process.' });
    }
});

// Modify the /api/auth/reset-password endpoint to verify the hashed token if stored
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        // Verify token signature and expiry
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired password reset token.' });
        }

        // Find user by ID from token
        const users = await loadData('users.json') || [];
        const userIndex = users.findIndex(u => u.id === decoded.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User associated with this token not found.' });
        }

        const user = users[userIndex];

        // Verify the token against the stored hash and check expiry (if stored)
        if (!user.resetToken || !user.resetTokenExpires || new Date() > new Date(user.resetTokenExpires)) {
             return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        const isTokenMatch = await bcrypt.compare(token, user.resetToken);
        if (!isTokenMatch) {
            return res.status(400).json({ error: 'Invalid password reset token.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset token fields
        users[userIndex].password = hashedPassword;
        users[userIndex].resetToken = null; // Clear the token after use
        users[userIndex].resetTokenExpires = null;

        // Save updated user data
        const saved = await saveData('users.json', users);
        if (!saved) {
            throw new Error('Failed to save updated user data.');
        }

        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'An error occurred while resetting the password.' });
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