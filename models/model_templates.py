# Python functions for model templates

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import plotly.graph_objects as go

def run_linear_regression(df):
    # Use first numeric column as X, second as y
    numeric_cols = df.select_dtypes(include='number').columns
    if len(numeric_cols) < 2:
        return {'error': 'Need at least two numeric columns'}, "", {}
    
    X = df[[numeric_cols[0]]]
    y = df[numeric_cols[1]]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    # Create Plotly figure
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=X[numeric_cols[0]], y=y, mode='markers', name='Data'))
    fig.add_trace(go.Scatter(x=X_test[numeric_cols[0]], y=y_pred, mode='lines', name='Regression Line'))
    fig.update_layout(title='Linear Regression', xaxis_title=numeric_cols[0], yaxis_title=numeric_cols[1])
    
    # Convert to JSON for frontend
    fig_json = fig.to_json()
    
    results = {'mse': mse, 'r2': r2}
    
    code_snippet = f"""
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

X = df[['{numeric_cols[0]}']]
y = df['{numeric_cols[1]}']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

lr = LinearRegression()
lr.fit(X_train, y_train)
y_pred = lr.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(mse, r2)
"""
    return results, code_snippet, fig_json
