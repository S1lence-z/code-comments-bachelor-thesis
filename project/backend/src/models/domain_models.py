from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship, backref, DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

# TODO: use postgresql in the future (use UUID instead of Integer, jsonb for request headers)
# --- Project and Repository ---

class ProjectModel(Base):
    __tablename__ = "projects"
    identifier = Column(Integer, primary_key=True, index=True)
    version = Column(String, nullable=False, default="v1")
    label = Column(String, nullable=False, default="Test Project")

    # API access details
    read_api_url = Column(String, nullable=False)
    write_api_url = Column(String, nullable=True)

    # One Project can have many Repositories (aligns with ReadApiResponse.repositories)
    repositories = relationship("RepositoryModel", back_populates="project", cascade="all, delete-orphan")
    # One Project can have many Comments
    comments = relationship("CommentModel", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ProjectModel(identifier={self.identifier}, version={self.version}, label={self.label})>"

class RepositoryModel(Base):
    __tablename__ = "repositories"
    identifier = Column(Integer, primary_key=True, index=True)
    # Each Repository belongs to one Project
    project_id = Column(Integer, ForeignKey("projects.identifier", ondelete="CASCADE"), nullable=False)
    
    # Matches Public.Repository.type (e.g., "git")
    type = Column(String, nullable=False) 
    repo_landing_page_url = Column(String, nullable=False) # Renamed from git_landing_page_url for clarity
    commit = Column(String, nullable=False) # Renamed from git_commit_sha
    token = Column(Text, nullable=True) # Consider Text for potentially longer tokens, and encrypt at rest!

    # Relationships
    project = relationship("ProjectModel", back_populates="repositories")
    comments = relationship("CommentModel", back_populates="repository") # Comments linked to repository

# --- Locations ---
class LocationModel(Base):
    __tablename__ = "locations"
    identifier = Column(Integer, primary_key=True, autoincrement=True) # Added autoincrement
    location_type = Column(String, nullable=False)
    file_path = Column(String, nullable=True)

    # This is crucial for Joined Table Inheritance on the base class
    __mapper_args__ = {
        'polymorphic_identity': 'base_location',
        'polymorphic_on': location_type
    }

class LineLocationModel(LocationModel):
    __tablename__ = "line_locations"
    identifier = Column(Integer, ForeignKey('locations.identifier'), primary_key=True)
    line_number = Column(Integer, nullable=False)
    __mapper_args__ = {'polymorphic_identity': 'line'}

class LineRangeLocationModel(LocationModel):
    __tablename__ = "line_range_locations" 
    identifier = Column(Integer, ForeignKey('locations.identifier'), primary_key=True)
    start_line_number = Column(Integer, nullable=False)
    end_line_number = Column(Integer, nullable=False)
    __mapper_args__ = {'polymorphic_identity': 'lineRange'}

# --- Comments, Tags, and Activity ---

class CommentModel(Base):
    __tablename__ = "comments"
    identifier = Column(Integer, primary_key=True, index=True, autoincrement=True) # Added autoincrement
    project_id = Column(Integer, ForeignKey("projects.identifier", ondelete="CASCADE"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.identifier", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.identifier", ondelete="CASCADE"), nullable=False, unique=True)
    content = Column(Text, nullable=False)

    # Relationships
    project = relationship("ProjectModel", back_populates="comments")
    repository = relationship("RepositoryModel", back_populates="comments")
    location = relationship("LocationModel", backref=backref("comment_owner", uselist=False), cascade="all, delete-orphan", single_parent=True)

    # Many-to-many relationship with Categories via join table
    comment_categories = relationship("CommentCategoryModel", back_populates="comment", cascade="all, delete-orphan")
    categories = relationship("CategoryModel", secondary="comment_categories", back_populates="comments", overlaps="comment_categories")

    # Link to Activity (e.g., who last modified it, when)
    activity_id = Column(Integer, ForeignKey("activities.identifier"), nullable=True)
    activity = relationship("ActivityModel", back_populates="comment", uselist=False)

class CategoryModel(Base): # Predefined categories that users can assign to comments
    __tablename__ = "categories"
    identifier = Column(Integer, primary_key=True, index=True, autoincrement=True) # Added autoincrement
    label = Column(String, nullable=False, unique=True) # Added unique=True
    description = Column(Text, nullable=True)

    # Many-to-many relationship with Comments
    comments = relationship("CommentModel", secondary="comment_categories", back_populates="categories", overlaps="comment_categories")

class CommentCategoryModel(Base): # Join table for many-to-many relationship between Comments and Categories
    __tablename__ = "comment_categories"
    comment_id = Column(Integer, ForeignKey("comments.identifier", ondelete="CASCADE"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.identifier", ondelete="CASCADE"), primary_key=True)

    # Relationships for back-navigation
    comment = relationship("CommentModel", back_populates="comment_categories", overlaps="categories,comments")
    category = relationship("CategoryModel", overlaps="categories,comments")

class ActivityModel(Base): # For internal tracking, similar to your diagram's Activity
    __tablename__ = "activities"
    identifier = Column(Integer, primary_key=True, index=True, autoincrement=True) # Added autoincrement
    username = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # If each comment has one activity instance, this is 1:1
    comment = relationship("CommentModel", back_populates="activity", uselist=False)