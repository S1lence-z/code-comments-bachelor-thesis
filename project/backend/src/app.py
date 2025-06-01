import os
import urllib.parse
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field
from dtos.config import Config
from dtos.comment import Comment
from dotenv import load_dotenv
from project.backend.src.database.db_manager import DatabaseManager

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
DB_FILE_PATH: str = os.path.join(FILE_PATH, "./db/main.db")

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
    allow_origins=[FRONTEND_BASE_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models for Specific Endpoints
class SetupRequest(BaseModel):
    repoUrl: HttpUrl = Field(default=..., examples=["https://github.com/user/project.git"])

class SetupResponse(BaseModel):
    message: str = Field(default="Configuration created")
    id: str
    repoUrl: HttpUrl
    commentsApiUrl: HttpUrl
    frontend_url: list[str] = Field(default=..., examples=[f"{FRONTEND_BASE_URL}?repoUrl=...&commentsApiUrl=..."])

class AddCommentRequest(BaseModel):
    text: str
    filePath: str
    lineNumber: int
    tags: Optional[List[str]] = None

class AddCommentResponse(BaseModel):
    message: str = Field(default="Comment added")
    config: Config

# - API Endpoints -
@app.post(
    "/api/setup",
    response_model=SetupResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Configuration"],
    summary="Create a new repository configuration",
    description="Initializes a new configuration for a given repository URL, returning URLs for accessing comments and the frontend.",
)
async def setup_configuration(request: SetupRequest):
    repo_url = request.repoUrl
    max_retries = 5
    last_exception = None

    for attempt in range(max_retries):
        try:
            max_id_int = db_manager.get_max_config_id_int()
            current_id_int = (max_id_int + 1) if max_id_int is not None else 1
            current_id_str = str(current_id_int)

            comments_api_url_str = f"{BACKEND_BASE_URL}/api/comments/{current_id_str}"

            new_config = Config(
                id=current_id_str,
                repoUrl=repo_url,
                commentsApiUrl=HttpUrl(comments_api_url_str),
                comments=[], 
                backend_base_url=BACKEND_BASE_URL
            )
            
            db_manager.add_config(new_config) # This will raise IntegrityError if ID exists

            frontend_redirect_url = [
                f"{FRONTEND_BASE_URL}?repoUrl={urllib.parse.quote(str(repo_url))}",
                f"&commentsApiUrl={urllib.parse.quote(comments_api_url_str)}"
            ]

            return SetupResponse(
                id=current_id_str,
                repoUrl=repo_url,
                commentsApiUrl=HttpUrl(comments_api_url_str),
                frontend_url=frontend_redirect_url,
            )
        except Exception as e:
            last_exception = e
            detail_message = f"An unexpected error occurred: {str(e)}"
            break
            
    # If loop finished due to retries or other exceptions caught and broken
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=detail_message or "Failed to setup configuration after multiple retries.",
    )

@app.get(
    "/api/configs",
    response_model=List[Config],
    tags=["Configuration"],
    summary="List all repository configurations",
    description="Retrieves a list of all currently stored repository configurations along with their comments.",
)
async def get_all_configurations():
    return db_manager.get_all_configs()

@app.get(
    "/api/comments/{config_id}",
    response_model=List[Comment], 
    tags=["Comments"],
    summary="Get comments for a specific configuration",
    description="Retrieves all comments associated with a given configuration ID. Comments are sorted by file path and then by line number.",
)
async def get_comments_for_configuration(config_id: str):
    if not db_manager.config_exists(config_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID '{config_id}' not found.",
        )
    return db_manager.get_comments_for_config(config_id)

@app.put(
    "/api/comments/{config_id}",
    response_model=AddCommentResponse,
    tags=["Comments"],
    summary="Add a comment to a configuration",
    description="Adds a new comment to the specified repository configuration. The comment list is kept sorted by file path and line number.",
)
async def add_comment_to_configuration(config_id: str, comment_data: AddCommentRequest):
    if not db_manager.config_exists(config_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID '{config_id}' not found.",
        )

    new_comment_model = Comment(
        text=comment_data.text,
        filePath=comment_data.filePath,
        lineNumber=comment_data.lineNumber,
        tags=comment_data.tags,
    )

    db_manager.add_comment(config_id, new_comment_model)
    
    updated_config = db_manager.get_config(config_id)
    if not updated_config: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated configuration.")

    return AddCommentResponse(config=updated_config)

@app.get(
    "/",
    tags=["General"],
    summary="Root path / Health check",
    description="Provides a basic message indicating the service is running.",
)
async def root():
    return {"message": "Backend for Code Commenting Project is running with FastAPI using SQLite DB!"}

if __name__ == "__main__":
    import uvicorn

    print("- FastAPI Backend for Code Commenting Project (SQLite) -")
    print(f"Attempting to run on: {BACKEND_HOSTNAME}:{BACKEND_API_PORT}")
    print(f"Frontend Base URL expected: {FRONTEND_BASE_URL}")
    print("API Endpoints:")
    print(f"POST {BACKEND_BASE_URL}/api/setup")
    print(f"GET  {BACKEND_BASE_URL}/api/configs")
    print(f"GET  {BACKEND_BASE_URL}/api/comments/{{config_id}}")
    print(f"PUT  {BACKEND_BASE_URL}/api/comments/{{config_id}}")
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