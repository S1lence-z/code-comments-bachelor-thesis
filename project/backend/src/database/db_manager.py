from typing import List, Optional
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, joinedload, Session
from database.db_models_creator import DatabaseModelsCreator

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.engine = create_engine(f"sqlite:///{self.db_path}")
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self._create_tables()

    def _create_tables(self):
        DatabaseModelsCreator.create_all(self.engine)

    def get_max_config_id_int(self) -> Optional[int]:
        session = self.SessionLocal()
        try:
            # Ensure id is treated as a string before casting for GLOB comparison if necessary,
            # or directly cast to INTEGER for MAX if ids are purely numeric.
            # The original query `WHERE id GLOB '[0-9]*'` filters for numeric-like strings.
            result = session.query(func.max(cast(ConfigurationModel.id, Integer)))\
                .filter(ConfigurationModel.id.op('GLOB')('[0-9]*'))\
                .scalar()
            return int(result) if result is not None else None
        except Exception: # Broad exception for safety, consider specific SQLAlchemy errors
            return None
        finally:
            session.close()

    def config_exists(self, config_id: str) -> bool:
        session = self.SessionLocal()
        try:
            return session.query(ConfigurationModel).filter(ConfigurationModel.id == config_id).first() is not None
        finally:
            session.close()

    def add_config(self, config: Config) -> None:
        session = self.SessionLocal()
        try:
            db_config = ConfigurationModel(
                id=config.id,
                repoUrl=str(config.repoUrl),
                commentsApiUrl=str(config.commentsApiUrl),
                # Replicating original behavior: backend_base_url is set from commentsApiUrl
                backend_base_url=str(config.commentsApiUrl) 
            )
            session.add(db_config)
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def _get_comments_for_config_sqla(self, config_id: str, session: Session) -> List[Comment]:
        db_comments = session.query(CommentModel)\
            .filter(CommentModel.config_id == config_id)\
            .order_by(CommentModel.filePath, CommentModel.lineNumber)\
            .all()
        return [comment.to_pydantic() for comment in db_comments]

    def get_config(self, config_id: str) -> Optional[Config]:
        session = self.SessionLocal()
        try:
            # Use joinedload to efficiently load comments along with the configuration
            db_config = session.query(ConfigurationModel)\
                .filter(ConfigurationModel.id == config_id)\
                .options(joinedload(ConfigurationModel.comments_rel))\
                .first()
            if db_config:
                # The to_pydantic method needs the session to correctly fetch/order comments
                return db_config.to_pydantic(session)
            return None
        finally:
            session.close()

    def get_all_configs(self) -> List[Config]:
        session = self.SessionLocal()
        try:
            # Use joinedload for comments_rel to avoid N+1 queries
            db_configs = session.query(ConfigurationModel)\
                .options(joinedload(ConfigurationModel.comments_rel))\
                .all()
            # The to_pydantic method needs the session
            return [config.to_pydantic(session) for config in db_configs]
        finally:
            session.close()

    def add_comment(self, config_id: str, comment: Comment) -> Comment:
        session = self.SessionLocal()
        try:
            db_comment = CommentModel(
                config_id=config_id,
                text=comment.text,
                filePath=comment.filePath,
                lineNumber=comment.lineNumber
            )
            # The 'tags' setter handles JSON conversion
            db_comment.tags = comment.tags 
            
            session.add(db_comment)
            session.commit()
            session.refresh(db_comment) # To get the auto-generated ID and other defaults
            
            return db_comment.to_pydantic()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def close(self):
        if self.engine:
            self.engine.dispose()

    # get_comments_for_config is not directly used by get_config or get_all_configs anymore
    # as to_pydantic in ConfigurationModel handles comment loading.
    # If it's still needed as a public method, it can be implemented like this:
    def get_comments_for_config(self, config_id: str) -> List[Comment]:
        session = self.SessionLocal()
        try:
            return self._get_comments_for_config_sqla(config_id, session)
        finally:
            session.close()
