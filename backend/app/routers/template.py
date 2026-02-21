from fastapi import APIRouter
from app.services.default_templates import DEFAULT_RESUME_TEMPLATE

router = APIRouter(prefix="/template", tags=["template"])


@router.get("/resume")
def get_resume_template():
    # Get the default LaTeX resume template.
    return {
        "template_type": "resume",
        "content": DEFAULT_RESUME_TEMPLATE
    }
