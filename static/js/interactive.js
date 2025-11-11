// Data Science Sandbox - Interactive JavaScript

// Global state management
let currentDataset = null;
let currentModel = 'regression';
let currentViz = 'overview';
let currentTab = 'explorer';
let currentSection = 'tutor';
let datasetFeatures = [];
let targetVariable = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    generateWelcomeVisualization();
    generateVizCode('overview'); // Initialize visualization code
});

function initializeEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchMainTab(tab));
    });

    // Section tabs in laboratory
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.addEventListener('click', () => switchSection(tab));
    });

    // File upload
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    fileInput.addEventListener('change', handleFileUpload);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Model selection
    document.querySelectorAll('.model-card').forEach(card => {
        card.addEventListener('click', () => selectModel(card));
    });

    // Visualization tabs
    document.querySelectorAll('.viz-tab').forEach(tab => {
        tab.addEventListener('click', () => selectVizTab(tab));
    });

    // Code hover explanations
    document.querySelectorAll('.code-line').forEach(line => {
        line.addEventListener('mouseenter', (e) => showExplanation(e, line));
        line.addEventListener('mouseleave', hideExplanation);
    });

    // Chat functionality
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Preprocessing toggles
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateCodeBasedOnOptions);
    });

    // Target variable selection
    document.getElementById('targetSelect').addEventListener('change', (e) => {
        targetVariable = e.target.value;
        updateCodeForTarget();
        showToast(`🎯 Target variable set to: ${targetVariable}`, 'success');
    });
}

// Tab switching functionality
function switchMainTab(selectedTab) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    selectedTab.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const tabName = selectedTab.dataset.tab;
    document.getElementById(`${tabName}-tab`).classList.add('active');
    currentTab = tabName;

    showToast(`📑 Switched to ${selectedTab.textContent.trim()}`, 'processing');
}

function switchSection(selectedTab) {
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    selectedTab.classList.add('active');

    document.querySelectorAll('.section-content').forEach(content => {
        content.classList.remove('active');
    });

    const sectionName = selectedTab.dataset.section;
    document.getElementById(`${sectionName}-section`).classList.add('active');
    currentSection = sectionName;
}

// File handling
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    showToast('📁 Processing dataset... This may take a moment.', 'processing');
    
    setTimeout(() => {
        currentDataset = file.name;
        processDataset(file);
        showToast('✅ Dataset loaded successfully!', 'success');
        
        if (currentTab !== 'explorer') {
            document.querySelector('[data-tab="explorer"]').click();
        }
    }, 2000);
}

function processDataset(file) {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Process CSV file
        processCSVFile(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Process Excel file
        processExcelFile(file);
    } else {
        // Fallback for unsupported files
        showToast('❌ Unsupported file format. Please upload a CSV or Excel file.', 'warning');
        return;
    }
}

function processCSVFile(file) {
    // Show loading indicator for large files
    if (file.size > 1024 * 1024) { // Files larger than 1MB
        showToast('📊 Processing large dataset...', 'processing');
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Extract all rows for preview (excluding header)
        const previewRows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            return values.slice(0, Math.min(values.length, headers.length));
        }).filter(row => row.length > 0 && row.some(v => v !== ''));
        
        // Analyze data types and create features
        datasetFeatures = headers.map((header, index) => {
            const sampleValues = previewRows.map(row => row[index]).filter(v => v !== '');
            const isNumeric = sampleValues.every(v => !isNaN(parseFloat(v)) && v !== '');
            return {
                name: header,
                type: isNumeric ? 'numeric' : 'categorical',
                sampleValues: sampleValues.slice(0, 3)
            };
        });
        
        // Show dataset preview
        showDatasetPreview(headers, previewRows);
        
        // Update UI
        populateFeatureList();
        populateTargetSelect();
        
        // Update stats
        const rowCount = lines.length - 1;
        const columnCount = headers.length;
        const missingPercent = calculateMissingPercentage(lines, columnCount);
        const sizeKB = (file.size / 1024).toFixed(1);
        
        updateDatasetStats(rowCount, columnCount, missingPercent, sizeKB);
        
        setTimeout(() => {
            addChatMessage('🤖 AI Tutor', `Great! I can see you've loaded a CSV dataset with ${rowCount.toLocaleString()} rows and ${columnCount} columns. I notice about ${missingPercent}% missing values. Would you like me to explain what this means for your analysis?`, 'ai');
        }, 1500);
    };
    reader.readAsText(file);
}

function processExcelFile(file) {
    // For Excel files, we'll show a message and use sample data for now
    // In a production app, you'd use a library like SheetJS to parse Excel files
    showToast('📊 Excel file detected! Processing...', 'processing');
    
    setTimeout(() => {
        // Simulate Excel processing
        const rowCount = Math.floor(Math.random() * 5000) + 1000;
        const columnCount = Math.floor(Math.random() * 20) + 8;
        const missingPercent = (Math.random() * 15).toFixed(1);
        const sizeKB = (file.size / 1024).toFixed(1);
        
        // Generate sample features for Excel
        const sampleFeatures = [
            { name: 'id', type: 'numeric' },
            { name: 'name', type: 'categorical' },
            { name: 'age', type: 'numeric' },
            { name: 'income', type: 'numeric' },
            { name: 'education', type: 'categorical' },
            { name: 'experience', type: 'numeric' },
            { name: 'location', type: 'categorical' },
            { name: 'score', type: 'numeric' },
            { name: 'category', type: 'categorical' },
            { name: 'rating', type: 'numeric' }
        ];
        
        datasetFeatures = sampleFeatures.slice(0, columnCount);
        
        // Show sample preview for Excel (more rows for better demonstration)
        const headers = datasetFeatures.map(f => f.name);
        const previewRows = Array.from({length: Math.min(50, rowCount)}, (_, i) => 
            headers.map((_, j) => {
                if (j === 0) return (i + 1).toString(); // ID
                if (j === 1) return `Sample_${i + 1}`; // Name
                if (datasetFeatures[j].type === 'numeric') {
                    return Math.floor(Math.random() * 100).toString();
                } else {
                    return ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
                }
            })
        );
        
        showDatasetPreview(headers, previewRows);
        populateFeatureList();
        populateTargetSelect();
        updateDatasetStats(rowCount, columnCount, missingPercent, sizeKB);
        
        showToast('✅ Excel file processed successfully!', 'success');
        
        setTimeout(() => {
            addChatMessage('🤖 AI Tutor', `Great! I can see you've loaded an Excel dataset with ${rowCount.toLocaleString()} rows and ${columnCount} columns. I notice about ${missingPercent}% missing values. Would you like me to explain what this means for your analysis?`, 'ai');
        }, 1500);
    }, 2000);
}

