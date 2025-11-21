from fastapi import APIRouter, UploadFile, File, HTTPException
from openai import OpenAI
import pdfplumber
import tempfile
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings
import json

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

client = OpenAI(
            base_url=settings.BASE_URL_API_GROQ,
            api_key=settings.SECRET_KEY_API_GROQ
                )

@router.post("/read-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    
    """
    Lee un PDF, extrae el texto y devuelve los datos estructurados de la factura.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        text = ""
        with pdfplumber.open(tmp_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        prompt = f"""
        Analiza el siguiente texto de una factura y devuelve un objeto JSON pero en category solo puede ser mantenimiento, alquilado o vendido, ademas el amount solo quiero el  numero y con estas claves:
        {{
            "category": "",
            "date": "",
            "description": "",
            "amount": ""
        }}
        ademas solo quiero me des el json no agregues mas palabras,
        Texto:
        {text}
        """
        try:
            response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Eres un asistente experto en extraer información estructurada de facturas."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        ai_output = response.choices[0].message.content.strip()
        
        try:
            parsed = json.loads(ai_output)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON returned by AI")
        
        return {"success": True, "data": parsed}
        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))