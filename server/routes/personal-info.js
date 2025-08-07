const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const personalInfoPath = path.join(__dirname, '../data/personal-info.json');

// Default personal information
const defaultPersonalInfo = {
    name: "Oussama Hattan",
    profession: "Backend Developer",
    experience: "3+ years",
    education: "Bachelor's in Web Development, Full Stack Engineering certification from ALX",
    skills: ["Node.js", "Python", "JavaScript", "PHP", "MySQL", "MongoDB", "Docker", "AWS"],
    location: "Azrou, Morocco",
    languages: ["Arabic", "French", "English"],
    projects: "15+ completed projects",
    specialization: "Backend development, API design, database optimization",
    personality: "Passionate about technology, continuous learner, problem solver",
    additionalInfo: ""
};

// Ensure personal info file exists
async function ensurePersonalInfoFile() {
    try {
        await fs.access(personalInfoPath);
    } catch (error) {
        // File doesn't exist, create it with default data
        await fs.writeFile(personalInfoPath, JSON.stringify(defaultPersonalInfo, null, 2));
    }
}

// GET personal information
router.get('/personal-info', async (req, res) => {
    try {
        await ensurePersonalInfoFile();
        const data = await fs.readFile(personalInfoPath, 'utf8');
        const personalInfo = JSON.parse(data);
        res.json(personalInfo);
    } catch (error) {
        console.error('Error reading personal info:', error);
        res.json(defaultPersonalInfo);
    }
});

// UPDATE personal information (admin only)
router.put('/personal-info', async (req, res) => {
    try {
        // Simple admin check - you might want to implement proper authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== 'Bearer admin') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const newPersonalInfo = req.body;
        
        // Validate required fields
        const requiredFields = ['name', 'profession', 'experience', 'education'];
        for (let field of requiredFields) {
            if (!newPersonalInfo[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        await ensurePersonalInfoFile();
        await fs.writeFile(personalInfoPath, JSON.stringify(newPersonalInfo, null, 2));
        
        res.json({ success: true, message: 'Personal information updated successfully' });
    } catch (error) {
        console.error('Error updating personal info:', error);
        res.status(500).json({ error: 'Failed to update personal information' });
    }
});

module.exports = router;
