import os
import re
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gemini-3.6-flash"
    api_key: Optional[str] = None
    system_instruction: Optional[str] = None

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are Dr. Mitra AI, an intelligent, empathetic clinical intake and triage assistant for the MediMitra MedTech platform.\n"
    "1. Help patients understand their health concerns empathetically and accessibly.\n"
    "2. Ask structured follow-up questions regarding duration, severity, and associated symptoms.\n"
    "3. Support both English and Hindi naturally based on user language.\n"
    "4. Highlight RED FLAGS immediately: if severe symptoms (chest pain radiating to arm, acute breathlessness, sudden speech loss, stiff neck with fever) are reported, instruct immediate emergency hospital visitation.\n"
    "5. Maintain clinical boundaries: state you provide educational support and do not formally diagnose or prescribe."
)

RED_FLAG_REGEX = re.compile(
    r"(chest\s+pain|shortness\s+of\s+breath|difficulty\s+breathing|coughing\s+(up\s+)?blood|"
    r"vomiting\s+blood|loss\s+of\s+consciousness|sudden\s+weakness|stiff\s+neck\s+with\s+fever|"
    r"सीने\s+में\s+दर्द|सांस\s+फूलना|खून\s+की\s+उल्टी)",
    re.IGNORECASE
)

@router.get("/status")
def get_chat_status():
    backend_key = os.environ.get("GEMINI_API_KEY", "")
    return {
        "status": "active",
        "backend_key_configured": bool(backend_key.strip()),
        "default_model": "gemini-3.6-flash",
        "supported_models": ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"]
    }

@router.post("/gemini")
async def chat_with_gemini(req: ChatRequest, x_gemini_api_key: Optional[str] = Header(None)):
    api_key = req.api_key or x_gemini_api_key or os.environ.get("GEMINI_API_KEY", "")
    api_key = api_key.strip()

    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Gemini API key is required. Please provide it in request body, X-Gemini-API-Key header, or GEMINI_API_KEY environment variable."
        )

    model = req.model or "gemini-3.6-flash"
    if model in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]:
        model = "gemini-3.6-flash"
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    contents = []
    for msg in req.messages:
        role = "model" if msg.role == "assistant" else "user"
        contents.append({
            "role": role,
            "parts": [{"text": msg.content}]
        })

    system_text = req.system_instruction or DEFAULT_SYSTEM_INSTRUCTION

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_text}]
        },
        "generationConfig": {
            "temperature": 0.35,
            "maxOutputTokens": 1500
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.post(endpoint, json=payload)
            if res.status_code != 200:
                err_data = res.json()
                detail = err_data.get("error", {}).get("message", f"Gemini API returned status {res.status_code}")
                raise HTTPException(status_code=res.status_code, detail=detail)

            data = res.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise HTTPException(status_code=500, detail="No response candidate received from Gemini")

            text_response = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            has_red_flag = bool(RED_FLAG_REGEX.search(text_response)) or bool(
                RED_FLAG_REGEX.search(req.messages[-1].content if req.messages else "")
            )

            return {
                "text": text_response,
                "has_red_flag": has_red_flag,
                "model": model,
                "source": "gemini-backend-proxy"
            }
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Failed to communicate with Gemini API: {str(exc)}")
