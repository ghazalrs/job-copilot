import json
import google.generativeai as genai
from typing import Dict, Any
from app.config import settings
from .cover_letter_prompt import get_cover_letter_prompt


genai.configure(api_key=settings.GEMINI_API_KEY)


async def generate_cover_letter(
    job_description: str,
    master_resume: str,
    company_name: str = "",
    job_title: str = ""
) -> Dict[str, Any]:

    prompt = get_cover_letter_prompt(
        job_description=job_description,
        master_resume=master_resume,
        company_name=company_name,
        job_title=job_title
    )

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash-lite')

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 4096,
                "response_mime_type": "application/json",
            }
        )

        result = json.loads(response.text)
        return result

    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")

    except Exception as e:
        raise Exception(f"Error calling Gemini API: {str(e)}")
