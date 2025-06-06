from pydantic import BaseModel, Field

class CommentDto(BaseModel):
    file_path: str = Field(alias="filePath")
    line_number: int = Field(alias="lineNumber")
    text: str = Field()

    class Config:
        validate_by_name = True

class RepositoryDto(BaseModel):
    identifier: int = Field(..., alias="identifier")
    type: str = Field(..., alias="type")
    repo_landing_page_url: str = Field(..., alias="repoLandingPageUrl")

class ProjectDto(BaseModel):
    identifier: int = Field(..., alias="identifier")
    version: str = Field(..., description="Version of the project")
    label: str = Field(..., description="Label for the project")
    read_api_url: str = Field(..., alias="readApiUrl")
    write_api_url: str = Field(None, alias="writeApiUrl", description="Optional write API URL for the project")
    repository: RepositoryDto = Field(..., description="Repository details associated with the project")