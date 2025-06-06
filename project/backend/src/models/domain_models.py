from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship, backref, DeclarativeBase
from sqlalchemy.orm import Mapped

class Base(DeclarativeBase):
    pass

# --- Project and Repository ---
class ProjectModel(Base):
    __tablename__ = "projects"
    identifier = Column(Integer, primary_key=True, index=True)
    version = Column(String, nullable=False, default="v1")
    label = Column(String, nullable=False, default="Test Project")

    # API access details
    read_api_url = Column(String, nullable=False)
    write_api_url = Column(String, nullable=True)

    # One-to-one relationship with Repository
    repository: Mapped['RepositoryModel'] = relationship(
        "RepositoryModel", 
        back_populates="project", 
        uselist=False,  # This makes it one-to-one
        cascade="all, delete-orphan"
    )
    
    # One Project can have many Comments
    comments: Mapped[list['CommentModel']] = relationship(
        "CommentModel", 
        back_populates="project", 
        cascade="all, delete-orphan"
    )

class RepositoryModel(Base):
    __tablename__ = "repositories"
    identifier = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Each Repository belongs to exactly one Project (one-to-one)
    project_id = Column(Integer, ForeignKey("projects.identifier", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Repository details
    type = Column(String, nullable=False) 
    repo_landing_page_url = Column(String, nullable=False)
    commit = Column(String, nullable=False)
    token = Column(Text, nullable=True)

    # One-to-one relationship back to Project
    project: Mapped['ProjectModel'] = relationship("ProjectModel", back_populates="repository")
    
    # One Repository can have many Comments
    comments: Mapped[list['CommentModel']] = relationship("CommentModel", back_populates="repository")

# --- Locations ---
class LocationModel(Base):
    __tablename__ = "locations"
    identifier = Column(Integer, primary_key=True, autoincrement=True)
    location_type = Column(String, nullable=False)
    file_path = Column(String, nullable=True)

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
    identifier = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.identifier", ondelete="CASCADE"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.identifier", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.identifier", ondelete="CASCADE"), nullable=False, unique=True)
    content = Column(Text, nullable=False)

    # Relationships
    project: Mapped['ProjectModel'] = relationship("ProjectModel", back_populates="comments")
    repository: Mapped['RepositoryModel'] = relationship("RepositoryModel", back_populates="comments")
    location = relationship("LocationModel", backref=backref("comment_owner", uselist=False), cascade="all, delete-orphan", single_parent=True)

    # Many-to-many relationship with Categories via join table
    comment_categories = relationship("CommentCategoryModel", back_populates="comment", cascade="all, delete-orphan")
    categories = relationship("CategoryModel", secondary="comment_categories", back_populates="comments", overlaps="comment_categories")

    # Link to Activity
    activity_id = Column(Integer, ForeignKey("activities.identifier"), nullable=True)
    activity = relationship("ActivityModel", back_populates="comment", uselist=False)

class CategoryModel(Base):
    __tablename__ = "categories"
    identifier = Column(Integer, primary_key=True, index=True, autoincrement=True)
    label = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    comments = relationship("CommentModel", secondary="comment_categories", back_populates="categories", overlaps="comment_categories")

class CommentCategoryModel(Base):
    __tablename__ = "comment_categories"
    comment_id = Column(Integer, ForeignKey("comments.identifier", ondelete="CASCADE"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.identifier", ondelete="CASCADE"), primary_key=True)

    comment = relationship("CommentModel", back_populates="comment_categories", overlaps="categories,comments")
    category = relationship("CategoryModel", overlaps="categories,comments")

class ActivityModel(Base):
    __tablename__ = "activities"
    identifier = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    comment = relationship("CommentModel", back_populates="activity", uselist=False)