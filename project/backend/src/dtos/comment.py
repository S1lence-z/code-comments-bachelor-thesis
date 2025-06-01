from typing import List, Optional
from pydantic import BaseModel, Field

class Comment(BaseModel):
    id: int = Field(default=..., examples=[1])
    filePath: str = Field(default=..., examples=["src/components/CodeEditor.vue"])
    lineNumber: int = Field(default=..., examples=[42])
    text: str = Field(default=..., examples=["This is a crucial piece of logic."])
    tags: Optional[List[str]] = Field(default=None, examples=[["refactor", "bug"]])