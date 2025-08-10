const fs = require('fs').promises;
const path = require('path');

async function loadData(filename) {
    try {
        const data = await fs.readFile(path.join(__dirname, '..', 'data', filename));
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null; // Return null if file does not exist
        }
        console.error(`Error loading ${filename}:`, error);
        return null;
    }
}

async function saveData(filename, data) {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        return false;
    }
}

async function archiveOldMessages() {
    try {
        // Load current messages
        const messages = await loadData('messages.json') || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        // Separate old and current messages
        const { oldMessages, currentMessages } = messages.reduce((acc, message) => {
            const messageDate = new Date(message.createdAt);
            if (messageDate < thirtyDaysAgo && message.read) {
                acc.oldMessages.push(message);
            } else {
                acc.currentMessages.push(message);
            }
            return acc;
        }, { oldMessages: [], currentMessages: [] });

        if (oldMessages.length === 0) {
            console.log('No messages to archive');
            return;
        }

        // Load existing archive
        const archiveFile = `message-archive-${new Date().getFullYear()}.json`;
        const archive = await loadData(archiveFile) || [];

        // Add new messages to archive
        archive.push(...oldMessages);

        // Save updated archive and current messages
        await Promise.all([
            saveData(archiveFile, archive),
            saveData('messages.json', currentMessages)
        ]);

        console.log(`Archived ${oldMessages.length} messages`);
    } catch (error) {
        console.error('Error archiving messages:', error);
    }
}

// Export for use in cron job or manual execution
module.exports = {
    archiveOldMessages
};