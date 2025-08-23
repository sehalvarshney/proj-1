import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomRequest(BaseModel):
    symptoms: str

class DiagnosisResponse(BaseModel):
    diagnoses: List[str]
    recommendations: List[str]

# For production, use environment variables instead of hardcoding your token!
token_3 = "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"
API_URL = "https://router.huggingface.co/v1/chat/completions"
headers = {"Authorization": f"Bearer {token_3}"}

def query_hf(prompt: str):
    payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "meta-llama/Llama-3.1-8B-Instruct:fireworks-ai"
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code != 200:
        return None, response.text
    result = response.json()
    if "choices" in result and len(result["choices"]) > 0:
        return result["choices"][0]["message"]["content"], None
    return None, str(result)

@app.post("/api/diagnose", response_model=DiagnosisResponse)
async def diagnose(symptom_request: SymptomRequest):
    prompt = (
        f"A patient presents with the following symptoms: {symptom_request.symptoms}. "
        "List the top 3 possible diagnoses and 3 next step recommendations. "
        "Format your answer as: Diagnoses: ... Recommendations: ..."
    )
    output, error = query_hf(prompt)
    if error:
        return DiagnosisResponse(
            diagnoses=["Error: Unable to get response from Hugging Face API."],
            recommendations=[error, "Disclaimer: This is an AI-generated suggestion. Consult a real doctor for medical advice."]
        )
    diagnoses = []
    recommendations = []
    if output and "Diagnoses:" in output and "Recommendations:" in output:
        diag_part = output.split("Diagnoses:")[1].split("Recommendations:")[0].strip()
        rec_part = output.split("Recommendations:")[1].strip()
        diagnoses = [d.strip("- ") for d in diag_part.split("\n") if d.strip()]
        recommendations = [r.strip("- ") for r in rec_part.split("\n") if r.strip()]
    else:
        diagnoses = [output.strip() if output else "No output"]
        recommendations = ["Consult a healthcare professional for confirmation."]
    recommendations.append("Disclaimer: This is an AI-generated suggestion. Consult a real doctor for medical advice.")
    return DiagnosisResponse(
        diagnoses=diagnoses,
        recommendations=recommendations
    ) 