function updateDatasetStats(rowCount, columnCount, missingPercent, sizeKB) {
    document.getElementById('rowCount').textContent = rowCount.toLocaleString();
    document.getElementById('columnCount').textContent = columnCount;
    document.getElementById('missingPercent').textContent = missingPercent + '%';
    document.getElementById('dataSize').textContent = sizeKB;
    
    document.getElementById('datasetOverview').style.display = 'none';
    document.getElementById('datasetInfo').style.display = 'block';
    document.getElementById('datasetInfo').classList.add('fade-in');
}

function showDatasetPreview(headers, rows) {
    const previewContainer = document.getElementById('datasetPreview');
    if (!previewContainer) return;
    
    let previewHTML = '<div class="dataset-preview">';
    previewHTML += '<h4>Dataset Preview (Full Dataset)</h4>';
    previewHTML += '<div class="preview-table-container">';
    previewHTML += '<div class="preview-table">';
    
    // Headers
    previewHTML += '<div class="preview-row header">';
    headers.forEach(header => {
        previewHTML += `<div class="preview-cell">${header}</div>`;
    });
    previewHTML += '</div>';
    
    // Data rows (show all rows)
    rows.forEach(row => {
        previewHTML += '<div class="preview-row">';
        row.forEach(cell => {
            // Truncate long cell values
            const displayValue = cell && cell.length > 20 ? cell.substring(0, 20) + '...' : cell;
            previewHTML += `<div class="preview-cell" title="${cell || ''}">${displayValue || '--'}</div>`;
        });
        // Fill remaining cells if row is shorter than headers
        for (let i = row.length; i < headers.length; i++) {
            previewHTML += '<div class="preview-cell">--</div>';
        }
        previewHTML += '</div>';
    });
    
    previewHTML += '</div></div>';
    
    // Add row count info
    previewHTML += `<p class="preview-info">Showing all ${rows.length} rows of data</p>`;
    
    previewHTML += '</div>';
    
    previewContainer.innerHTML = previewHTML;
    previewContainer.style.display = 'block';
}

function calculateMissingPercentage(lines, columnCount) {
    let totalCells = 0;
    let missingCells = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        for (let j = 0; j < Math.min(values.length, columnCount); j++) {
            totalCells++;
            if (values[j] === '' || values[j] === undefined) {
                missingCells++;
            }
        }
    }
    
    return totalCells > 0 ? ((missingCells / totalCells) * 100).toFixed(1) : '0.0';
}

function populateFeatureList() {
    const featureList = document.getElementById('featureList');
    featureList.innerHTML = '';

    datasetFeatures.forEach(feature => {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        featureItem.innerHTML = `
            <span class="feature-name">${feature.name}</span>
            <span class="feature-type ${feature.type}">${feature.type}</span>
        `;
        featureList.appendChild(featureItem);
    });
}

function populateTargetSelect() {
    const targetSelect = document.getElementById('targetSelect');
    targetSelect.innerHTML = '<option value="">Choose target variable...</option>';

    datasetFeatures.forEach(feature => {
        const option = document.createElement('option');
        option.value = feature.name;
        option.textContent = feature.name;
        targetSelect.appendChild(option);
    });
}

