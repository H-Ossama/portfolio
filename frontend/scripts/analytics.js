const analytics = {
    async recordVisit() {
        try {
            await fetch(config.getApiPath('/api/stats/visitor'), { method: 'POST' });
        } catch (error) {
            console.error('Error recording visit:', error);
        }
    },

    async recordCVView() {
        try {
            await fetch(config.getApiPath('/api/stats/cv-view'), { method: 'POST' });
        } catch (error) {
            console.error('Error recording CV view:', error);
        }
    },

    async recordCVDownload() {
        try {
            await fetch(config.getApiPath('/api/stats/cv-download'), { method: 'POST' });
        } catch (error) {
            console.error('Error recording CV download:', error);
        }
    },

    async loadStats() {
        const contentArea = document.getElementById('content-area');
        
        try {
            const stats = await utils.fetchWithAuth('/api/stats');
            
            contentArea.innerHTML = `
                <div class="section-header">
                    <h2>Dashboard Analytics</h2>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon visitors">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Total Visitors</h3>
                            <div class="stat-value">${stats.visitors || 0}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon views">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div class="stat-info">
                            <h3>CV Views</h3>
                            <div class="stat-value">${stats.cvViews || 0}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon downloads">
                            <i class="fas fa-download"></i>
                        </div>
                        <div class="stat-info">
                            <h3>CV Downloads</h3>
                            <div class="stat-value">${stats.cvDownloads || 0}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon messages">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Messages</h3>
                            <div class="stat-value">${stats.messageCount || 0}</div>
                        </div>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="visitorChart"></canvas>
                </div>`;

            // Initialize charts after content is loaded
            this.initChart(stats);
        } catch (error) {
            contentArea.innerHTML = '<div class="error-message">Failed to load statistics</div>';
            console.error('Error loading stats:', error);
        }
    },

    initChart(stats) {
        const ctx = document.getElementById('visitorChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Visitors',
                    data: stats.monthlyVisitors || Array(12).fill(0),
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#888888'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#888888'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#888888'
                        }
                    }
                }
            }
        });
    }
};

// Record visit when page loads
document.addEventListener('DOMContentLoaded', () => {
    analytics.recordVisit();
});

// Add event listeners to CV buttons
document.addEventListener('DOMContentLoaded', () => {
    const viewCVButtons = document.querySelectorAll('a[href*="HATTAN_OUSSAMA.pdf"]:not([download])');
    const downloadCVButtons = document.querySelectorAll('a[href*="HATTAN_OUSSAMA.pdf"][download]');

    viewCVButtons.forEach(btn => {
        btn.addEventListener('click', () => analytics.recordCVView());
    });

    downloadCVButtons.forEach(btn => {
        btn.addEventListener('click', () => analytics.recordCVDownload());
    });
});