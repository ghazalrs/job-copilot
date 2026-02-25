from typing import List, Optional
from pydantic import BaseModel
from jinja2 import Environment, BaseLoader
from .default_templates import DEFAULT_RESUME_TEMPLATE


class ContactInfo(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class Education(BaseModel):
    school: str
    location: str
    degree: str
    dates: str


class Experience(BaseModel):
    company: str
    location: str
    title: str
    dates: str
    bullets: List[str]


class Project(BaseModel):
    name: str
    technologies: str
    bullets: List[str]


class Skills(BaseModel):
    languages: Optional[str] = None
    frameworks: Optional[str] = None
    tools: Optional[str] = None


class ResumeData(BaseModel):
    contact: ContactInfo
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    skills: Skills


LATEX_TEMPLATE = DEFAULT_RESUME_TEMPLATE


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


def escape_latex_url(text: str) -> str:
    
    if not text:
        return text

    return text.replace('_', r'\_')



def render_latex(data: ResumeData) -> str:
    
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

    # Add the escape function to the template
    env.filters['escape_latex'] = escape_latex

    template = env.from_string(LATEX_TEMPLATE)

    # Escape all text content before rendering
    escaped_data = escape_resume_data(data)

    return template.render(
        contact=escaped_data.contact,
        education=escaped_data.education,
        experience=escaped_data.experience,
        projects=escaped_data.projects,
        skills=escaped_data.skills,
    )


def escape_resume_data(data: ResumeData) -> ResumeData:
    
    # Escape contact info (but not URLs)
    escaped_contact = ContactInfo(
        name=escape_latex(data.contact.name),
        phone=escape_latex(data.contact.phone) if data.contact.phone else None,
        email=data.contact.email,  
        linkedin=data.contact.linkedin,  
        github=data.contact.github,  
    )

    # Escape education
    escaped_education = [
        Education(
            school=escape_latex(edu.school),
            location=escape_latex(edu.location),
            degree=escape_latex(edu.degree),
            dates=escape_latex(edu.dates),
        )
        for edu in data.education
    ]

    # Escape experience
    escaped_experience = [
        Experience(
            company=escape_latex(exp.company),
            location=escape_latex(exp.location),
            title=escape_latex(exp.title),
            dates=escape_latex(exp.dates),
            bullets=[escape_latex(b) for b in exp.bullets],
        )
        for exp in data.experience
    ]

    # Escape projects
    escaped_projects = [
        Project(
            name=escape_latex(proj.name),
            technologies=escape_latex(proj.technologies),
            bullets=[escape_latex(b) for b in proj.bullets],
        )
        for proj in data.projects
    ]

    # Escape skills
    escaped_skills = Skills(
        languages=escape_latex(data.skills.languages) if data.skills.languages else None,
        frameworks=escape_latex(data.skills.frameworks) if data.skills.frameworks else None,
        tools=escape_latex(data.skills.tools) if data.skills.tools else None,
    )

    return ResumeData(
        contact=escaped_contact,
        education=escaped_education,
        experience=escaped_experience,
        projects=escaped_projects,
        skills=escaped_skills,
    )


def parse_resume_data(data: dict) -> ResumeData:
    
    # This is used to convert the AI's JSON response into the structured format.
    return ResumeData(
        contact=ContactInfo(**data.get('contact', {})),
        education=[Education(**e) for e in data.get('education', [])],
        experience=[Experience(**e) for e in data.get('experience', [])],
        projects=[Project(**p) for p in data.get('projects', [])],
        skills=Skills(**data.get('skills', {})),
    )
