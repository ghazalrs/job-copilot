from typing import List, Optional
from pydantic import BaseModel
from jinja2 import Environment, BaseLoader
from .cover_letter_templates import DEFAULT_COVER_LETTER_TEMPLATE


class CandidateInfo(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None


class RecipientInfo(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: str
    address: Optional[str] = None


class CoverLetterData(BaseModel):
    candidate: CandidateInfo
    recipient: RecipientInfo
    date: str
    job_title: Optional[str] = None
    body_paragraphs: List[str]


LATEX_TEMPLATE = DEFAULT_COVER_LETTER_TEMPLATE


def escape_latex(text: str) -> str:

    if not text:
        return text

    replacements = [
        ('\\', r'\textbackslash{}'),
        ('&', r'\&'),
        ('%', r'\%'),
        ('$', r'\$'),
        ('#', r'\#'),
        ('_', r'\_'),
        ('{', r'\{'),
        ('}', r'\}'),
        ('~', r'\textasciitilde{}'),
        ('^', r'\textasciicircum{}'),
    ]

    for old, new in replacements:
        text = text.replace(old, new)

    return text


def render_cover_letter_latex(data: CoverLetterData) -> str:

    env = Environment(
        loader=BaseLoader(),
        variable_start_string='<<',
        variable_end_string='>>',
        block_start_string='<%',
        block_end_string='%>',
        comment_start_string='<#',
        comment_end_string='#>',
        autoescape=False,
    )

    env.filters['escape_latex'] = escape_latex

    template = env.from_string(LATEX_TEMPLATE)

    # Escape all text content before rendering
    escaped_data = escape_cover_letter_data(data)

    return template.render(
        candidate=escaped_data.candidate,
        recipient=escaped_data.recipient,
        date=escaped_data.date,
        job_title=escaped_data.job_title,
        body_paragraphs=escaped_data.body_paragraphs,
    )


def escape_cover_letter_data(data: CoverLetterData) -> CoverLetterData:

    # Escape candidate info (but not URLs/email)
    escaped_candidate = CandidateInfo(
        name=escape_latex(data.candidate.name),
        email=data.candidate.email,  
        phone=escape_latex(data.candidate.phone) if data.candidate.phone else None,
        linkedin=data.candidate.linkedin,  
        github=data.candidate.github,  
        location=escape_latex(data.candidate.location) if data.candidate.location else None,
    )

    # Escape recipient info
    escaped_recipient = RecipientInfo(
        name=escape_latex(data.recipient.name) if data.recipient.name else None,
        title=escape_latex(data.recipient.title) if data.recipient.title else None,
        company=escape_latex(data.recipient.company),
        address=escape_latex(data.recipient.address) if data.recipient.address else None,
    )

    # Escape body paragraphs
    escaped_paragraphs = [escape_latex(p) for p in data.body_paragraphs]

    return CoverLetterData(
        candidate=escaped_candidate,
        recipient=escaped_recipient,
        date=escape_latex(data.date),
        job_title=escape_latex(data.job_title) if data.job_title else None,
        body_paragraphs=escaped_paragraphs,
    )


def parse_cover_letter_data(data: dict) -> CoverLetterData:

    return CoverLetterData(
        candidate=CandidateInfo(**data.get('candidate', {})),
        recipient=RecipientInfo(**data.get('recipient', {})),
        date=data.get('date', ''),
        job_title=data.get('job_title'),
        body_paragraphs=data.get('body_paragraphs', []),
    )
