// Translation Manager Utility
const fs = require('fs').promises;
const path = require('path');

class TranslationManager {
    constructor() {
        this.translationsPath = path.join(__dirname, '../../public/data/translations.json');
    }
    
    async loadTranslations() {
        try {
            const data = await fs.readFile(this.translationsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading translations:', error);
            throw new Error('Failed to load translations data');
        }
    }
    
    async saveTranslations(translations) {
        try {
            await fs.writeFile(
                this.translationsPath,
                JSON.stringify(translations, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Error saving translations:', error);
            throw new Error('Failed to save translations data');
        }
    }
    
    async updateTranslation(language, section, data) {
        try {
            // Load existing translations
            const translations = await this.loadTranslations();
            
            // Make sure the language exists
            if (!translations[language]) {
                throw new Error(`Language '${language}' not found in translations`);
            }
            
            // Update the specific section
            if (!translations[language][section] && section !== 'about_page') {
                translations[language][section] = {};
            }
            
            // For the about section, which uses a different key in the translations file
            if (section === 'about') {
                translations[language]['about_page'] = data['about_page'] || {};
            } else {
                // Merge the new data with existing data
                translations[language][section] = {
                    ...translations[language][section],
                    ...data
                };
            }
            
            // Save the updated translations
            await this.saveTranslations(translations);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating translation:', error);
            throw error;
        }
    }
}

module.exports = new TranslationManager();
