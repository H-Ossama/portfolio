const cron = require('node-cron');
const { archiveOldMessages } = require('./archiveMessages');

// Initialize cron jobs
function initCronJobs() {
    // Archive messages at midnight every day
    cron.schedule('0 0 * * *', async () => {
        console.log('Running scheduled message archival task...');
        await archiveOldMessages();
    });

    // Weekly database cleanup at 1 AM on Sundays
    cron.schedule('0 1 * * 0', async () => {
        console.log('Running weekly database cleanup...');
        // Add more cleanup tasks here
    });

    console.log('Cron jobs initialized');
}

module.exports = {
    initCronJobs
};