from fastapi import FastAPI
from .routers import student, papers, questions, schemes, subbmissions, answers

app = FastAPI(title="Hackathon Marking API")

app.include_router(student.router)
app.include_router(papers.router)
app.include_router(questions.router)
app.include_router(schemes.router)
app.include_router(subbmissions.router)
app.include_router(answers.router)

# Optional: on startup you could verify connectivity
# but DO NOT auto-create tables against an existing DB.
