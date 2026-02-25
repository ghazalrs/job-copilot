# Default LaTeX Cover Letter Template with Jinja2 placeholders
DEFAULT_COVER_LETTER_TEMPLATE = r"""
\documentclass[11pt]{letter}

\usepackage[margin=1in]{geometry}
\usepackage[hidelinks]{hyperref}
\usepackage[english]{babel}
\usepackage{parskip}

% Remove default letter indentation
\setlength{\parindent}{0pt}

\begin{document}

% Header with candidate info
\begin{center}
    \textbf{\Large << candidate.name >>} \\[4pt]
    \small
    <% if candidate.email %>\href{mailto:<< candidate.email >>}{<< candidate.email >>}<% endif %>
    <% if candidate.phone %> $\cdot$ << candidate.phone >><% endif %>
    <% if candidate.linkedin %> $\cdot$ \href{https://<< candidate.linkedin >>}{<< candidate.linkedin >>}<% endif %>
    <% if candidate.location %> \\[2pt] << candidate.location >><% endif %>
\end{center}

\vspace{12pt}

% Date
<< date >>

\vspace{12pt}

% Recipient
<% if recipient.name %><< recipient.name >> \\<% endif %>
<% if recipient.title %><< recipient.title >> \\<% endif %>
<< recipient.company >>
<% if recipient.address %>\\ << recipient.address >><% endif %>

\vspace{12pt}

% Salutation
Dear <% if recipient.name %><< recipient.name >><% else %>Hiring Manager<% endif %>,

\vspace{8pt}

% Body paragraphs
<% for paragraph in body_paragraphs %>
<< paragraph >>

<% endfor %>

\vspace{8pt}

% Closing
Sincerely,

\vspace{24pt}

<< candidate.name >>

\end{document}
"""

# A simpler, more modern cover letter template
DEFAULT_COVER_LETTER_TEMPLATE_MODERN = r"""
\documentclass[11pt,a4paper]{article}

\usepackage[margin=1in]{geometry}
\usepackage[hidelinks]{hyperref}
\usepackage{fontspec}
\usepackage{parskip}
\usepackage{xcolor}

% Define colors
\definecolor{headercolor}{RGB}{44, 62, 80}
\definecolor{accentcolor}{RGB}{52, 152, 219}

\setlength{\parindent}{0pt}
\pagestyle{empty}

\begin{document}

% Header
{\color{headercolor}
\begin{flushleft}
    {\LARGE\bfseries << candidate.name >>}\\[6pt]
    {\small
    <% if candidate.email %>\href{mailto:<< candidate.email >>}{<< candidate.email >>}<% endif %>
    <% if candidate.phone %> | << candidate.phone >><% endif %>
    <% if candidate.linkedin %> | \href{https://<< candidate.linkedin >>}{LinkedIn}<% endif %>
    <% if candidate.github %> | \href{https://<< candidate.github >>}{GitHub}<% endif %>
    }
\end{flushleft}
}

\vspace{16pt}

{\small << date >>}

\vspace{16pt}

<% if recipient.name %><< recipient.name >>\\<% endif %>
<% if recipient.title %><< recipient.title >>\\<% endif %>
{\bfseries << recipient.company >>}
<% if recipient.address %>\\<< recipient.address >><% endif %>

\vspace{16pt}

\textbf{Re: << job_title >>}

\vspace{12pt}

Dear <% if recipient.name %><< recipient.name >><% else %>Hiring Manager<% endif %>,

\vspace{10pt}

<% for paragraph in body_paragraphs %>
<< paragraph >>

<% endfor %>

\vspace{10pt}

Sincerely,

\vspace{28pt}

<< candidate.name >>

\end{document}
"""
