from typing import List
from pydantic import BaseModel, Field, HttpUrl
from models.comment import Comment

class Config(BaseModel):
    id: str = Field(..., example="1")
    repoUrl: HttpUrl = Field(..., example="https://github.com/example/repo.git")
    commentsApiUrl: HttpUrl = Field(None)
    comments: List[Comment] = []
    
    def __init__(self, backend_base_url: str = None, **data):
        if backend_base_url and 'id' in data and not data.get('commentsApiUrl'):
            data['commentsApiUrl'] = f"{backend_base_url}/api/comments/{data['id']}"
        super().__init__(**data)
        
    def __init_subclass__(cls, **kwargs):
        return super().__init_subclass__(**kwargs)