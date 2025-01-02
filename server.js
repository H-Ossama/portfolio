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

// Initialize and start server
async function startServer() {
    await ensureDataDir();
    await initMessagesFile();
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer().catch(console.error);