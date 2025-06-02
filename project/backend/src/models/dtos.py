from pydantic import BaseModel, Field

class CommentDto(BaseModel):
    file_path: str = Field(alias="filePath")
    line_number: int = Field(alias="lineNumber")
    text: str = Field()

    class Config:
        validate_by_name = True
