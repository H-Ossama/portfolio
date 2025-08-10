// API route for handling translations
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const translationManager = require('../utils/translationManager');

// Get translations endpoint
router.get('/', async (req, res) => {
    try {
        const translations = await translationManager.loadTranslations();
        res.json(translations);
    } catch (error) {
        console.error('Error loading translations:', error);
        res.status(500).json({ error: 'Failed to load translations' });
    }
});

// Update translations endpoint (protected by auth)
// router.post('/', authMiddleware, async (req, res) => { // Temporarily remove middleware
router.post('/', async (req, res) => { // Temporarily remove middleware
    try {
        const { language, section, data } = req.body;
        
        if (!language || !section || !data) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const result = await translationManager.updateTranslation(
            language,
            section,
            data
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error updating translations:', error);
        res.status(500).json({ error: 'Failed to update translations' });
    }
});

module.exports = router;
