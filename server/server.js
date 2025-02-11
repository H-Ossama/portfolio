const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/portfolio', {
    useNewUrlParser: true,
    useUnifiedTopology: true
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
    category: String,
    name: String,
    icon: String,
    level: Number
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
        const education = await Education.find().sort({ year: -1 });
        res.json(education);
    } catch (e) {
        res.status(500).send({ error: e.message });
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
        const technologies = await Technology.find();
        res.json(technologies);
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});