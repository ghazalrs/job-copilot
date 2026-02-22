# Default LaTeX Resume Template with Jinja2 placeholders
DEFAULT_RESUME_TEMPLATE = r"""
\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[dvipsnames]{xcolor}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}

\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-0.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{\vspace{-4pt}\scshape\raggedright\large}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

%-------------------------
% Custom commands

\newcommand{\resumeItem}[1]{\item \small{#1}\vspace{-2pt}}

\newcommand{\resumeSubheading}[4]{\vspace{-2pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{#1} & #2 \\
    \textit{\small #3} & \textit{\small #4} \\
  \end{tabular*}\vspace{-7pt}}

\newcommand{\resumeProjectHeading}[2]{\item
  \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
    \small #1 & #2 \\
  \end{tabular*}\vspace{-7pt}}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in,label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
\begin{document}

\begin{center}
    \textbf{\Huge \scshape << contact.name >>} \\ \vspace{1pt}
    \small<% if contact.phone %><< contact.phone >><% endif %><% if contact.email %> $|$ \href{mailto:<< contact.email >>}{\underline{<< contact.email >>}}<% endif %><% if contact.linkedin %> $|$ \href{https://<< contact.linkedin >>}{\underline{<< contact.linkedin >>}}<% endif %><% if contact.github %> $|$ \href{https://<< contact.github >>}{\underline{<< contact.github >>}}<% endif %>
\end{center}

%-----------EDUCATION-----------
\section{Education}
\resumeSubHeadingListStart
<% for edu in education %>
    \resumeSubheading
      {<< edu.school >>}{<< edu.location >>}
      {<< edu.degree >>}{<< edu.dates >>}
<% endfor %>
\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\section{Experience}
\resumeSubHeadingListStart
<% for exp in experience %>
\resumeSubheading
  {<< exp.company >>}{<< exp.location >>}
  {<< exp.title >>}{<< exp.dates >>}
  \resumeItemListStart
<% for bullet in exp.bullets %>
    \resumeItem{<< bullet >>}
<% endfor %>
  \resumeItemListEnd
<% endfor %>
\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\section{Projects}
\resumeSubHeadingListStart
<% for proj in projects %>
\resumeProjectHeading
  {\textbf{<< proj.name >>} $|$ \emph{<< proj.technologies >>}}{}
  \resumeItemListStart
<% for bullet in proj.bullets %>
    \resumeItem{<< bullet >>}
<% endfor %>
  \resumeItemListEnd
<% endfor %>
\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in,label={}]
\small{
\item{
<% if skills.languages %>\textbf{Languages:} << skills.languages >> \\<% endif %>
<% if skills.frameworks %>\textbf{Frameworks:} << skills.frameworks >> \\<% endif %>
<% if skills.tools %>\textbf{Developer Tools:} << skills.tools >><% endif %>
}}
\end{itemize}

\end{document}
"""
