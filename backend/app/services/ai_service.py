import json
import google.generativeai as genai
from typing import Dict, Any
from app.config import settings
from app.services.latex_renderer import render_latex, parse_resume_data
from .prompt import get_prompt


# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


async def tailor_resume(
    job_description: str,
    master_resume: str
) -> Dict[str, Any]:

    prompt = get_prompt(job_description, master_resume)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash-lite')

        # Generate content with JSON response
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            }
        )

        # Parse JSON response
        result = json.loads(response.text)

        # Generate LaTeX from structured data
        if 'resume_data' in result:
            try:
                resume_data = parse_resume_data(result['resume_data'])
                result['tailored_resume_latex'] = render_latex(resume_data)
            except Exception as e:
                print(f"LaTeX rendering error: {e}")
                result['tailored_resume_latex'] = f"Error generating LaTeX: {str(e)}"

        return result

    except json.JSONDecodeError as e:
        # Log the error for debugging
        print(f"JSON Parse Error: {str(e)}")
        print(f"Response preview: {response.text[:500]}...")
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")

    except Exception as e:
        # Handle other errors
        raise Exception(f"Error calling Gemini API: {str(e)}")
