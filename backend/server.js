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
const PORT = process.env.PORT || 3001; // Changed port to 3001

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

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

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    avatar: { type: String, default: null }, // Added avatar field
    settings: {
        cursor: { type: String, default: 'default' },
        theme: { type: String, default: 'dark' }
    },
    emailTemplates: {
        passwordReset: {
            subject: String,
            headerColor: String,
            buttonColor: String,
            logoUrl: String,
            customMessage: String
        }
    },
    resetToken: String,
    resetTokenExpires: Date
});

const User = mongoose.model('User', UserSchema);

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
            // Hash the default password before saving
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const defaultUser = new User({
                username: 'admin',
                password: hashedPassword, // Store the hashed password
                email: 'admin@example.com', // Default email
                settings: { cursor: 'default', theme: 'dark' }
            });
            await defaultUser.save();
            console.log('Default user created in MongoDB - Username: admin, Password: admin123');
        }
    } catch (error) {
        console.error('Error creating default user in MongoDB:', error);
    }
}

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ebookrealm.info@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Add your app password here
    },
    // Set empty name to prevent Google from showing the sender's profile picture
    name: ''
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

// Multer configuration for certificates
const certificateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/assets/certificates'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadCertificate = multer({
    storage: certificateStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for certificates
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type. Only PDF and image files are allowed.'));
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

// --- End Improved Image Handling ---

// User Settings API
app.get('/api/user/settings', authenticateToken, async (req, res) => {
    try {
        // Log the received user payload from the token for debugging
        console.log('Decoded token payload in /api/user/settings:', req.user);

        // Check if the expected userId field exists in the decoded token
        if (!req.user || !req.user.userId) {
             console.error('User ID (userId) not found in token payload:', req.user);
             // Return 403 Forbidden because the token is missing necessary info
             return res.status(403).json({ error: 'Invalid token payload: User ID missing.' });
        }

        const userId = req.user.userId;
        console.log(`Attempting to find user with ID: ${userId}`); // Log the ID being used

        const user = await User.findById(userId);

        if (!user) {
            // Log that the specific user ID was not found
            console.error(`User not found in database for ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data without the password
        const userData = {
            _id: user._id, // Include ID if needed by frontend
            username: user.username,
            email: user.email,
            avatar: user.avatar, // Now this field exists
            settings: user.settings || { theme: 'dark' }, // Default settings if somehow missing
            emailTemplates: user.emailTemplates
        };

        res.json(userData);
    } catch (error) {
        // Catch potential errors during findById (e.g., invalid ID format)
        const attemptedUserId = req.user?.userId || 'unknown';
        console.error(`Error fetching user settings for user ID ${attemptedUserId}:`, error);

        // Check if the error is due to a CastError (invalid ObjectId format)
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
             console.error(`Invalid ObjectId format for user ID: ${attemptedUserId}`);
             return res.status(400).json({ error: 'Invalid user ID format in token.' });
        }
        // Generic server error for other issues
        res.status(500).json({ error: 'Failed to fetch user settings due to server error.' });
    }
});

app.put('/api/user/settings', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        // Check for userId in token payload
        if (!req.user || !req.user.userId) {
            console.error('User ID (userId) not found in token payload for PUT:', req.user);
            return res.status(403).json({ error: 'Invalid token payload: User ID missing.' });
        }
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            console.error(`User not found for update with ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields if provided
        if (req.body.username) user.username = req.body.username.trim();
        if (req.body.email) user.email = req.body.email.trim().toLowerCase();
        if (req.body.theme) {
            if (!user.settings) user.settings = {}; // Initialize if missing
            user.settings.theme = req.body.theme;
        }

        // Handle password update if provided
        if (req.body.password && req.body.password.trim() !== '') {
            user.password = await bcrypt.hash(req.body.password.trim(), 10);
        }

        // Handle avatar upload if provided
        if (req.file) {
            const newAvatarUrl = `/assets/images/${req.file.filename}`;
            const oldAvatarPath = user.avatar ? path.join(__dirname, '..', 'public', user.avatar) : null;

            user.avatar = newAvatarUrl; // Update user model

            // Delete old avatar if it exists and is different
            if (oldAvatarPath && oldAvatarPath !== path.join(__dirname, '..', 'public', newAvatarUrl)) {
                try {
                    await fs.access(oldAvatarPath);
                    await fs.unlink(oldAvatarPath);
                    console.log(`Deleted old avatar: ${oldAvatarPath}`);
                } catch (unlinkError) {
                    if (unlinkError.code !== 'ENOENT') { // Ignore if file not found
                       console.error(`Error deleting old avatar ${oldAvatarPath}:`, unlinkError);
                    }
                }
            }
        } else if (req.body.removeAvatar === 'true') {
             // Handle explicit avatar removal
             const oldAvatarPath = user.avatar ? path.join(__dirname, '..', 'public', user.avatar) : null;
             user.avatar = null;
             if (oldAvatarPath) {
                 try {
                    await fs.access(oldAvatarPath);
                    await fs.unlink(oldAvatarPath);
                    console.log(`Removed avatar: ${oldAvatarPath}`);
                 } catch (unlinkError) {
                    if (unlinkError.code !== 'ENOENT') {
                       console.error(`Error removing avatar ${oldAvatarPath}:`, unlinkError);
                    }
                 }
             }
        }

        await user.save();

        // Return updated user data without password
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            settings: user.settings
            // Exclude emailTemplates unless needed
        };

        res.json({ message: 'Settings updated successfully', user: userData });

    } catch (error) {
        const attemptedUserId = req.user?.userId || 'unknown';
        console.error(`Error updating user settings for ID ${attemptedUserId}:`, error);
         if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: `Avatar upload error: ${error.message}` });
        }
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
             return res.status(400).json({ error: 'Invalid user ID format in token.' });
        }
        // Check for validation errors (e.g., from Mongoose schema)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update settings due to server error.' });
    }
});

