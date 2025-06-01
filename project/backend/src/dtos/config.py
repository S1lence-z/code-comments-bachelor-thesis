from typing import List
from pydantic import BaseModel, Field, HttpUrl
from dtos.comment import Comment

class Config(BaseModel):
    id: str = Field(..., examples=["1"])
    repoUrl: HttpUrl = Field(..., examples=["https://github.com/example/repo.git"])
    commentsApiUrl: HttpUrl = Field(default=..., examples=["http://localhost:8000/api/comments/1"])
    comments: List[Comment] = []
    
    def __init__(self, backend_base_url: str, **data):
        if backend_base_url and 'id' in data and not data.get('commentsApiUrl'):
            data['commentsApiUrl'] = f"{backend_base_url}/api/comments/{data['id']}"
        super().__init__(**data)
        
    def __init_subclass__(cls, **kwargs):
        return super().__init_subclass__(**kwargs)