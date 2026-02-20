function initRadarChart() {
    var data = [
        {
            type: 'scatterpolar',
            r: [44.68, 66.38, 51.73, 51.99],
            theta: ['DTD', 'RESISC45', 'MNIST', 'SVHN'],
            fill: 'toself',
            name: 'Zero Shot',
            line: {color: '#1f77b4', width: 2.5, dash: 'solid'},
            marker: {size: 8, symbol: 'circle', color: '#1f77b4', line: {color: 'white', width: 2}},
            fillcolor: 'rgba(31, 119, 180, 0.15)'
        },
        {
            type: 'scatterpolar',
            r: [82.07, 50.54, 69.16, 45.90],
            theta: ['DTD', 'RESISC45', 'MNIST', 'SVHN'],
            fill: 'toself',
            name: 'Finetuned DTD',
            line: {color: '#ff7f0e', width: 2.5, dash: 'dash'},
            marker: {size: 8, symbol: 'square', color: '#ff7f0e', line: {color: 'white', width: 2}},
            fillcolor: 'rgba(255, 127, 14, 0.15)'
        },
        {
            type: 'scatterpolar',
            r: [36.44, 96.89, 74.10, 38.78],
            theta: ['DTD', 'RESISC45', 'MNIST', 'SVHN'],
            fill: 'toself',
            name: 'Finetuned RESISC45',
            line: {color: '#2ca02c', width: 2.5, dash: 'dot'},
            marker: {size: 8, symbol: 'diamond', color: '#2ca02c', line: {color: 'white', width: 2}},
            fillcolor: 'rgba(44, 160, 44, 0.15)'
        },
        {
            type: 'scatterpolar',
            r: [34.10, 46.59, 99.76, 62.21],
            theta: ['DTD', 'RESISC45', 'MNIST', 'SVHN'],
            fill: 'toself',
            name: 'Finetuned MNIST',
            line: {color: '#d62728', width: 2.5, dash: 'dashdot'},
            marker: {size: 8, symbol: 'triangle-up', color: '#d62728', line: {color: 'white', width: 2}},
            fillcolor: 'rgba(214, 39, 40, 0.15)'
        },
        {
            type: 'scatterpolar',
            r: [36.54, 42.56, 88.88, 97.86],
            theta: ['DTD', 'RESISC45', 'MNIST', 'SVHN'],
            fill: 'toself',
            name: 'Finetuned SVHN',
            line: {color: '#9467bd', width: 2.5, dash: 'longdash'},
            marker: {size: 8, symbol: 'pentagon', color: '#9467bd', line: {color: 'white', width: 2}},
            fillcolor: 'rgba(148, 103, 189, 0.15)'
        },
        {
            type: 'scatterpolar',
            r: [57.18, 84.06, 98.55, 87.28],
            theta: ['DTD', 'RESISC45', 'MNIST', 'SVHN'],
            fill: 'toself',
            name: 'Merged Model (avg)',
            line: {color: '#e377c2', width: 3.5, dash: 'solid'},
            marker: {size: 10, symbol: 'circle', color: '#e377c2', line: {color: 'white', width: 2}},
            fillcolor: 'rgba(227, 119, 194, 0.25)'
        },
        {
            type: 'scatterpolar',
            r: [46.54, 78.46, 98.43, 96.23],
            theta: ['DTD', 'RESISC45', 'MNIST', 'SVHN'],
            fill: 'toself',
            name: 'Merged Model (meta)',
            line: {color: '#17becf', width: 3.5, dash: 'longdashdot'},
            marker: {size: 10, symbol: 'star', color: '#17becf', line: {color: 'white', width: 2}},
            fillcolor: 'rgba(23, 190, 207, 0.25)'
        }
    ];

    var layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 100],
                tickfont: {
                    color: '#555',
                    size: 11
                },
                gridcolor: '#d0d0d0'
            },
            angularaxis: {
                tickfont: {
                    color: '#1a1a1a',
                    size: 13
                },
                gridcolor: '#d0d0d0'
            },
            bgcolor: 'white'
        },
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#1a1a1a'
        },
        legend: {
            font: {
                size: 12,
                color: '#1a1a1a'
            },
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: '#ddd',
            borderwidth: 1,
            x: 1.05,
            y: 0.5
        },
        margin: {
            l: 60,
            r: 200,
            t: 40,
            b: 60
        },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white',
        showlegend: true,
        hovermode: 'closest'
    };

    var config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('model-comparison-chart', data, layout, config);

    window.addEventListener('resize', function() {
        Plotly.Plots.resize('model-comparison-chart');
    });
}

// Initialize when Plotly is ready
if (typeof Plotly !== 'undefined') {
    initRadarChart();
} else {
    // Plotly is loading, wait for it
    setTimeout(function checkPlotly() {
        if (typeof Plotly !== 'undefined') {
            initRadarChart();
        } else {
            setTimeout(checkPlotly, 100);
        }
    }, 100);
}
