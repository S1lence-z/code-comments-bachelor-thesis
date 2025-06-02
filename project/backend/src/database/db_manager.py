from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, joinedload
from database.db_models_creator import DatabaseModelsCreator
from models.domain_models import LocationModel, ProjectModel, CommentModel, RepositoryModel, LineLocationModel, LineRangeLocationModel
from models.dtos import CommentDto

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
        
        # Extract required data
        backend_base_url = project_data.get("backend_base_url")
        frontend_base_url = project_data.get("frontend_base_url")
        
        if not backend_base_url:
            raise ValueError("Backend base URL must be provided.")
        if not frontend_base_url:
            raise ValueError("Frontend base URL must be provided.")

        with self.SessionLocal() as session:
            # Create project with basic data
            new_project = ProjectModel(
                version=project_data.get("version", "v1"),
                label=project_data.get("project_label", "New Project"),
                read_api_url="",  # Will be set after getting the ID
                write_api_url=""  # Will be set after getting the ID
            )
            session.add(new_project)
            session.flush()  # Get the ID without committing
            
            # Update URLs with the actual project ID
            write_api_url = f"{backend_base_url}/api/comments/{new_project.identifier}"
            read_api_url = f"{frontend_base_url}?repoUrl={project_data.get('git_repo_url', '')}&commentsApiUrl={write_api_url}"
            
            # Update the object attributes directly
            setattr(new_project, 'write_api_url', write_api_url)
            setattr(new_project, 'read_api_url', read_api_url)

            session.commit()
            session.refresh(new_project)
            return new_project
    
    def get_comments_by_project_id(self, project_id: int) -> list[CommentModel]:
        with self.SessionLocal() as session:
            return session.query(CommentModel)\
                .options(joinedload(CommentModel.location))\
                .filter(CommentModel.project_id == project_id)\
                .all()

    def update_comments(self, project_id: int, comments_data: CommentDto) -> CommentModel:
        """Update comments for a specific project."""
        if not comments_data:
            raise ValueError("Comments data cannot be empty.")
        
        with self.SessionLocal() as session:
            # Create location inline
            if not comments_data.file_path or comments_data.line_number is None:
                raise ValueError("File path and line number must be provided.")
            
            location = LineLocationModel(file_path=comments_data.file_path, line_number=comments_data.line_number)
            session.add(location)
            session.flush()
            
            # Create repository inline
            repository_url = "placeholder_repo_url"
            if not repository_url:
                raise ValueError("Repository URL cannot be empty.")
            
            # Check if the repository already exists
            existing_repo = session.query(RepositoryModel).filter_by(repo_landing_page_url=repository_url).first()
            if existing_repo:
                repository_id = int(existing_repo.identifier)
            else:
                # Create a new repository entry
                new_repository = RepositoryModel(
                    project_id=project_id,
                    repo_landing_page_url=repository_url,
                    type="git",
                    commit="mrdko"
                )
                session.add(new_repository)
                session.flush()  # Get the ID without committing
                repository_id = int(new_repository.identifier)
            
            # Create comment
            new_comment = CommentModel(
                project_id=project_id,
                repository_id=repository_id,
                content=comments_data.text,
                location=location
            )
            session.add(new_comment)
            session.commit()
            session.refresh(new_comment)
            return new_comment

    def close(self):
        """Close the database engine."""
        self.engine.dispose()