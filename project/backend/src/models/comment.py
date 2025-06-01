from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field

class Comment(BaseModel):
    filePath: str = Field(..., example="src/components/CodeEditor.vue")
    lineNumber: int = Field(..., example=42)
    text: str = Field(..., example="This is a crucial piece of logic.")
    tags: Optional[List[str]] = Field(None, example=["refactor", "bug"])