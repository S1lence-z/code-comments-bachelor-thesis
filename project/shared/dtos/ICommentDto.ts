export default interface ICommentDto {
    filePath: string; // Path to the file where the comment is located
    lineNumber: number; // Line number in the file where the comment is placed
    content: string; // The actual content of the comment
    tags?: string[]; // Optional tags associated with the comment for categorization or filtering
}