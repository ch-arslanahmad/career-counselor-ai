FORM_OPTIONS = {
    "skills": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "SQL",
        "HTML/CSS", "React", "Node.js", "FastAPI", "Django", "Git",
        "Docker", "AWS", "Linux", "Machine Learning", "Data Analysis",
        "Communication", "Problem Solving", "Leadership", "Project Management",
        "UI/UX Design", "Figma", "Adobe Photoshop", "SEO", "Digital Marketing",
        "Content Writing", "Public Speaking", "Critical Thinking", "Teamwork",
    ],
    "interests": [
        "Technology", "Design", "Business", "Healthcare",
        "Education", "Engineering", "Science", "Arts",
        "Finance", "Marketing", "Sports", "Music",
        "Writing", "Social Work", "Entrepreneurship",
    ],
    "industries": [
        "Information Technology", "Healthcare", "Education",
        "Finance", "Marketing", "Design",
        "Manufacturing", "Consulting", "E-commerce", "Government",
    ],
    "locations": [
        "Islamabad", "Lahore", "Karachi", "Rawalpindi",
        "Peshawar", "Quetta", "Faisalabad", "Multan",
        "Remote", "Abroad",
    ],
}


def get_form_options() -> dict[str, list[str]]:
    return FORM_OPTIONS
