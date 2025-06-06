from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database.db_models_creator import DatabaseModelsCreator
from models.domain_models import ProjectModel, RepositoryModel

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.engine = create_engine(f"sqlite:///{self.db_path}")
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self._create_tables()
    
    def _create_read_api_url(self, project_id: int, backend_base_url: str) -> str:
        """Construct the read API URL for a project."""
        return f"{backend_base_url}/api/comments/{project_id}"
    
    def _create_write_api_url(self, project_id: int, backend_base_url: str) -> str:
        """Construct the write API URL for a project."""
        return f"{backend_base_url}/api/comments/{project_id}/write"

    def _create_tables(self):
        DatabaseModelsCreator.create_all(self.engine)
    
    def create_project(self, request_data: dict) -> ProjectModel:
        session = self.SessionLocal()
        backend_base_url = request_data.get("backend_base_url")
        if not backend_base_url:
            raise ValueError("Backend base URL is required to create project URLs.")
        
        try:
            # Create the project first
            new_project = ProjectModel(
                version=request_data.get("version", "v1"),
                label=request_data.get("label", "Test Project"),
                read_api_url="",
                write_api_url="",
            )
            session.add(new_project)
            session.flush()  # Get the project ID
            
            new_project.read_api_url = self._create_read_api_url(
                int(new_project.identifier),
                backend_base_url
            )
            new_project.write_api_url = self._create_write_api_url(
                int(new_project.identifier),
                backend_base_url
            )
            
            # Create the one repository for this project
            new_repository = RepositoryModel(
                project_id=new_project.identifier,
                type=request_data.get("repo_type", "git"),
                repo_landing_page_url=str(request_data["git_repo_url"]),
                commit=request_data.get("commit", "main"),
                token=request_data.get("token")
            )
            session.add(new_repository)
            session.commit()
            
            # Refresh to get the complete object with relationships
            session.refresh(new_project)
            
            return new_project
            
        except Exception as e:
            session.rollback()
            raise e

    def close(self):
        """Close the database engine."""
        self.engine.dispose()