const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File path for messages
const messagesFile = path.join(__dirname, 'data', 'messages.json');
// File path for personal info
const personalInfoFile = path.join(__dirname, 'data', 'personal-info.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dir = path.join(__dirname, 'data');
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir);
    }
}

// Initialize messages file
async function initMessagesFile() {
    try {
        await fs.access(messagesFile);
    } catch {
        await fs.writeFile(messagesFile, '[]');
    }
}

// Initialize personal info file
async function initPersonalInfoFile() {
    try {
        await fs.access(personalInfoFile);
    } catch {
        const defaultInfo = {
            name: '',
            age: null,
            profession: '',
            currentRole: '',
            company: '',
            experience: '',
            yearsCoding: null,
            educationLevel: '',
            education: '',
            certifications: '',
            location: '',
            skills: [],
            workExperience: '',
            achievements: '',
            languages: [],
            projects: '',
            specialization: '',
            personality: '',
            additionalInfo: ''
        };
        await fs.writeFile(personalInfoFile, JSON.stringify(defaultInfo, null, 2));
    }
}

// API endpoint to save messages
app.post('/api/contact', async (req, res) => {
    try {
        // Read existing messages
        const data = await fs.readFile(messagesFile, 'utf8');
        const messages = JSON.parse(data);

        // Add new message
        messages.push({
            ...req.body,
            id: Date.now(), // Add unique ID
            timestamp: new Date().toISOString()
        });

        // Write back to file
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// API endpoint to get messages (optional, for admin panel)
app.get('/api/messages', async (req, res) => {
    try {
        const data = await fs.readFile(messagesFile, 'utf8');
        const messages = JSON.parse(data);
        res.json(messages);
    } catch (error) {
        console.error('Error reading messages:', error);
        res.status(500).json({ error: 'Failed to read messages' });
    }
});

// API endpoint to get personal information
app.get('/api/personal-info', async (req, res) => {
    try {
        const data = await fs.readFile(personalInfoFile, 'utf8');
        const personalInfo = JSON.parse(data);
        res.json(personalInfo);
    } catch (error) {
        console.error('Error reading personal info:', error);
        res.status(500).json({ error: 'Failed to read personal information' });
    }
});

// API endpoint to update personal information
app.put('/api/personal-info', async (req, res) => {
    try {
        // Simple admin check - in production you'd use proper authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== 'Bearer admin') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate required fields
        const personalInfo = req.body;
        if (!personalInfo) {
            return res.status(400).json({ error: 'Personal information is required' });
        }

        // Write to file
        await fs.writeFile(personalInfoFile, JSON.stringify(personalInfo, null, 2));
        
        res.json({ success: true, message: 'Personal information updated successfully' });
    } catch (error) {
        console.error('Error saving personal info:', error);
        res.status(500).json({ error: 'Failed to save personal information' });
    }
});

// Test endpoint for AI API debugging
app.post('/api/test-ai', async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = 'AIzaSyDRXEHvUO5wMETMcyMzWF7gEQY4iIKKK6M';
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        
        console.log('Testing AI with message:', message);
        
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message || 'Hello, please respond with a simple greeting.'
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100,
                }
            })
        });

        console.log('AI API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI API Error:', errorText);
            return res.status(response.status).json({ error: `AI API Error: ${errorText}` });
        }

        const data = await response.json();
        console.log('AI API Response data:', JSON.stringify(data, null, 2));
        
        res.json({ 
            success: true, 
            response: data.candidates[0].content.parts[0].text,
            fullResponse: data
        });
    } catch (error) {
        console.error('Test AI Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initialize and start server
async function startServer() {
    await ensureDataDir();
    await initMessagesFile();
    await initPersonalInfoFile();
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer().catch(console.error);