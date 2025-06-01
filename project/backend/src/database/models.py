import json
from typing import List, Optional
from pydantic import HttpUrl
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship, declarative_base, Session
from sqlalchemy.ext.hybrid import hybrid_property
from dtos.config import Config
from dtos.comment import Comment

Base = declarative_base()

# --new code--
class ProjectModel(Base):
    """ Represents a repository with comments.

    Args:
        Base (_type_): SQLAlchemy Base class for declarative models.
    """
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True, autoincrement=True)
    version = Column(String, nullable=False, default="v1")
    label = Column(String, nullable=False, default="Test Project")
    readApiUrl = Column(String, nullable=False) # the url to the backend api to read comments
    writeApiUrl = Column(String, nullable=False) # the url to the backend api to upsert comments

class ConfigModel(Base):
    __tablename__ = "configs"
    id = Column(String, primary_key=True, index=True)
    repoUrl = Column(String, nullable=False)
    commentsApiUrl = Column(String, nullable=False)
    backend_base_url = Column(String, nullable=False)
    comments_rel = relationship("CommentModel", back_populates="config_rel", cascade="all, delete-orphan", lazy="select")

# --old code--
class ConfigurationModel(Base):
    __tablename__ = "configurations"
    id = Column(String, primary_key=True, index=True)
    repoUrl = Column(String, nullable=False)
    commentsApiUrl = Column(String, nullable=False)
    backend_base_url = Column(String, nullable=False)

    comments_rel = relationship("CommentModel", back_populates="config_rel", cascade="all, delete-orphan", lazy="select")

    def to_pydantic(self, db_session: Session) -> Config:
        # Fetch comments separately if not already loaded or if specific ordering is needed by get_comments_for_config_sqla
        # For simplicity here, we assume comments_rel can be used directly or fetched.
        # The original get_comments_for_config had specific ordering.
        comments_pydantic = [comment.to_pydantic() for comment in 
                             db_session.query(CommentModel).filter(CommentModel.config_id == self.id).order_by(CommentModel.filePath, CommentModel.lineNumber).all()]
        
        return Config(
            id=self.id,
            repoUrl=HttpUrl(self.repoUrl),
            commentsApiUrl=HttpUrl(self.commentsApiUrl),
            backend_base_url=self.backend_base_url,
            comments=comments_pydantic
        )

class CommentModel(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    config_id = Column(String, ForeignKey("configurations.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    filePath = Column(String, nullable=False)
    lineNumber = Column(Integer, nullable=False)
    _tags = Column("tags", Text)

    config_rel = relationship("ConfigurationModel", back_populates="comments_rel")

    @hybrid_property
    def tags(self):
        return json.loads(self._tags) if self._tags else None

    @tags.setter
    def tags(self, tags_list: Optional[List[str]]):
        self._tags = json.dumps(tags_list) if tags_list is not None else None

    def to_pydantic(self) -> Comment:
        return Comment(
            id=self.id,
            text=self.text,
            filePath=self.filePath,
            lineNumber=self.lineNumber,
            tags=self.tags
        )