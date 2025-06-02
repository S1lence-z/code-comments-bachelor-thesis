from models.domain_models import CommentModel, LineLocationModel, LineRangeLocationModel, LocationModel
from models.dtos import CommentDto

# TODO: take into account both location types (line and line range)
def comment_to_dto(comment: CommentModel) -> CommentDto:
    # LocationModel
    location_model = comment.location
    
    if isinstance(location_model, LineLocationModel):
        location_file_path = location_model.file_path
    elif isinstance(location_model, LineRangeLocationModel):
        location_file_path = location_model.file_path
    else:
        raise ValueError(f"Unsupported location type: {type(location_model)}")

    return CommentDto(
        file_path=str(location_file_path),
        line_number=int(location_model.line_number),
        text=str(comment.content)
    )

def comments_to_dtos(comments: list[CommentModel]) -> list[CommentDto]:
    return [comment_to_dto(comment) for comment in comments]