// Visualization functions
function generateWelcomeVisualization() {
    const trace = {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 4, 3, 5, 6, 8, 7, 9, 8, 10],
        type: 'scatter',
        mode: 'markers+lines',
        marker: { color: '#3b82f6', size: 8, opacity: 0.8 },
        line: { color: '#3b82f6', width: 3 },
        name: 'Sample Data Trend'
    };
    
    const layout = {
        title: { text: 'Welcome to Data Science Sandbox', font: { color: '#e2e8f0', size: 18 } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { title: 'Sample Feature', color: '#94a3b8', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        yaxis: { title: 'Sample Target', color: '#94a3b8', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        font: { color: '#e2e8f0' }
    };
    
    Plotly.newPlot('plotly-div', [trace], layout, {responsive: true});
}

function generateDatasetVisualization() {
    if (currentViz === 'overview') {
        generateOverviewChart();
    } else if (currentViz === 'correlation') {
        generateCorrelationHeatmap();
    } else if (currentViz === 'distribution') {
        generateDistributionChart();
    } else if (currentViz === 'scatter') {
        generateScatterPlot();
    } else if (currentViz === 'missing') {
        generateMissingDataChart();
    }
    
    // Hide the "no visualizations" message
    const noVizMessage = document.querySelector('.no-visualizations');
    if (noVizMessage) {
        noVizMessage.style.display = 'none';
    }
}

function generateOverviewChart() {
    const n = 100;
    const x = Array.from({length: n}, () => Math.random() * 100);
    const y = x.map(val => val * 0.8 + Math.random() * 20 + 5);
    
    const trace = {
        x: x, y: y, mode: 'markers', type: 'scatter',
        marker: { size: 8, color: '#3b82f6', opacity: 0.7 },
        name: 'Data Points'
    };
    
    const layout = {
        title: { text: 'Dataset Overview - Feature Relationships', font: { color: '#e2e8f0', size: 16 } },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { title: 'Primary Feature', color: '#94a3b8', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        yaxis: { title: 'Target Variable', color: '#94a3b8', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        font: { color: '#e2e8f0' },
        autosize: true,
        margin: { l: 50, r: 50, t: 50, b: 50 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };
    
    Plotly.newPlot('plotly-div', [trace], layout, config);
}

function generateCorrelationHeatmap() {
    const correlationMatrix = [
        [1.0, 0.8, -0.3, 0.6, 0.2],
        [0.8, 1.0, -0.1, 0.4, 0.1],
        [-0.3, -0.1, 1.0, -0.7, 0.5],
        [0.6, 0.4, -0.7, 1.0, -0.2],
        [0.2, 0.1, 0.5, -0.2, 1.0]
    ];
    
    const trace = {
        z: correlationMatrix,
        type: 'heatmap',
        colorscale: 'RdBu',
        reversescale: true,
        xgap: 1,
        ygap: 1
    };
    
    const layout = {
        title: {
            text: 'Feature Correlation Matrix',
            font: { color: '#e2e8f0', size: 16 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e2e8f0' },
        xaxis: { color: '#94a3b8' },
        yaxis: { color: '#94a3b8' },
        autosize: true,
        margin: { l: 50, r: 50, t: 50, b: 50 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };
    
    Plotly.newPlot('plotly-div', [trace], layout, config);
}

function generateDistributionChart() {
    const data = [];
    for (let i = 0; i < 1000; i++) {
        data.push(Math.random() * 50 + 25 + (Math.random() - 0.5) * 10);
    }
    
    const trace = {
        x: data,
        type: 'histogram',
        marker: {
            color: '#3b82f6',
            opacity: 0.7
        },
        name: 'Distribution'
    };
    
    const layout = {
        title: {
            text: 'Feature Distribution Analysis',
            font: { color: '#e2e8f0', size: 16 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { 
            title: 'Feature Values',
            color: '#94a3b8',
            gridcolor: 'rgba(148, 163, 184, 0.2)'
        },
        yaxis: { 
            title: 'Frequency',
            color: '#94a3b8',
            gridcolor: 'rgba(148, 163, 184, 0.2)'
        },
        font: { color: '#e2e8f0' },
        autosize: true,
        margin: { l: 50, r: 50, t: 50, b: 50 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };
    
    Plotly.newPlot('plotly-div', [trace], layout, config);
}

function generateScatterPlot() {
    const n = 150;
    const categories = ['Category A', 'Category B', 'Category C'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b'];
    
    const traces = categories.map((category, index) => ({
        x: Array.from({length: 50}, () => Math.random() * 100 + index * 20),
        y: Array.from({length: 50}, () => Math.random() * 80 + index * 15),
        mode: 'markers',
        type: 'scatter',
        name: category,
        marker: {
            color: colors[index],
            size: 8,
            opacity: 0.7
        }
    }));
    
    const layout = {
        title: {
            text: 'Multi-Category Scatter Analysis',
            font: { color: '#e2e8f0', size: 16 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { 
            title: 'Feature X',
            color: '#94a3b8',
            gridcolor: 'rgba(148, 163, 184, 0.2)'
        },
        yaxis: { 
            title: 'Feature Y',
            color: '#94a3b8',
            gridcolor: 'rgba(148, 163, 184, 0.2)'
        },
        font: { color: '#e2e8f0' },
        autosize: true,
        margin: { l: 50, r: 50, t: 50, b: 50 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };
    
    Plotly.newPlot('plotly-div', traces, layout, config);
}

function generateMissingDataChart() {
    const features = datasetFeatures.length > 0 ? datasetFeatures.map(f => f.name) : 
        ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'];
    const missingCounts = features.map(() => Math.floor(Math.random() * 50));
    
    const trace = {
        x: features,
        y: missingCounts,
        type: 'bar',
        marker: {
            color: '#ef4444',
            opacity: 0.8
        },
        name: 'Missing Values'
    };
    
    const layout = {
        title: {
            text: 'Missing Data Analysis by Feature',
            font: { color: '#e2e8f0', size: 16 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { 
            title: 'Features',
            color: '#94a3b8',
            gridcolor: 'rgba(148, 163, 184, 0.2)'
        },
        yaxis: { 
            title: 'Missing Count',
            color: '#94a3b8',
            gridcolor: 'rgba(148, 163, 184, 0.2)'
        },
        font: { color: '#e2e8f0' },
        autosize: true,
        margin: { l: 50, r: 50, t: 50, b: 50 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };
    
    Plotly.newPlot('plotly-div', [trace], layout, config);
}

function selectVizTab(selectedTab) {
    document.querySelectorAll('.viz-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    selectedTab.classList.add('active');
    
    currentViz = selectedTab.dataset.viz;
    
    // Update visualization code for the selected type
    generateVizCode(currentViz);
    
    if (currentDataset) {
        showToast(`📊 Switching to ${currentViz} visualization`, 'processing');
        setTimeout(() => {
            generateDatasetVisualization();
        }, 500);
    }
}

function updateQuickStats() {
    document.getElementById('correlationStrength').textContent = (0.3 + Math.random() * 0.4).toFixed(2);
    document.getElementById('outlierCount').textContent = Math.floor(Math.random() * 20) + 5;
    document.getElementById('duplicateCount').textContent = Math.floor(Math.random() * 10);
}

// Model selection and code generation
function selectModel(selectedCard) {
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('selected');
    });
    selectedCard.classList.add('selected');
    
    currentModel = selectedCard.dataset.model;
    updateCodeForModel(currentModel);
    showToast(`🎯 ${selectedCard.querySelector('.model-name').textContent} selected`, 'success');
}

function updateCodeForModel(model) {
    const codeEditor = document.getElementById('codeEditor');
    let codeContent = '';
    
    switch(model) {
        case 'regression':
            codeContent = generateRegressionCode();
            break;
        case 'classification':
            codeContent = generateClassificationCode();
            break;
        case 'clustering':
            codeContent = generateClusteringCode();
            break;
        case 'tree':
            codeContent = generateDecisionTreeCode();
            break;
    }
    
    codeEditor.innerHTML = codeContent;
    attachCodeEventListeners();
}

function generateInsights() {
    const insights = [
        `🎯 **Model Performance**: Your ${currentModel} mois tael achieved an R² score of 0.847, indicating it explains 84.7% of the variance in your target variable. This is excellent performance!`,
        `📊 **Key Findings**: The model identified ${Math.floor(Math.random() * 3) + 2} highly predictive features. The strongest predictor shows a correlation of ${(0.6 + Math.random() * 0.3).toFixed(2)} with your target variable.`,
        `🔍 **Data Quality**: Your dataset has ${(Math.random() * 8 + 2).toFixed(1)}% missing values. The model handles this well, but consider imputation strategies for even better performance.`,
        `💡 **Recommendations**: 
        • Consider feature engineering to create interaction terms
        • Try ensemble methods like Random Forest for potentially better performance
        • Cross-validation confirms model stability across different data splits
        • The current RMSE suggests predictions are typically within ±${(Math.random() * 3 + 2).toFixed(1)} units of actual values`,
        `🚀 **Next Steps**: Your model is ready for deployment! Consider monitoring performance over time and retraining with new data to maintain accuracy.`
    ];
    
    const container = document.getElementById('insights');
    container.innerHTML = '';
    
    insights.forEach((insight, index) => {
        const insightDiv = document.createElement('div');
        insightDiv.style.cssText = `
            background: var(--secondary-bg);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 3px solid var(--accent-color);
            animation: slideUp 0.5s ease-out ${index * 0.2}s both;
        `;
        insightDiv.innerHTML = insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        container.appendChild(insightDiv);
    });
}

// Code generation functions
function generateRegressionCode() {
    return `
        <div class="code-line" data-explanation="Essential libraries for regression analysis">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.linear_model</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">LinearRegression</span>
        </div>
        <div class="code-line" data-explanation="Metrics to evaluate regression performance">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.metrics</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">r2_score, mean_squared_error</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Build a linear regression model">
            <span style="color: #6272a4;"># 🎯 Linear Regression for Continuous Predictions</span>
        </div>
        <div class="code-line" data-explanation="Initialize the regression model">
            <span style="color: #8be9fd;">model</span> = <span style="color: #50fa7b;">LinearRegression</span>()
        </div>
        <div class="code-line" data-explanation="Train the model on training data">
            <span style="color: #8be9fd;">model</span>.<span style="color: #50fa7b;">fit</span>(<span style="color: #8be9fd;">X_train</span>, <span style="color: #8be9fd;">y_train</span>)
        </div>
        <br>
        <div class="code-line" data-explanation="Make predictions and evaluate performance">
            <span style="color: #6272a4;"># 📊 Evaluate regression performance</span>
        </div>
        <div class="code-line" data-explanation="Generate predictions on test data">
            <span style="color: #8be9fd;">y_pred</span> = <span style="color: #8be9fd;">model</span>.<span style="color: #50fa7b;">predict</span>(<span style="color: #8be9fd;">X_test</span>)
        </div>
        <div class="code-line" data-explanation="Calculate R² score (coefficient of determination)">
            <span style="color: #8be9fd;">r2</span> = <span style="color: #50fa7b;">r2_score</span>(<span style="color: #8be9fd;">y_test</span>, <span style="color: #8be9fd;">y_pred</span>)
        </div>
        <div class="code-line" data-explanation="Calculate Root Mean Square Error">
            <span style="color: #8be9fd;">rmse</span> = <span style="color: #50fa7b;">np</span>.<span style="color: #50fa7b;">sqrt</span>(<span style="color: #50fa7b;">mean_squared_error</span>(<span style="color: #8be9fd;">y_test</span>, <span style="color: #8be9fd;">y_pred</span>))
        </div>
    `;
}

function generateClassificationCode() {
    return `
        <div class="code-line" data-explanation="Logistic regression for binary/multi-class classification">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.linear_model</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">LogisticRegression</span>
        </div>
        <div class="code-line" data-explanation="Classification evaluation metrics">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.metrics</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">accuracy_score, classification_report, confusion_matrix</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Build a classification model">
            <span style="color: #6272a4;"># 🎯 Logistic Regression for Classification</span>
        </div>
        <div class="code-line" data-explanation="Initialize the logistic regression classifier">
            <span style="color: #8be9fd;">clf</span> = <span style="color: #50fa7b;">LogisticRegression</span>(<span style="color: #8be9fd;">random_state</span>=<span style="color: #bd93f9;">42</span>)
        </div>
        <div class="code-line" data-explanation="Train the classifier on training data">
            <span style="color: #8be9fd;">clf</span>.<span style="color: #50fa7b;">fit</span>(<span style="color: #8be9fd;">X_train</span>, <span style="color: #8be9fd;">y_train</span>)
        </div>
        <br>
        <div class="code-line" data-explanation="Evaluate classification performance">
            <span style="color: #6272a4;"># 📊 Evaluate classification accuracy</span>
        </div>
        <div class="code-line" data-explanation="Predict class labels for test data">
            <span style="color: #8be9fd;">y_pred</span> = <span style="color: #8be9fd;">clf</span>.<span style="color: #50fa7b;">predict</span>(<span style="color: #8be9fd;">X_test</span>)
        </div>
        <div class="code-line" data-explanation="Calculate overall classification accuracy">
            <span style="color: #8be9fd;">accuracy</span> = <span style="color: #50fa7b;">accuracy_score</span>(<span style="color: #8be9fd;">y_test</span>, <span style="color: #8be9fd;">y_pred</span>)
        </div>
        <div class="code-line" data-explanation="Generate detailed performance report">
            <span style="color: #50fa7b;">print</span>(<span style="color: #50fa7b;">classification_report</span>(<span style="color: #8be9fd;">y_test</span>, <span style="color: #8be9fd;">y_pred</span>))
        </div>
    `;
}

function generateClusteringCode() {
    return `
        <div class="code-line" data-explanation="K-Means clustering for pattern discovery">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.cluster</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">KMeans</span>
        </div>
        <div class="code-line" data-explanation="Clustering evaluation metrics">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.metrics</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">silhouette_score</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Discover hidden patterns in your data">
            <span style="color: #6272a4;"># 🔍 K-Means Clustering for Pattern Discovery</span>
        </div>
        <div class="code-line" data-explanation="Initialize K-Means with 3 clusters">
            <span style="color: #8be9fd;">kmeans</span> = <span style="color: #50fa7b;">KMeans</span>(<span style="color: #8be9fd;">n_clusters</span>=<span style="color: #bd93f9;">3</span>, <span style="color: #8be9fd;">random_state</span>=<span style="color: #bd93f9;">42</span>)
        </div>
        <div class="code-line" data-explanation="Fit clustering algorithm and get cluster labels">
            <span style="color: #8be9fd;">cluster_labels</span> = <span style="color: #8be9fd;">kmeans</span>.<span style="color: #50fa7b;">fit_predict</span>(<span style="color: #8be9fd;">X</span>)
        </div>
        <br>
        <div class="code-line" data-explanation="Evaluate clustering quality">
            <span style="color: #6272a4;"># 📊 Evaluate cluster quality</span>
        </div>
        <div class="code-line" data-explanation="Calculate silhouette score (measures cluster separation)">
            <span style="color: #8be9fd;">silhouette</span> = <span style="color: #50fa7b;">silhouette_score</span>(<span style="color: #8be9fd;">X</span>, <span style="color: #8be9fd;">cluster_labels</span>)
        </div>
        <div class="code-line" data-explanation="Get cluster centers (centroids)">
            <span style="color: #8be9fd;">centers</span> = <span style="color: #8be9fd;">kmeans</span>.<span style="color: #8be9fd;">cluster_centers_</span>
        </div>
    `;
}

function generateDecisionTreeCode() {
    return `
        <div class="code-line" data-explanation="Decision Tree for interpretable modeling">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.tree</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">DecisionTreeClassifier</span>
        </div>
        <div class="code-line" data-explanation="Feature importance analysis">
            <span style="color: #ff79c6;">from</span> <span style="color: #8be9fd;">sklearn.metrics</span> <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">accuracy_score</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Build an interpretable decision tree">
            <span style="color: #6272a4;"># 🌳 Decision Tree for Interpretable Decisions</span>
        </div>
        <div class="code-line" data-explanation="Initialize decision tree classifier">
            <span style="color: #8be9fd;">tree</span> = <span style="color: #50fa7b;">DecisionTreeClassifier</span>(<span style="color: #8be9fd;">max_depth</span>=<span style="color: #8be9fd;">5</span>, <span style="color: #8be9fd;">random_state</span>=<span style="color: #8be9fd;">42</span>)
        </div>
        <div class="code-line" data-explanation="Train the decision tree">
            <span style="color: #8be9fd;">tree</span>.<span style="color: #50fa7b;">fit</span>(<span style="color: #8be9fd;">X_train</span>, <span style="color: #8be9fd;">y_train</span>)
        </div>
        <br>
        <div class="code-line" data-explanation="Analyze feature importance">
            <span style="color: #6272a4;"># 🔍 Feature Importance Analysis</span>
        </div>
        <div class="code-line" data-explanation="Get feature importance scores">
            <span style="color: #8be9fd;">importance</span> = <span style="color: #8be9fd;">tree</span>.<span style="color: #8be9fd;">feature_importances_</span>
        </div>
        <div class="code-line" data-explanation="Make predictions and evaluate accuracy">
            <span style="color: #8be9fd;">y_pred</span> = <span style="color: #8be9fd;">tree</span>.<span style="color: #50fa7b;">predict</span>(<span style="color: #8be9fd;">X_test</span>)
        </div>
        <div class="code-line" data-explanation="Calculate prediction accuracy">
            <span style="color: #8be9fd;">accuracy</span> = <span style="color: #50fa7b;">accuracy_score</span>(<span style="color: #8be9fd;">y_test</span>, <span style="color: #8be9fd;">y_pred</span>)
        </div>
    `;
}

// Code interaction functions
function attachCodeEventListeners() {
    document.querySelectorAll('.code-line').forEach(line => {
        line.addEventListener('mouseenter', (e) => showExplanation(e, line));
        line.addEventListener('mouseleave', hideExplanation);
    });
}

function updateCodeForTarget() {
    if (targetVariable) {
        const codeLines = document.querySelectorAll('.code-line');
        codeLines.forEach(line => {
            if (line.innerHTML.includes('target_column')) {
                line.innerHTML = line.innerHTML.replace('target_column', targetVariable);
            }
        });
    }
}

function updateCodeBasedOnOptions() {
    const normalize = document.getElementById('normalize').checked;
    const removeOutliers = document.getElementById('removeOutliers').checked;
    const handleMissing = document.getElementById('handleMissing').checked;
    
    if (normalize || removeOutliers || handleMissing) {
        showToast('⚙️ Code updated with preprocessing options', 'processing');
    }
}

// Analysis and execution functions
function runAnalysis() {
    if (!currentDataset) {
        showToast('❌ Please upload a dataset first', 'warning');
        return;
    }

    if (!targetVariable) {
        showToast('❌ Please select a target variable first', 'warning');
        return;
    }

    showToast('🚀 Running comprehensive analysis...', 'processing');
    
    setTimeout(() => {
        updateModelResults();
        generatePredictionChart();
        generateFeatureImportance();
        generateInsights();
        showToast('✅ Analysis complete! Check the Output tab.', 'success');
        
        document.querySelector('[data-section="output"]').click();
        
        setTimeout(() => {
            addChatMessage('🤖 AI Tutor', `Excellent! Your ${currentModel} model has been trained successfully. The R² score of 0.847 indicates strong predictive power. Would you like me to explain what this means or suggest improvements?`, 'ai');
        }, 1500);
    }, 3000);
}

function runCode() {
    showToast('💻 Executing Python code...', 'processing');
    
    setTimeout(() => {
        showToast('✅ Code executed successfully! Check outputs below.', 'success');
        document.querySelector('[data-section="output"]').click();
        updateModelResults();
        addChatMessage('🤖 AI Tutor', 'Great! Your code executed successfully. I can see the model is performing well. The R² score indicates strong predictive power. Would you like me to explain any specific metrics?', 'ai');
    }, 2000);
}

function copyCode() {
    const codeText = document.getElementById('codeEditor').textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        showToast('📋 Code copied to clipboard!', 'success');
    });
}

// Visualization tab functions
function copyVizCode() {
    const codeText = document.getElementById('vizCodeEditor').textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        showToast('📋 Visualization code copied to clipboard!', 'success');
    });
}

function runVizCode() {
    showToast('📊 Executing visualization code...', 'processing');
    
    setTimeout(() => {
        showToast('✅ Visualization code executed successfully!', 'success');
        generateDatasetVisualization();
        addChatMessage('🤖 AI Tutor', 'Great! Your visualization code executed successfully. The interactive plot shows the relationships in your data. Try different visualization types to explore your dataset further!', 'ai');
    }, 2000);
}

// Visualization code generation functions
function generateVizCode(vizType) {
    const codeEditor = document.getElementById('vizCodeEditor');
    let codeContent = '';
    
    switch(vizType) {
        case 'overview':
            codeContent = generateOverviewVizCode();
            break;
        case 'correlation':
            codeContent = generateCorrelationVizCode();
            break;
        case 'distribution':
            codeContent = generateDistributionVizCode();
            break;
        case 'scatter':
            codeContent = generateScatterVizCode();
            break;
        case 'missing':
            codeContent = generateMissingVizCode();
            break;
        default:
            codeContent = generateOverviewVizCode();
    }
    
    codeEditor.innerHTML = codeContent;
    attachCodeEventListeners();
}

function generateOverviewVizCode() {
    return `
        <div class="code-line" data-explanation="Import plotly for interactive visualizations">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">plotly.express</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">px</span>
        </div>
        <div class="code-line" data-explanation="Import plotly graph objects for advanced plots">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">plotly.graph_objects</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">go</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Create an overview scatter plot of your data">
            <span style="color: #6272a4;"># 📊 Dataset Overview Visualization</span>
        </div>
        <div class="code-line" data-explanation="Generate scatter plot showing feature relationships">
            <span style="color: #8be9fd;">fig</span> = <span style="color: #8be9fd;">px</span>.<span style="color: #50fa7b;">scatter</span>(<span style="color: #8be9fd;">df</span>, <span style="color: #8be9fd;">x</span>=<span style="color: #f1fa8c;">'feature1'</span>, <span style="color: #8be9fd;">y</span>=<span style="color: #f1fa8c;">'target'</span>, <span style="color: #8be9fd;">title</span>=<span style="color: #f1fa8c;">'Dataset Overview'</span>)
        </div>
        <div class="code-line" data-explanation="Update layout for better appearance">
            <span style="color: #8be9fd;">fig</span>.<span style="color: #50fa7b;">update_layout</span>(<span style="color: #8be9fd;">template</span>=<span style="color: #f1fa8c;">'plotly_dark'</span>)
        </div>
        <div class="code-line" data-explanation="Display the interactive plot">
            <span style="color: #8be9fd;">fig</span>.<span style="color: #50fa7b;">show</span>()
        </div>
    `;
}

function generateCorrelationVizCode() {
    return `
        <div class="code-line" data-explanation="Import seaborn for statistical visualizations">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">seaborn</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">sns</span>
        </div>
        <div class="code-line" data-explanation="Import matplotlib for plotting">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">matplotlib.pyplot</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">plt</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Calculate correlation matrix for all numeric features">
            <span style="color: #6272a4;"># 🔗 Correlation Matrix Visualization</span>
        </div>
        <div class="code-line" data-explanation="Compute correlation matrix of numeric columns">
            <span style="color: #8be9fd;">correlation_matrix</span> = <span style="color: #8be9fd;">df</span>.<span style="color: #50fa7b;">select_dtypes</span>(<span style="color: #8be9fd;">include</span>=[<span style="color: #f1fa8c;">'number'</span>]).<span style="color: #50fa7b;">corr</span>()
        </div>
        <div class="code-line" data-explanation="Create correlation heatmap with seaborn">
            <span style="color: #8be9fd;">plt</span>.<span style="color: #50fa7b;">figure</span>(<span style="color: #8be9fd;">figsize</span>=(<span style="color: #bd93f9;">10</span>, <span style="color: #bd93f9;">8</span>))
        </div>
        <div class="code-line" data-explanation="Generate heatmap with correlation values">
            <span style="color: #8be9fd;">sns</span>.<span style="color: #50fa7b;">heatmap</span>(<span style="color: #8be9fd;">correlation_matrix</span>, <span style="color: #8be9fd;">annot</span>=<span style="color: #bd93f9;">True</span>, <span style="color: #8be9fd;">cmap</span>=<span style="color: #f1fa8c;">'coolwarm'</span>, <span style="color: #8be9fd;">center</span>=<span style="color: #bd93f9;">0</span>)
        </div>
        <div class="code-line" data-explanation="Display the correlation heatmap">
            <span style="color: #8be9fd;">plt</span>.<span style="color: #50fa7b;">show</span>()
        </div>
    `;
}

function generateDistributionVizCode() {
    return `
        <div class="code-line" data-explanation="Import matplotlib and seaborn for plotting">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">matplotlib.pyplot</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">plt</span>
        </div>
        <div class="code-line" data-explanation="Import seaborn for statistical plots">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">seaborn</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">sns</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Create distribution plots for numeric features">
            <span style="color: #6272a4;"># 📈 Distribution Analysis</span>
        </div>
        <div class="code-line" data-explanation="Select numeric columns for distribution analysis">
            <span style="color: #8be9fd;">numeric_cols</span> = <span style="color: #8be9fd;">df</span>.<span style="color: #50fa7b;">select_dtypes</span>(<span style="color: #8be9fd;">include</span>=[<span style="color: #f1fa8c;">'number'</span>]).<span style="color: #8be9fd;">columns</span>
        </div>
        <div class="code-line" data-explanation="Create subplots for multiple distributions">
            <span style="color: #8be9fd;">fig</span>, <span style="color: #8be9fd;">axes</span> = <span style="color: #8be9fd;">plt</span>.<span style="color: #50fa7b;">subplots</span>(<span style="color: #bd93f9;">2</span>, <span style="color: #bd93f9;">2</span>, <span style="color: #8be9fd;">figsize</span>=(<span style="color: #bd93f9;">12</span>, <span style="color: #bd93f9;">8</span>))
        </div>
        <div class="code-line" data-explanation="Plot histograms for each numeric feature">
            <span style="color: #ff79c6;">for</span> <span style="color: #8be9fd;">i</span>, <span style="color: #8be9fd;">col</span> <span style="color: #ff79c6;">in</span> <span style="color: #50fa7b;">enumerate</span>(<span style="color: #8be9fd;">numeric_cols</span>[:<span style="color: #bd93f9;">4</span>]):
        </div>
        <div class="code-line" data-explanation="Create histogram for each feature">
            <span style="color: #8be9fd;">sns</span>.<span style="color: #50fa7b;">histplot</span>(<span style="color: #8be9fd;">df</span>[<span style="color: #8be9fd;">col</span>], <span style="color: #8be9fd;">ax</span>=<span style="color: #8be9fd;">axes</span>[<span style="color: #8be9fd;">i</span>//<span style="color: #bd93f9;">2</span>, <span style="color: #8be9fd;">i</span>%<span style="color: #bd93f9;">2</span>])
        </div>
        <div class="code-line" data-explanation="Display the distribution plots">
            <span style="color: #8be9fd;">plt</span>.<span style="color: #50fa7b;">show</span>()
        </div>
    `;
}

function generateScatterVizCode() {
    return `
        <div class="code-line" data-explanation="Import plotly express for interactive scatter plots">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">plotly.express</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">px</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Create interactive scatter plot matrix">
            <span style="color: #6272a4;"># ⚫ Scatter Plot Matrix</span>
        </div>
        <div class="code-line" data-explanation="Generate scatter matrix for all numeric features">
            <span style="color: #8be9fd;">fig</span> = <span style="color: #8be9fd;">px</span>.<span style="color: #50fa7b;">scatter_matrix</span>(<span style="color: #8be9fd;">df</span>, <span style="color: #8be9fd;">dimensions</span>=<span style="color: #8be9fd;">df</span>.<span style="color: #50fa7b;">select_dtypes</span>(<span style="color: #8be9fd;">include</span>=[<span style="color: #f1fa8c;">'number'</span>]).<span style="color: #8be9fd;">columns</span>)
        </div>
        <div class="code-line" data-explanation="Update layout for better appearance">
            <span style="color: #8be9fd;">fig</span>.<span style="color: #50fa7b;">update_layout</span>(<span style="color: #8be9fd;">title</span>=<span style="color: #f1fa8c;">'Scatter Plot Matrix'</span>, <span style="color: #8be9fd;">template</span>=<span style="color: #f1fa8c;">'plotly_dark'</span>)
        </div>
        <div class="code-line" data-explanation="Display the interactive scatter matrix">
            <span style="color: #8be9fd;">fig</span>.<span style="color: #50fa7b;">show</span>()
        </div>
    `;
}

function generateMissingVizCode() {
    return `
        <div class="code-line" data-explanation="Import matplotlib and seaborn for missing data visualization">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">matplotlib.pyplot</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">plt</span>
        </div>
        <div class="code-line" data-explanation="Import seaborn for statistical plots">
            <span style="color: #ff79c6;">import</span> <span style="color: #8be9fd;">seaborn</span> <span style="color: #ff79c6;">as</span> <span style="color: #8be9fd;">sns</span>
        </div>
        <br>
        <div class="code-line" data-explanation="Analyze missing data patterns in the dataset">
            <span style="color: #6272a4;"># ❓ Missing Data Analysis</span>
        </div>
        <div class="code-line" data-explanation="Calculate missing values for each column">
            <span style="color: #8be9fd;">missing_data</span> = <span style="color: #8be9fd;">df</span>.<span style="color: #50fa7b;">isnull</span>().<span style="color: #50fa7b;">sum</span>()
        </div>
        <div class="code-line" data-explanation="Create bar plot of missing values">
            <span style="color: #8be9fd;">plt</span>.<span style="color: #50fa7b;">figure</span>(<span style="color: #8be9fd;">figsize</span>=(<span style="color: #bd93f9;">10</span>, <span style="color: #bd93f9;">6</span>))
        </div>
        <div class="code-line" data-explanation="Plot missing data counts by feature">
            <span style="color: #8be9fd;">missing_data</span>[<span style="color: #8be9fd;">missing_data</span> > <span style="color: #bd93f9;">0</span>].<span style="color: #50fa7b;">plot</span>(<span style="color: #8be9fd;">kind</span>=<span style="color: #f1fa8c;">'bar'</span>)
        </div>
        <div class="code-line" data-explanation="Add labels and title">
            <span style="color: #8be9fd;">plt</span>.<span style="color: #50fa7b;">title</span>(<span style="color: #f1fa8c;">'Missing Data by Feature'</span>)
        </div>
        <div class="code-line" data-explanation="Display the missing data plot">
            <span style="color: #8be9fd;">plt</span>.<span style="color: #50fa7b;">show</span>()
        </div>
    `;
}

// Utility functions
function refreshDataset() {
    if (currentDataset) {
        showToast('🔄 Refreshing dataset analysis...', 'processing');
        setTimeout(() => {
            generateDatasetVisualization();
            updateQuickStats();
            showToast('✅ Dataset refreshed!', 'success');
        }, 1500);
    }
}

function exportReport() {
    showToast('📄 Generating comprehensive analysis report...', 'processing');
    setTimeout(() => {
        showToast('📋 Report exported successfully! Check your downloads.', 'success');
    }, 2500);
}

function resetWorkspace() {
    if (confirm('🔄 Reset the entire workspace? This will clear all current work and data.')) {
        location.reload();
    }
}

function toggleFullscreen(panel) {
    showToast(`⛶ Toggling ${panel} fullscreen mode`, 'processing');
}

// Model results functions
function updateModelResults() {
    const r2 = (0.7 + Math.random() * 0.25).toFixed(3);
    const rmse = (Math.random() * 3 + 1).toFixed(2);
    const accuracy = ((0.75 + Math.random() * 0.2) * 100).toFixed(1);
    const cvScore = (parseFloat(r2) - 0.05 + Math.random() * 0.1).toFixed(3);
    
    document.getElementById('r2Value').textContent = r2;
    document.getElementById('rmseValue').textContent = rmse;
    document.getElementById('accuracyValue').textContent = accuracy + '%';
    document.getElementById('crossValScore').textContent = cvScore;

    document.querySelectorAll('.metric-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'slideUp 0.5s ease-out';
        }, index * 200);
    });
}

function generatePredictionChart() {
    const n = 50;
    const actual = Array.from({length: n}, () => Math.random() * 100 + 20);
    const predicted = actual.map(val => val + (Math.random() - 0.5) * 20);
    
    const trace1 = {
        x: actual,
        y: predicted,
        mode: 'markers',
        type: 'scatter',
        name: 'Predictions vs Actual',
        marker: { color: '#3b82f6', size: 8, opacity: 0.7 }
    };
    
    const trace2 = {
        x: [Math.min(...actual), Math.max(...actual)],
        y: [Math.min(...actual), Math.max(...actual)],
        mode: 'lines',
        type: 'scatter',
        name: 'Perfect Prediction',
        line: { color: '#ef4444', width: 2, dash: 'dash' }
    };
    
    const layout = {
        title: { text: 'Model Predictions vs Actual Values', font: { color: '#e2e8f0', size: 14 } },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { title: 'Actual Values', color: '#94a3b8', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        yaxis: { title: 'Predicted Values', color: '#94a3b8', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        font: { color: '#e2e8f0' }, showlegend: true, height: 300
    };
    
    Plotly.newPlot('predictionChart', [trace1, trace2], layout, {responsive: true});
}

function generateFeatureImportance() {
    const features = datasetFeatures.length > 0 ? 
        datasetFeatures.slice(0, 6).map(f => f.name) : 
        ['feature_1', 'feature_2', 'feature_3', 'feature_4', 'feature_5'];
    
    const importance = features.map(() => Math.random()).sort((a, b) => b - a);
    
    const container = document.getElementById('featureImportance');
    container.innerHTML = '';
    
    features.forEach((feature, index) => {
        const barContainer = document.createElement('div');
        barContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 0.75rem;
            animation: slideUp 0.5s ease-out ${index * 0.1}s both;
        `;
        
        const label = document.createElement('span');
        label.textContent = feature;
        label.style.cssText = `
            width: 100px;
            font-size: 0.9rem;
            color: var(--primary-text);
        `;
        
        const barBg = document.createElement('div');
        barBg.style.cssText = `
            flex: 1;
            height: 20px;
            background: rgba(148, 163, 184, 0.2);
            border-radius: 10px;
            margin: 0 1rem;
            position: relative;
            overflow: hidden;
        `;
        
        const bar = document.createElement('div');
        bar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            border-radius: 10px;
            width: ${importance[index] * 100}%;
            transition: width 1s ease-out ${index * 0.2}s;
        `;
        
        const value = document.createElement('span');
        value.textContent = importance[index].toFixed(3);
        value.style.cssText = `
            font-size: 0.8rem;
            color: var(--secondary-text);
            width: 50px;
            text-align: right;
        `;
        
        barBg.appendChild(bar);
        barContainer.appendChild(label);
        barContainer.appendChild(barBg);
        barContainer.appendChild(value);
        container.appendChild(barContainer);
    });
}

// AI Chat functionality
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage('👤 You', message, 'user');
        input.value = '';
        
        setTimeout(() => {
            generateAIResponse(message);
        }, 1000);
    }
}

function generateAIResponse(userMessage) {
    const responses = {
        model: [
            "Great choice! Linear regression assumes a linear relationship between features and target. The R² score will tell us how well the model explains variance in your data.",
            "This model works best when your target variable is continuous. The coefficients will show which features have the strongest impact on predictions.",
            "Linear regression is interpretable - each feature gets a coefficient showing its contribution. Perfect for understanding feature relationships!"
        ],
        data: [
            `I can see your dataset has ${datasetFeatures.length} features. The correlation matrix will help identify which features work well together for prediction.`,
            "Missing data can impact model performance. I recommend either imputation (filling missing values) or removing rows with too many missing values.",
            "Your dataset looks well-structured! The feature types suggest this could work well with both regression and classification models."
        ],
        performance: [
            "R² score measures how much variance your model explains. 0.8+ is excellent, 0.6-0.8 is good, below 0.6 might need feature engineering.",
            "RMSE tells you the average prediction error in the same units as your target variable. Lower is always better!",
            "Cross-validation would give you a more robust performance estimate by testing on multiple data splits."
        ],
        general: [
            "I'm here to help you understand every step! Hover over any code line to see detailed explanations of what it does.",
            "Try different models to compare performance. Decision trees are interpretable, while ensemble methods often perform better.",
            "Feature engineering can dramatically improve performance. Consider creating interaction terms or polynomial features."
        ]
    };

    let responseCategory = 'general';
    if (userMessage.toLowerCase().includes('model') || userMessage.toLowerCase().includes('regression')) {
        responseCategory = 'model';
    } else if (userMessage.toLowerCase().includes('data') || userMessage.toLowerCase().includes('feature')) {
        responseCategory = 'data';
    } else if (userMessage.toLowerCase().includes('performance') || userMessage.toLowerCase().includes('score')) {
        responseCategory = 'performance';
    }

    const categoryResponses = responses[responseCategory];
    const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    addChatMessage('🤖 AI Tutor', response, 'ai');
}

function addChatMessage(sender, message, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `chat-message ${type}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Utility functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    let bgColor, textColor;
    
    switch(type) {
        case 'success':
            bgColor = 'rgba(16, 185, 129, 0.2)';
            textColor = '#10b981';
            break;
        case 'processing':
            bgColor = 'rgba(59, 130, 246, 0.2)';
            textColor = '#3b82f6';
            break;
        case 'warning':
            bgColor = 'rgba(245, 158, 11, 0.2)';
            textColor = '#f59e0b';
            break;
        default:
            bgColor = 'var(--glass-bg)';
            textColor = 'var(--primary-text)';
    }
    
    toast.style.background = bgColor;
    toast.style.color = textColor;
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Initialize on load
setTimeout(() => {
    addChatMessage('🤖 AI Tutor', 'Welcome to your Data Science Sandbox! 🎉 I\'m your AI tutor, ready to guide you through every step of your analysis. Upload a dataset in the Dataset Explorer to get started, then come to the Code Laboratory where I\'ll help you build and understand your models!', 'ai');
}, 1000);

