# API calls to OpenAI (guidance)

import openai
import os

# Set API key from environment variable or use placeholder
openai.api_key = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY")

def ask_ai(summary, user_query):
    try:
        prompt = f"""
Dataset summary: {summary}
Question: {user_query}
Guidelines: Explain in beginner-friendly terms. Reference the dataset where applicable. Do not give full answers, only guidance.
"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role":"user", "content": prompt}],
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"AI service temporarily unavailable. Error: {str(e)}"

