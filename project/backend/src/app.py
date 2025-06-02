import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field, HttpUrl
from database.db_manager import DatabaseManager
from models.domain_models import CommentModel, ProjectModel
from models.dtos import CommentDto
from utils.mappers import comments_to_dtos

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

class SetupProjectResponse(BaseModel):
    message: str = Field(default="Project setup successfully", description="Response message")
    project_id: int = Field(..., description="Unique identifier for the project")
    read_api_url: str = Field(..., description="Read API URL for the project")
    write_api_url: Optional[str] = Field(None, description="Optional write API URL for the project")
    
@app.post("/api/setup", status_code=status.HTTP_201_CREATED, response_model=SetupProjectResponse)
async def setup_project(setup_body: SetupProjectBody) -> SetupProjectResponse | dict:
    request_data: dict = {
        "git_repo_url": str(setup_body.repoUrl), # Ensure HttpUrl is converted to string
        "frontend_base_url": FRONTEND_BASE_URL,
        "backend_base_url": BACKEND_BASE_URL
    }
    try:
        new_project: ProjectModel = db_manager.create_project(request_data)
        
        # return SetupProjectResponse(
        #     message="Project setup successfully",
        #     project_id=int(new_project.identifier),
        #     read_api_url=str(new_project.read_api_url),
        #     write_api_url=str(new_project.write_api_url)
        # )
        return {
            "message": "Configuration created",
            "id": int(new_project.identifier),
            "repoUrl": str(request_data["git_repo_url"]),
            "commentsApiUrl": str(new_project.write_api_url),
            "frontend_url": str(new_project.read_api_url)
        }
    except ValueError as ve: # Catch specific validation errors
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
class GetCommentsResponse(BaseModel):
    message: str = Field(default="Comments retrieved successfully", description="Response message")
    comments: list = Field(..., description="List of comments for the project")

@app.get("/api/comments/{project_id}")
async def get_comments(project_id: int) -> GetCommentsResponse | list[CommentDto]: # Adjusted response type hint
    try:
        comments: list[CommentModel] = db_manager.get_comments_by_project_id(project_id)
        comment_dtos: list[CommentDto] = comments_to_dtos(comments)
        if not comment_dtos:
            # Return GetCommentsResponse with empty list for consistency, or just empty list
            # return GetCommentsResponse(comments=[]) 
            return [] # Current behavior
        # For consistency, could also use GetCommentsResponse here:
        # return GetCommentsResponse(comments=comment_dtos)
        return comment_dtos # Current behavior
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve comments: {str(e)}"
        )

# -------------------------------------------------------------------
@app.put("/api/comments/{project_id}")
async def update_comments(project_id: int, comment_data: CommentDto) -> dict:
    try:
        # The update_comments method in db_manager now returns the updated/created comment.
        # This returned comment from db_manager.update_comments will have its location loaded
        # if accessed within the same scope or if eager loading is correctly applied.
        db_manager.update_comments(project_id, comment_data)
        
        # Re-fetch all comments for the response as per original logic.
        # The get_comments_by_project_id now eagerly loads locations.
        comments = db_manager.get_comments_by_project_id(project_id)
        comment_dtos = comments_to_dtos(comments) # This should now work
        return {
            "message": "Comments updated successfully",
            "config": comment_dtos # 'config' key might be a legacy name, consider 'comments'
        }
    except ValueError as ve: # Catch specific validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update comments: {str(e)}"
        )

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
    print(f"ReDoc docs available at: {BACKEND_BASE_URL}/redoc")
    print("-")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=BACKEND_API_PORT,
        reload=True,
        log_level="info",
    )