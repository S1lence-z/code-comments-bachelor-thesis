from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.ext.declarative import declared_attr

Base = declarative_base()

class ProjectModel(Base):
    """ Represents a repository with comments.

    Args:
        Base (_type_): SQLAlchemy Base class for declarative models.
    """
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    repository_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    version = Column(String, nullable=False, default="v1")
    label = Column(String, nullable=False, default="Test Project")
    read_api_url = Column(String, nullable=False) # the url to the backend api to read comments
    write_api_url = Column(String, nullable=False) # the url to the backend api to upsert comments

class RepositoryModel(Base):
    """ Represents a repository with comments.

    Args:
        Base (_type_): SQLAlchemy Base class for declarative models.
    """
    __tablename__ = "repositories"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    git_landing_page_url = Column(String, nullable=False)  # the landing page url of the repository
    git_commit_sha = Column(String, nullable=False)  # the git commit sha of the repository
    token = Column(String, nullable=True)  # a token for potential future use, e.g., for private repositories
    
class CommentModel(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    category_ids = Column(String, nullable=True)  # JSON string of category IDs
    activity_id = Column(String, nullable=True)  # JSON string of activity IDs
    content = Column(String, nullable=False)  # The content of the comment

class CategoryModel(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)  # Name of the category
    description = Column(String, nullable=True)  # Description of the category
    comments_rel = relationship("CommentModel", back_populates="category_rel", cascade="all, delete-orphan", lazy="select", uselist=True) # Relationship to comments

class LocationModel(Base):
    """Abstract base class for different location types."""
    __abstract__ = True
    
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    filePath = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Type of location (e.g., "line", "range")

class LineLocationModel(LocationModel):
    __tablename__ = "line_locations"
    lineNumber = Column(Integer, nullable=False)

class LineRangeLocationModel(LocationModel):
    __tablename__ = "line_range_locations"
    startLineNumber = Column(Integer, nullable=False)
    endLineNumber = Column(Integer, nullable=False)
