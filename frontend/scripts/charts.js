const charts = {
    async initializeCharts() {
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        const stats = await this.fetchStats();
        this.createVisitorChart(stats);
        this.createInteractionChart(stats);
    },

    async fetchStats() {
        try {
            const response = await fetch(config.getApiPath('/api/stats'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    },

    createVisitorChart(stats) {
        const ctx = document.getElementById('visitorChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: stats.dailyStats.map(stat => stat.date),
                datasets: [{
                    label: 'Visitors',
                    data: stats.dailyStats.map(stat => stat.visitors),
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
                    title: {
                        display: true,
                        text: 'Daily Visitors',
                        color: '#ffffff'
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    },

    createInteractionChart(stats) {
        const ctx = document.getElementById('interactionChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['CV Views', 'CV Downloads', 'Messages'],
                datasets: [{
                    data: [stats.cvViews, stats.cvDownloads, stats.messageCount],
                    backgroundColor: [
                        'rgba(212, 175, 55, 0.8)',
                        'rgba(212, 175, 55, 0.6)',
                        'rgba(212, 175, 55, 0.4)'
                    ],
                    borderColor: [
                        'rgba(212, 175, 55, 1)',
                        'rgba(212, 175, 55, 1)',
                        'rgba(212, 175, 55, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Interactions',
                        color: '#ffffff'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
};