// Email Template settings
app.get('/api/email-templates/password-reset', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return default template if none exists
        const defaultTemplate = {
            subject: 'Reset Your Portfolio Password',
            headerColor: '#111111',
            buttonColor: 'linear-gradient(135deg, #d4af37 0%, #f2d068 100%)',
            logoUrl: 'https://i.imgur.com/yJDxBo7.png',
            customMessage: 'We received a password reset request for your portfolio dashboard account. To set a new password, simply click the button below:'
        };
        
        const template = user.emailTemplates?.passwordReset || defaultTemplate;
        res.json(template);
    } catch (error) {
        console.error('Error fetching email template:', error);
        res.status(500).json({ error: 'Failed to fetch email template' });
    }
});

app.put('/api/email-templates/password-reset', authenticateToken, async (req, res) => {
    try {
        const { subject, headerColor, buttonColor, logoUrl, customMessage } = req.body;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Initialize emailTemplates if needed
        if (!user.emailTemplates) {
            user.emailTemplates = {};
        }
        
        // Update template
        user.emailTemplates.passwordReset = {
            subject: subject || 'Reset Your Portfolio Password',
            headerColor: headerColor || '#111111',
            buttonColor: buttonColor || 'linear-gradient(135deg, #d4af37 0%, #f2d068 100%)',
            logoUrl: logoUrl || 'https://i.imgur.com/yJDxBo7.png',
            customMessage: customMessage || 'We received a password reset request for your portfolio dashboard account. To set a new password, simply click the button below:'
        };
        
        await user.save();
        res.json(user.emailTemplates.passwordReset);
    } catch (error) {
        console.error('Error updating email template:', error);
        res.status(500).json({ error: 'Failed to update email template' });
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

// Public Education API (for main portfolio page)
app.get('/api/public/education', async (req, res) => {
    try {
        const education = await loadData('education.json');
        res.json(education || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load education entries' });
    }
});

// Education API (protected)
app.get('/api/education', authenticateToken, async (req, res) => {
    try {
        const education = await loadData('education.json');
        res.json(education || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load education entries' });
    }
});

app.get('/api/education/:id', authenticateToken, async (req, res) => {
    try {
        const education = await loadData('education.json') || [];
        const entry = education.find(e => e.id === req.params.id);
        
        if (!entry) {
            return res.status(404).json({ error: 'Education entry not found' });
        }
        
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load education entry' });
    }
});

app.post('/api/education', authenticateToken, uploadCertificate.single('certificate'), async (req, res) => {
    try {
        const education = await loadData('education.json') || [];
        
        // Parse arrays from JSON strings (sent by FormData)
        let highlights = [];
        let skills = [];
        
        try {
            highlights = req.body.highlights ? JSON.parse(req.body.highlights) : [];
        } catch (e) {
            highlights = req.body.highlights ? req.body.highlights.split(',').map(h => h.trim()) : [];
        }
        
        try {
            skills = req.body.skills ? JSON.parse(req.body.skills) : [];
        } catch (e) {
            skills = req.body.skills ? req.body.skills.split(',').map(s => s.trim()) : [];
        }
        
        const newEntry = {
            id: Date.now().toString(),
            year: parseInt(req.body.year),
            title: req.body.title,
            institution: req.body.institution,
            description: req.body.description || '',
            highlights: highlights,
            skills: skills,
            isCurrent: req.body.isCurrent === 'true',
            createdAt: new Date().toISOString()
        };
        
        // Handle certificate upload
        if (req.file) {
            newEntry.certificate = `/assets/certificates/${req.file.filename}`;
        }

        education.push(newEntry);
        await saveData('education.json', education);
        res.json(newEntry);
    } catch (error) {
        // Handle multer errors
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Education creation error:', error);
        res.status(500).json({ error: 'Failed to create education entry' });
    }
});

app.put('/api/education/:id', authenticateToken, uploadCertificate.single('certificate'), async (req, res) => {
    try {
        const education = await loadData('education.json') || [];
        const index = education.findIndex(e => e.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Education entry not found' });
        }

        // Parse arrays from JSON strings (sent by FormData)
        let highlights = [];
        let skills = [];
        
        try {
            highlights = req.body.highlights ? JSON.parse(req.body.highlights) : [];
        } catch (e) {
            highlights = req.body.highlights ? req.body.highlights.split(',').map(h => h.trim()) : [];
        }
        
        try {
            skills = req.body.skills ? JSON.parse(req.body.skills) : [];
        } catch (e) {
            skills = req.body.skills ? req.body.skills.split(',').map(s => s.trim()) : [];
        }

        const updatedEntry = {
            ...education[index],
            year: parseInt(req.body.year),
            title: req.body.title,
            institution: req.body.institution,
            description: req.body.description || '',
            highlights: highlights,
            skills: skills,
            isCurrent: req.body.isCurrent === 'true',
            updatedAt: new Date().toISOString()
        };
        
        // Handle certificate upload
        if (req.file) {
            // Delete old certificate file if it exists
            if (education[index].certificate) {
                const oldCertPath = path.join(__dirname, '../public', education[index].certificate);
                try {
                    await fs.unlink(oldCertPath);
                } catch (e) {
                    console.log('Old certificate file not found or could not be deleted');
                }
            }
            updatedEntry.certificate = `/assets/certificates/${req.file.filename}`;
        } else if (req.body.certificate && req.body.certificate !== 'undefined') {
            // Keep existing certificate
            updatedEntry.certificate = req.body.certificate;
        }

        education[index] = updatedEntry;
        await saveData('education.json', education);
        res.json(updatedEntry);
    } catch (error) {
        // Handle multer errors
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Education update error:', error);
        res.status(500).json({ error: 'Failed to update education entry' });
    }
});

app.delete('/api/education/:id', authenticateToken, async (req, res) => {
    try {
        const education = await loadData('education.json') || [];
        const entryToDelete = education.find(e => e.id === req.params.id);
        
        if (!entryToDelete) {
            return res.status(404).json({ error: 'Education entry not found' });
        }
        
        // Delete certificate file if it exists
        if (entryToDelete.certificate) {
            const certPath = path.join(__dirname, '../public', entryToDelete.certificate);
            try {
                await fs.unlink(certPath);
            } catch (e) {
                console.log('Certificate file not found or could not be deleted');
            }
        }
        
        const filteredEducation = education.filter(e => e.id !== req.params.id);
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

        await saveData('skills.json', { skills: filteredSkills });
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

        // Find user by email in MongoDB (Case-Insensitive)
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) {
            // Log attempt (optional: keep saving to recovery-attempts.json or move to DB)
            // ... (code to save to recovery-attempts.json can remain if desired) ...
            console.log(`Password reset requested for non-existent email (MongoDB): ${email}`);
            return res.status(404).json({ error: 'No account found with this email address.' });
        }

        // Generate reset token (expires in 1 hour)
        const resetToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Hash the token before storing for security
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Update user in MongoDB with hashed token and expiry
        user.resetToken = hashedToken;
        user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
        await user.save();

        // Create a short reset URL
        const shortResetUrl = `http://localhost:${PORT}/reset-password.html?t=${encodeURIComponent(resetToken.substring(0, 64))}`;

        // Get email template settings (use defaults if not set)
        const defaultTemplate = {
            subject: 'Reset Your Portfolio Password',
            headerColor: '#111111',
            buttonColor: 'linear-gradient(135deg, #d4af37 0%, #f2d068 100%)',
            logoUrl: '/assets/images/oussama-min.png', // Using local profile image
            customMessage: 'We received a password reset request for your portfolio dashboard account. For your security, this link will only be valid for the next hour. To create a new password and regain access to your account, click the button below:'
        };

        const emailTemplate = user.emailTemplates?.passwordReset || {};
        // Always ensure all fields are present
        const subject = emailTemplate.subject || defaultTemplate.subject;
        const headerColor = emailTemplate.headerColor || defaultTemplate.headerColor;
        const buttonColor = emailTemplate.buttonColor || defaultTemplate.buttonColor;
        const logoUrl = emailTemplate.logoUrl || defaultTemplate.logoUrl;
        const customMessage = emailTemplate.customMessage || defaultTemplate.customMessage;

        // Extract button colors for hover effect
        let buttonColorStart = '#d4af37';
        let buttonColorEnd = '#f2d068';
        
        if (buttonColor.includes('linear-gradient')) {
            const colorMatches = buttonColor.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g);
            if (colorMatches && colorMatches.length >= 2) {
                buttonColorStart = colorMatches[0];
                buttonColorEnd = colorMatches[1];
            }
        } else {
            buttonColorStart = buttonColor;
            buttonColorEnd = buttonColor;
        }

        // Send the password reset link via email with modern, professional design
        // Using a simplified version that works reliably across email clients
        const mailOptions = {
            from: '"Portfolio Dashboard" <noreply@portfolio-dashboard.com>',
            to: email,
            subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Portfolio Password</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f5f7; color: #333;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td align="center" bgcolor="#222222" style="padding: 30px 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                                <h2 style="color: #d4af37; margin: 0 0 15px; font-size: 24px;">Portfolio Dashboard</h2>
                                <div style="height: 6px; background-color: #d4af37; width: 100%;"></div>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center;">
                                <h1 style="color: #222; font-size: 24px; margin: 0 0 25px;">Reset Your Password</h1>
                                
                                <p style="font-size: 18px; margin-bottom: 20px; color: #444; font-weight: bold;">Hello,</p>
                                
                                <p style="margin: 25px 0; color: #555; font-size: 16px; line-height: 1.7; text-align: center;">
                                    ${customMessage}
                                </p>
                                
                                <div style="margin: 35px 0; text-align: center;">
                                    <a href="${shortResetUrl}" style="background-color: #d4af37; color: #111; text-decoration: none; padding: 15px 40px; font-weight: bold; font-size: 16px; border-radius: 8px; display: inline-block;">
                                        Reset Password
                                    </a>
                                </div>
                                
                                <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;">
                                
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff8e1; border-left: 5px solid #ffd54f; margin: 30px 0; border-radius: 6px;">
                                    <tr>
                                        <td style="padding: 14px 20px; text-align: left; font-size: 15px; color: #755800;">
                                            <strong>⏰ Time-Sensitive:</strong> This link will expire in 1 hour for security purposes.
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="margin: 30px 0 10px; font-size: 15px; color: #666; padding: 18px; background-color: #f9f9f9; border-radius: 8px; line-height: 1.6; text-align: left;">
                                    If you didn't request this reset, please disregard this email. Your account security is important to us.
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td align="center" bgcolor="#f5f5f7" style="padding: 20px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eaeaea; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Portfolio Dashboard</p>
                                <p style="margin: 5px 0;">This is an automated message. Please do not reply.</p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Password reset link sent to ${email}`);
            res.status(200).json({ message: 'If your email is registered, you will receive a password reset link shortly.' });
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            res.status(500).json({ error: 'Could not send password reset email.' });
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

        console.log("Received token for reset:", token.substring(0, 10) + "...");
        
        // Find all users with active reset tokens
        const users = await User.find({
            resetToken: { $exists: true },
            resetTokenExpires: { $gt: new Date() }
        });
        
        console.log(`Found ${users.length} users with active reset tokens`);
        
        // Since we're using a shortened token in the URL, we need a different approach
        // Try to find the user whose token matches our shortened version
        let matchedUser = null;
        
        for (const user of users) {
            // For each user with an active reset token, try to generate a token
            // with the same pattern as we did when creating the reset link
            try {
                // Create a sample token with the user's data
                const sampleToken = jwt.sign(
                    { userId: user._id, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                );
                
                // Get shortened version - this should match what we sent in email
                const shortSample = sampleToken.substring(0, 64);
                
                // Compare with received token
                if (token === shortSample) {
                    console.log("Found matching user for token");
                    matchedUser = user;
                    break;
                }
            } catch (err) {
                console.error("Error comparing tokens:", err);
                continue;
            }
        }
        
        // No matching user found
        if (!matchedUser) {
            console.log("No user found with matching token");
            return res.status(400).json({ error: 'Invalid or expired password reset token.' });
        }
        
        // Check token expiration
        if (!matchedUser.resetToken || !matchedUser.resetTokenExpires || new Date() > matchedUser.resetTokenExpires) {
            console.log("Token expired");
            return res.status(400).json({ error: 'Password reset token has expired.' });
        }
        
        // Use the matched user for password reset
        const user = matchedUser;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset token fields in MongoDB
        user.password = hashedPassword;
        user.resetToken = undefined; // Use undefined to remove field
        user.resetTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'An error occurred while resetting the password.' });
    }
});

// Login Endpoint (Using MongoDB)
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user in MongoDB
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials', errorType: 'username_not_found' });
        }

        // Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials', errorType: 'incorrect_password' });
        }

        // Generate JWT token (using MongoDB user _id)
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Email template settings endpoint
app.get('/api/email-templates/password-reset', authenticateToken, async (req, res) => {
    try {
        // Find user in MongoDB
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Default values if not set
        const defaultTemplate = {
            subject: 'Reset Your Portfolio Password',
            headerColor: '#111111',
            buttonColor: 'linear-gradient(135deg, #d4af37 0%, #f2d068 100%)',
            logoUrl: 'https://i.imgur.com/yJDxBo7.png',
            customMessage: 'We received a password reset request for your portfolio dashboard account. To set a new password, simply click the button below:'
        };

        // Return user's template settings or defaults
        const templateSettings = user.emailTemplates?.passwordReset || defaultTemplate;
        res.json(templateSettings);
    } catch (error) {
        console.error('Error fetching email template settings:', error);
        res.status(500).json({ error: 'Failed to fetch email template settings' });
    }
});

app.put('/api/email-templates/password-reset', authenticateToken, async (req, res) => {
    try {
        const { subject, headerColor, buttonColor, logoUrl, customMessage } = req.body;
        
        // Validate required fields
        if (!subject || !customMessage) {
            return res.status(400).json({ error: 'Subject and message content are required' });
        }

        // Find and update user
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize emailTemplates if it doesn't exist
        if (!user.emailTemplates) {
            user.emailTemplates = {};
        }

        // Update template settings
        user.emailTemplates.passwordReset = {
            subject,
            headerColor: headerColor || '#111111',
            buttonColor: buttonColor || 'linear-gradient(135deg, #d4af37 0%, #f2d068 100%)',
            logoUrl: logoUrl || 'https://i.imgur.com/yJDxBo7.png',
            customMessage
        };

        await user.save();
        res.json(user.emailTemplates.passwordReset);
    } catch (error) {
        console.error('Error updating email template settings:', error);
        res.status(500).json({ error: 'Failed to update email template settings' });
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