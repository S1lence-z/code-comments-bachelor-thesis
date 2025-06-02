from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.db_models_creator import DatabaseModelsCreator
from models.domain_models import ProjectModel
import urllib.parse

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.engine = create_engine(f"sqlite:///{self.db_path}")
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self._create_tables()

    def _create_tables(self):
        DatabaseModelsCreator.create_all(self.engine)
    
    def create_project(self, project_data: dict) -> ProjectModel:
        """Create a new project in the database."""
        if not project_data:
            raise ValueError("Project data cannot be empty.")
        
        # Prepare the project model data
        new_version = project_data.get("version", "v1")
        new_label = project_data.get("project_label", "New Project")
        
        # Write API URL
        backend_base_url = project_data.get("backend_base_url", None)
        if backend_base_url is None:
            raise ValueError("Write API URL must be provided.")
        else:
            new_write_api_url = f"{backend_base_url}/api/comments/{1}"
            
        # Read API URL
        frontend_base_url = project_data.get("frontend_base_url", None)
        if frontend_base_url is None:
            raise ValueError("Frontend Base URL must be provided.")
        else:
            new_read_api_url = f"{frontend_base_url}?repoUrl={urllib.parse.quote(project_data.get('git_repo_url', ''), safe='')}&commentsApiUrl={urllib.parse.quote(new_write_api_url, safe='')}"
            
        
        with self.SessionLocal() as session:
            new_project = ProjectModel(
                version=new_version,
                label=new_label,
                read_api_url=new_read_api_url,
                write_api_url=new_write_api_url
            )
            session.add(new_project)
            session.commit()
            session.refresh(new_project)
            return new_project
        
    def close(self):
        """Close the database engine."""
        self.engine.dispose()