import os
import urllib.parse
from typing import List, Optional, Dict

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field
from models.config import Config
from models.comment import Comment
from dotenv import load_dotenv

FILE_PATH = os.path.dirname(os.path.abspath(__file__))
ENV_FILE_PATH = os.path.join(FILE_PATH, "../.env.local")
load_dotenv(dotenv_path=ENV_FILE_PATH)

# Initialize FastAPI app
app = FastAPI(
    title="Code Commenting PoC Backend",
    version="1.0.0",
    description="A FastAPI backend to manage code comments for repositories.",
)

# --- Environment Variables ---
BACKEND_API_PORT = int(os.getenv("BACKEND_API_PORT", "3500"))
BACKEND_HOSTNAME = os.getenv("BACKEND_HOSTNAME", "http://localhost")
BACKEND_BASE_URL = f"{BACKEND_HOSTNAME}:{BACKEND_API_PORT}"
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "fe_base_url_not_set") # Placeholder

# --- CORS Middleware ---
# Allows all origins for development, should be restricted in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_BASE_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory Data Store ---
# For PoC purposes. In a real application, use a persistent database.
db: Dict[str, Config] = {}
next_id: int = 1

# --- Request/Response Models for Specific Endpoints ---
class SetupRequest(BaseModel):
    repoUrl: HttpUrl = Field(..., example="https://github.com/user/project.git")

class SetupResponse(BaseModel):
    message: str = Field(default="Configuration created")
    id: str
    repoUrl: HttpUrl
    commentsApiUrl: HttpUrl
    frontend_url: str = Field(..., example=f"{FRONTEND_BASE_URL}?repoUrl=...&commentsApiUrl=...")

class AddCommentRequest(BaseModel):
    text: str
    filePath: str
    lineNumber: int
    tags: Optional[List[str]] = None

class AddCommentResponse(BaseModel):
    message: str = Field(default="Comment added")
    config: Config

# --- API Endpoints ---
@app.post(
    "/api/setup",
    response_model=SetupResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Configuration"],
    summary="Create a new repository configuration",
    description="Initializes a new configuration for a given repository URL, returning URLs for accessing comments and the frontend.",
)
async def setup_configuration(request: SetupRequest):
    global next_id
    repo_url = request.repoUrl

    current_id_str = str(next_id)
    next_id += 1

    comments_api_url_str = f"{BACKEND_BASE_URL}/api/comments/{current_id_str}"

    db[current_id_str] = Config(
        id=current_id_str,
        repoUrl=repo_url,
        commentsApiUrl=HttpUrl(comments_api_url_str), # Pydantic will validate this
        comments=[],
    )

    frontend_redirect_url = (
        f"{FRONTEND_BASE_URL}?repoUrl={urllib.parse.quote(str(repo_url))}"
        f"&commentsApiUrl={urllib.parse.quote(comments_api_url_str)}"
    )

    return SetupResponse(
        id=current_id_str,
        repoUrl=repo_url,
        commentsApiUrl=HttpUrl(comments_api_url_str),
        frontend_url=frontend_redirect_url,
    )

@app.get(
    "/api/configs",
    response_model=List[Config],
    tags=["Configuration"],
    summary="List all repository configurations",
    description="Retrieves a list of all currently stored repository configurations along with their comments.",
)
async def get_all_configurations():
    return list(db.values())

@app.get(
    "/api/comments/{config_id}",
    response_model=List[Comment],
    tags=["Comments"],
    summary="Get comments for a specific configuration",
    description="Retrieves all comments associated with a given configuration ID. Comments are sorted by file path and then by line number.",
)
async def get_comments_for_configuration(config_id: str):
    if config_id not in db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID '{config_id}' not found.",
        )
    # Comments are already sorted upon addition
    return db[config_id].comments

@app.put(
    "/api/comments/{config_id}",
    response_model=AddCommentResponse,
    tags=["Comments"],
    summary="Add a comment to a configuration",
    description="Adds a new comment to the specified repository configuration. The comment list is kept sorted by file path and line number.",
)
async def add_comment_to_configuration(config_id: str, comment_data: AddCommentRequest):
    if config_id not in db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID '{config_id}' not found.",
        )

    new_comment = Comment(
        text=comment_data.text,
        filePath=comment_data.filePath,
        lineNumber=comment_data.lineNumber,
        tags=comment_data.tags,
    )

    db[config_id].comments.append(new_comment)
    # Sort comments by file path, then by line number
    db[config_id].comments.sort(key=lambda c: (c.filePath, c.lineNumber))

    return AddCommentResponse(config=db[config_id])

@app.get(
    "/",
    tags=["General"],
    summary="Root path / Health check",
    description="Provides a basic message indicating the service is running.",
)
async def root():
    return {"message": "Backend for Code Commenting PoC is running with FastAPI!"}

# --- Main Block for Uvicorn ---
if __name__ == "__main__":
    import uvicorn

    print("--- FastAPI Backend for Code Commenting PoC ---")
    print(f"Attempting to run on: {BACKEND_HOSTNAME}:{BACKEND_API_PORT}")
    print(f"Frontend Base URL expected: {FRONTEND_BASE_URL}")
    print("API Endpoints:")
    print(f"POST {BACKEND_BASE_URL}/api/setup")
    print(f"GET  {BACKEND_BASE_URL}/api/configs")
    print(f"GET  {BACKEND_BASE_URL}/api/comments/{{config_id}}")
    print(f"PUT  {BACKEND_BASE_URL}/api/comments/{{config_id}}")
    print(f"Swagger UI docs available at: {BACKEND_BASE_URL}/docs")
    print(f"ReDoc docs available at: {BACKEND_BASE_URL}/redoc")
    print("-------------------------------------------------")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=BACKEND_API_PORT,
        reload=True,
        log_level="info",
    )