function renderRadar(metrics) {

    if (radarChart) radarChart.destroy();

    const labels = [
        "Overall score",
        "Energy efficiency",
        "Resource utilisation",
        "Performance",
        "Code quality",
        "Maintainability",
        "CPU efficiency",
        "Memory efficiency",
        "Green coding"
    ];

    const currentProject = [
        metricValue(metrics.overall_score),
        metricValue(metrics.energy_efficiency),
        metricValue(metrics.resource_utilization),
        metricValue(metrics.performance_optimization),
        70,
        metricValue(metrics.sustainable_practices),
        60,
        65,
        55
    ].map(v => Number(v) || 0);
    
    const industryAverage = Array(labels.length).fill(75).map(Number);
    const targetGoals = Array(labels.length).fill(85).map(Number);


    radarChart = new Chart(document.getElementById("radarChart"), {
        type: "radar",
        data: {
            labels,
            datasets: [
                {
                    label: "Current project",
                    data: currentProject,
                    borderColor: "#2E7D32",
                    backgroundColor: "rgba(46,125,50,0.15)",
                    pointBackgroundColor: "#2E7D32",
                    borderWidth: 2
                },
                {
                    label: "Industry average",
                    data: industryAverage,
                    borderColor: "#1976D2",
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: "Target goals",
                    data: targetGoals,
                    borderColor: "#FBC02D",
                    borderDash: [2, 2],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 600,
                easing: "easeOutQuart"
            },
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            let value = ctx.raw;

                            // Radar charts sometimes pass objects
                            if (typeof value === "object" && value !== null) {
                                if ("r" in value) value = value.r;
                                else if ("score" in value) value = value.score;
                                else value = 0;
                            }

                            value = Number(value) || 0;

                            return `${ctx.dataset.label}: ${value}/100 – ${scoreLabel(value)}`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        backdropColor: "transparent"
                    },
                    grid: {
                        color: "rgba(0,0,0,0.08)"
                    },
                    angleLines: {
                        color: "rgba(0,0,0,0.08)"
                    },
                    pointLabels: {
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

function renderTrend(history) {
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: history.map(h => h.analysis_summary.timestamp.split('T')[0]),
            datasets: [{
                label: 'Overall Sustainability Score',
                data: history.map(h => h.sustainability_metrics.overall_score),
                borderColor: '#1976D2',
                fill: false
            }]
        }
    });
}
