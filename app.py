# Flask backend

from flask import Flask, render_template, request, jsonify
import pandas as pd
from models.model_templates import run_linear_regression
from utils.ai_helper import ask_ai

app = Flask(__name__)

df = None  # Placeholder for uploaded dataset

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_dataset():
    global df
    file = request.files['file']
    df = pd.read_csv(file)
    summary = df.describe().to_dict()  # Simple summary
    return jsonify({'columns': list(df.columns), 'summary': summary})
    

@app.route('/run_model', methods=['POST'])
def run_model():
    model_type = request.json['model']
    if model_type == 'linear':
        results, code_snippet, fig_json = run_linear_regression(df)
        return jsonify({'results': results, 'code': code_snippet, 'figure': fig_json})
    return jsonify({'error': 'Model not implemented yet'})


@app.route('/ai_query', methods=['POST'])
def ai_query():
    query = request.json['query']
    summary = df.describe().to_dict()
    response = ask_ai(summary, query)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5001)

