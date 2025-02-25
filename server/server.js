const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000; // Changed port to 3000

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve data files directly
app.use('/data', express.static(path.join(__dirname, 'data')));

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

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.send({ token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Projects API
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.post('/api/projects', auth, async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Education API
app.get('/api/education', async (req, res) => {
    try {
        // First try to get from MongoDB
        const education = await Education.find().sort({ year: -1 });
        if (education && education.length > 0) {
            res.json(education);
        } else {
            // Fallback to static JSON file
            const staticEducation = require('./data/education.json');
            res.json(staticEducation);
        }
    } catch (e) {
        // If MongoDB fails, serve static JSON
        try {
            const staticEducation = require('./data/education.json');
            res.json(staticEducation);
        } catch (fallbackError) {
            res.status(500).send({ error: 'Failed to load education data' });
        }
    }
});

app.post('/api/education', auth, async (req, res) => {
    try {
        const education = new Education(req.body);
        await education.save();
        res.status(201).json(education);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Technologies API
app.get('/api/technologies', async (req, res) => {
    try {
        const technologies = await Technology.find().sort({ category: 1, name: 1 });
        
        // Calculate project count for each technology
        const projects = await Project.find();
        const techCounts = technologies.map(tech => {
            const count = projects.filter(p => 
                p.technologies.includes(tech.name)
            ).length;
            
            return {
                ...tech.toObject(),
                projectCount: count
            };
        });
        
        res.json(techCounts);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.post('/api/technologies', auth, async (req, res) => {
    try {
        const technology = new Technology(req.body);
        await technology.save();
        res.status(201).json(technology);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

app.get('/api/technologies/:id', auth, async (req, res) => {
    try {
        const technology = await Technology.findById(req.params.id);
        if (!technology) {
            return res.status(404).send({ error: 'Technology not found' });
        }
        res.json(technology);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.put('/api/technologies/:id', auth, async (req, res) => {
    try {
        const technology = await Technology.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!technology) {
            return res.status(404).send({ error: 'Technology not found' });
        }
        res.json(technology);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

app.delete('/api/technologies/:id', auth, async (req, res) => {
    try {
        const technology = await Technology.findByIdAndDelete(req.params.id);
        if (!technology) {
            return res.status(404).send({ error: 'Technology not found' });
        }
        res.json(technology);
    } catch (e) {
        res.status(500).send({ error: e.message });
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
app.get('/api/user/settings', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user.settings);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.put('/api/user/settings', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.userId,
            { settings: req.body },
            { new: true }
        );
        res.json(user.settings);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Skills routes
app.get('/api/skills', async (req, res) => {
    try {
        const skills = require('./data/skills.json');
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Error loading skills data' });
    }
});

app.post('/api/skills', auth, async (req, res) => {
    try {
        const skills = require('./data/skills.json');
        const newSkill = req.body;
        newSkill.id = Date.now().toString();
        skills.skills.push(newSkill);
        await fs.writeFile('./data/skills.json', JSON.stringify(skills, null, 2));
        res.json(newSkill);
    } catch (error) {
        res.status(500).json({ message: 'Error saving skill' });
    }
});

app.put('/api/skills/:id', auth, async (req, res) => {
    try {
        const skills = require('./data/skills.json');
        const index = skills.skills.findIndex(s => s.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        skills.skills[index] = { ...skills.skills[index], ...req.body };
        await fs.writeFile('./data/skills.json', JSON.stringify(skills, null, 2));
        res.json(skills.skills[index]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating skill' });
    }
});

app.delete('/api/skills/:id', auth, async (req, res) => {
    try {
        const skills = require('./data/skills.json');
        const filtered = skills.skills.filter(s => s.id !== req.params.id);
        if (filtered.length === skills.skills.length) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        skills.skills = filtered;
        await fs.writeFile('./data/skills.json', JSON.stringify(skills, null, 2));
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting skill' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});