const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const Message = require('./models/Message');
require('dotenv').config();

// Define schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    settings: {
        cursor: { type: String, default: 'default' },
        theme: { type: String, default: 'dark' }
    },
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date
});

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    githubLink: String,
    liveLink: String,
    technologies: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const technologySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Backend', 'Frontend', 'Database', 'DevOps', 'Tools']
    },
    icon: { type: String, required: true },
    level: { type: Number, required: true, min: 0, max: 100 },
    tags: [String],
    description: String,
    features: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const educationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    institution: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    description: String,
    achievements: [String],
    skills: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

// Create models
const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Technology = mongoose.model('Technology', technologySchema);
const Education = mongoose.model('Education', educationSchema);

async function initializeDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Create indexes for all collections
        await Promise.all([
            Message.createIndexes(),
            User.createIndexes(),
            Project.createIndexes(),
            Technology.createIndexes(),
            Education.createIndexes()
        ]);
        console.log('Created indexes');

        // Create default admin user if none exists
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                settings: {
                    cursor: 'default',
                    theme: 'dark'
                }
            });
            console.log('Created default admin user');
        }

        // Import messages from JSON if any exist
        try {
            const messagesData = await fs.readFile(path.join(__dirname, 'data', 'messages.json'), 'utf8');
            const messages = JSON.parse(messagesData);
            if (messages && messages.length > 0) {
                // Clear existing messages
                await Message.deleteMany({});
                
                // Insert messages with their original IDs
                await Message.insertMany(messages.map(msg => ({
                    _id: msg.id,
                    name: msg.name,
                    email: msg.email,
                    company: msg.company,
                    projectType: msg.projectType,
                    timeline: msg.timeline,
                    message: msg.message,
                    read: msg.read,
                    createdAt: new Date(msg.createdAt),
                    readAt: msg.readAt ? new Date(msg.readAt) : undefined
                })));
                console.log('Imported existing messages');
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Error importing messages:', error);
            }
        }

        // Initialize other collections with sample data if empty
        await initializeSampleData();

        console.log('Database initialization complete');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

async function initializeSampleData() {
    // Add sample technologies if none exist
    const techCount = await Technology.countDocuments();
    if (techCount === 0) {
        await Technology.insertMany([
            {
                name: 'JavaScript',
                category: 'Frontend',
                icon: 'fab fa-js',
                level: 90,
                tags: ['ES6+', 'DOM', 'Async'],
                description: 'Modern JavaScript development',
                features: ['ES6+', 'Async/Await', 'DOM Manipulation']
            },
            {
                name: 'Node.js',
                category: 'Backend',
                icon: 'fab fa-node-js',
                level: 85,
                tags: ['Express', 'API', 'Server'],
                description: 'Server-side JavaScript development',
                features: ['Express', 'RESTful APIs', 'MongoDB Integration']
            }
        ]);
        console.log('Added sample technologies');
    }
}

// Run initialization if this script is run directly
if (require.main === module) {
    initializeDatabase().then(() => {
        console.log('Database setup complete');
        process.exit(0);
    });
} else {
    module.exports = initializeDatabase;
}