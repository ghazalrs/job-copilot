# Default LaTeX Cover Letter Template with Jinja2 placeholders
DEFAULT_COVER_LETTER_TEMPLATE = r"""
\documentclass[11pt]{letter}
\usepackage[margin=1in]{geometry}
\usepackage{hyperref}
\usepackage{ragged2e}

\AtBeginDocument{\RaggedRight}
\setlength{\parindent}{0pt}

\signature{<< candidate.name >>}
\date{}
\begin{document}

\begin{letter}{<< recipient.name >> \\ << recipient.company >>}

% --- Manually place contact info (left aligned) ---
{\large \textbf{<< candidate.name >>}}\\[4pt]
<% if candidate.email %><< candidate.email >> \\[4pt]<% endif %>
<% if candidate.phone %><< candidate.phone >> \\[4pt]<% endif %>
<< date >>

\vspace{12pt}

\opening{Dear << recipient.name >>,}

<% for paragraph in body_paragraphs %>
<< paragraph >>

<% endfor %>
\vspace{12pt}

Sincerely, \\
<< candidate.name >>

\end{letter}

\end{document}
"""
