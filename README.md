# Data Science Sandbox

An interactive web application for exploring datasets, building machine learning models, and learning data science concepts through hands-on experimentation.

## Purpose

Data Science Sandbox is designed to be an educational and exploratory tool that makes data science accessible to beginners while providing powerful capabilities for more advanced users. The platform allows users to:

- Upload and explore datasets interactively
- Build and visualize machine learning models
- Get AI-powered guidance on data science concepts
- Experiment with code in a safe, guided environment
- Learn through interactive visualizations and explanations

## Current Status: Initial Scaffolding

This project is in its early development phase. The current implementation includes:

### Implemented Features

- **Dataset Upload**: CSV file upload and basic dataset exploration
- **Linear Regression Model**: Basic linear regression with visualization
- **Interactive UI**: Modern web interface with tabbed navigation
- **AI Helper**: Integration with OpenAI for guidance (requires API key)
- **Visualizations**: Plotly-based interactive charts

### Planned Features

- **Additional Models**:
  - Logistic Regression
  - Decision Trees
  - Random Forest
  - Clustering (K-Means)
  - Neural Networks

- **Enhanced Data Processing**:
  - Data cleaning tools
  - Feature engineering utilities
  - Data transformation pipelines
  - Missing value handling

- **Advanced Visualizations**:
  - Correlation matrices
  - Distribution plots

- **Code Laboratory**:
  - Interactive code editor
  - Code templates for common tasks
  - Exportable analysis notebooks
  - Code execution sandbox

- **Learning Resources**:
  - Contextual tutorials
  - Model explanations
  - Best practices guidance
  - Example datasets

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd data_science_sandbox
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Set up OpenAI API key for AI features:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### Running the Application

```bash
python app.py
```

The application will be available at `http://localhost:5001`

## Project Structure

```
data_science_sandbox/
├── app.py                 # Flask application entry point
├── models/                # Machine learning model templates
│   └── model_templates.py
├── utils/                 # Utility functions
│   ├── ai_helper.py       # OpenAI integration
│   └── data_processing.py # Data processing utilities
├── templates/             # HTML templates
│   ├── index.html         # Main application page
│   └── dashboard.html
├── static/                # Static assets
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript files
└── datasets/              # Uploaded datasets storage
```

## Technology Stack

- **Backend**: Flask (Python)
- **Data Processing**: pandas, numpy, scikit-learn, statsmodels
- **Visualization**: Plotly, matplotlib
- **Frontend**: HTML, CSS, JavaScript
- **AI Integration**: OpenAI API

## Development Roadmap

1. **Phase 1** (Current): Core infrastructure and basic linear regression
2. **Phase 2**: Additional ML models and enhanced visualizations
3. **Phase 3**: Advanced data processing and feature engineering
4. **Phase 4**: Code laboratory and export functionality
5. **Phase 5**: User accounts, project saving, and collaboration features

## Contributing

This is an active development project. Contributions and suggestions are welcome!

## License

[To be determined]

---

**Note**: This is an early-stage project. Features and APIs may change as development progresses.

