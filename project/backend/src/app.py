import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field, HttpUrl
from database.db_manager import DatabaseManager
from models.domain_models import ProjectModel
from models.dtos import CommentDto, ProjectDto, RepositoryDto
from utils.mappers import project_to_dto

# Async context manager for database connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        db_manager.close()

# Initialize FastAPI app
app: FastAPI = FastAPI(
    title="Code Commenting Project Backend",
    version="1.0.0",
    description="A FastAPI backend to manage code comments for repositories.",
    lifespan=lifespan,
)

# Get absolute paths
FILE_PATH = os.path.dirname(os.path.abspath(__file__))
ENV_FILE_PATH = os.path.join(FILE_PATH, "../.env.local")
DB_FILE_PATH: str = os.path.join(FILE_PATH, "../db/main.db")

# Load environment variables 
load_dotenv(dotenv_path=ENV_FILE_PATH)
BACKEND_API_PORT: int = int(os.getenv("BACKEND_API_PORT", "3500"))
BACKEND_HOSTNAME: str = os.getenv("BACKEND_HOSTNAME", "http://localhost")
BACKEND_BASE_URL: str = f"{BACKEND_HOSTNAME}:{BACKEND_API_PORT}"
FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", "fe_base_url_not_set")

# Setup the db manager
DB_DIR = os.path.dirname(DB_FILE_PATH)
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)
db_manager: DatabaseManager = DatabaseManager(db_path=DB_FILE_PATH)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
class SetupProjectBody(BaseModel):
    repoUrl: HttpUrl = Field(..., description="Git repository URL")
    repoType: Optional[str] = Field(default="git", description="Type of the repository")
    commit: Optional[str] = Field(default="", description="Commit SHA for the repository")
    token: Optional[str] = Field(default="", description="Access token for the repository")

@app.post("/api/setup", status_code=status.HTTP_201_CREATED, response_model=ProjectDto)
async def setup_project(setup_body: SetupProjectBody) -> ProjectDto:
    request_data: dict = {
        "git_repo_url": str(setup_body.repoUrl),
        "repo_type": setup_body.repoType,
        "commit": setup_body.commit,
        "token": setup_body.token,
        "frontend_base_url": FRONTEND_BASE_URL,
        "backend_base_url": BACKEND_BASE_URL
    }
    try:
        new_project: ProjectModel = db_manager.create_project(request_data)
        new_project_dto: ProjectDto = project_to_dto(new_project)
        return new_project_dto
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to setup project: {str(e)}"
        )

# -------------------------------------------------------------------
@app.put("/api/comments/{project_id}")
async def update_comments(project_id: int, comment_data: CommentDto) -> dict:
    pass

# -------------------------------------------------------------------
class GetCommentsResponse(BaseModel):
    message: str = Field(default="Comments retrieved successfully", description="Response message")
    repository: RepositoryDto = Field(..., description="Repository details for the project")
    comments: list[CommentDto] = Field(..., description="List of comments for the project")

@app.get("/api/project/{project_id}/comments", response_model=GetCommentsResponse)
async def get_comments(project_id: int) -> GetCommentsResponse:
    pass

if __name__ == "__main__":
    import uvicorn

    print("- FastAPI Backend for Code Commenting Project (SQLite) -")
    print(f"Attempting to run on: {BACKEND_HOSTNAME}:{BACKEND_API_PORT}")
    print(f"Frontend Base URL expected: {FRONTEND_BASE_URL}")
    print("API Endpoints:")
    print(f"POST {BACKEND_BASE_URL}/api/setup")
    print(f"GET  {BACKEND_BASE_URL}/api/comments/{{project_id}}")
    print(f"PUT  {BACKEND_BASE_URL}/api/comments/{{project_id}}")
    print(f"Swagger UI docs available at: {BACKEND_BASE_URL}/docs")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=BACKEND_API_PORT,
        reload=True,
        log_level="info",
    )