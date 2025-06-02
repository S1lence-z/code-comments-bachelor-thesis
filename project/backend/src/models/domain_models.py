from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
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
    identifier = Column(Integer, primary_key=True)
    location_type = Column(String, nullable=False)
    file_path = Column(String, nullable=True)

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
    # Using UUID for 'identifier' as per Public.Comment.identifier
    identifier = Column(Integer, primary_key=True, index=True)
    # Link to the owning Project (for convenience/querying)
    project_id = Column(Integer, ForeignKey("projects.identifier", ondelete="CASCADE"), nullable=False)
    # Link to the owning Repository (as per Public.Comment.repository)
    repository_id = Column(Integer, ForeignKey("repositories.identifier", ondelete="CASCADE"), nullable=False)
    # Link to the specific location of the comment
    location_id = Column(Integer, ForeignKey("locations.identifier", ondelete="CASCADE"), nullable=False, unique=True) # Often 1:1, or consider if multiple comments can share a location (usually not)
    content = Column(Text, nullable=False)

    # Relationships
    project = relationship("ProjectModel", back_populates="comments")
    repository = relationship("RepositoryModel", back_populates="comments")
    # One-to-one relationship with Location (cascade deletes if comment is deleted)
    location = relationship("LocationModel", backref=backref("comment_owner", uselist=False), cascade="all, delete-orphan", single_parent=True)

    # Many-to-many relationship with Categories via join table
    comment_categories = relationship("CommentCategoryModel", back_populates="comment", cascade="all, delete-orphan")
    categories = relationship("CategoryModel", secondary="comment_categories", back_populates="comments")

    # Link to Activity (e.g., who last modified it, when)
    activity_id = Column(Integer, ForeignKey("activities.identifier"), nullable=True)
    activity = relationship("ActivityModel", back_populates="comment") # Assuming 1:1, one activity per comment

class CategoryModel(Base): # Predefined categories that users can assign to comments
    __tablename__ = "categories"
    identifier = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Many-to-many relationship with Comments
    comments = relationship("CommentModel", secondary="comment_categories", back_populates="categories")

class CommentCategoryModel(Base): # Join table for many-to-many relationship between Comments and Categories
    __tablename__ = "comment_categories"
    comment_id = Column(Integer, ForeignKey("comments.identifier", ondelete="CASCADE"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.identifier", ondelete="CASCADE"), primary_key=True)

    # Relationships for back-navigation
    comment = relationship("CommentModel", back_populates="comment_categories")
    category = relationship("CategoryModel")

class ActivityModel(Base): # For internal tracking, similar to your diagram's Activity
    __tablename__ = "activities"
    identifier = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False) # Or a FK to a User table
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

    # If each comment has one activity instance, this is 1:1
    comment = relationship("CommentModel", back_populates="activity", uselist=False) 