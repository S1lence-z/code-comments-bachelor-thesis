from models.domain_models import Base

class DatabaseModelsCreator:
    @staticmethod
    def create_all(engine):
        Base.metadata.create_all(engine)

    @staticmethod
    def drop_all(engine):
        Base.metadata.drop_all(engine)