// Core types for the application

// Database entity interfaces
export interface Project {
	identifier: number;
	version: string;
	label: string;
	read_api_url: string;
	write_api_url: string | null;
}

export interface Repository {
	identifier: number;
	project_id: number;
	type: string;
	repo_landing_page_url: string;
	commit: string;
	token: string | null;
}

export interface Location {
	identifier: number;
	location_type: string;
	file_path: string | null;
}

export interface LineLocation extends Location {
	line_number: number;
}

export interface LineRangeLocation extends Location {
	start_line_number: number;
	end_line_number: number;
}

export interface Comment {
	identifier: number;
	project_id: number;
	repository_id: number;
	location_id: number;
	content: string;
	activity_id: number | null;
}

export interface Category {
	identifier: number;
	label: string;
	description: string | null;
}

export interface CommentCategory {
	comment_id: number;
	category_id: number;
}

export interface Activity {
	identifier: number;
	username: string;
	created_at: Date;
	updated_at: Date;
}

// Input/Output DTOs
export interface CommentDto {
	filePath: string;
	lineNumber: number;
	text: string;
	tags?: string[];
}

export interface RepositoryDto {
	identifier: number;
	type: string;
	repoLandingPageUrl: string;
}

export interface ProjectDto {
	identifier: number;
	version: string;
	label: string;
	readApiUrl: string;
	writeApiUrl: string | null;
	repository: RepositoryDto;
}

export interface SetupProjectBody {
	repoUrl: string;
	repoType?: string;
	commit?: string;
	token?: string;
}

export interface GetCommentsResponse {
	message: string;
	repository: RepositoryDto;
	comments: CommentDto[];
}

// Database row interfaces (matching actual DB structure)
export interface ProjectRow {
	identifier: number;
	version: string;
	label: string;
	read_api_url: string;
	write_api_url: string | null;
}

export interface RepositoryRow {
	identifier: number;
	project_id: number;
	type: string;
	repo_landing_page_url: string;
	commit: string;
	token: string | null;
}

export interface LocationRow {
	identifier: number;
	location_type: string;
	file_path: string | null;
}

export interface LineLocationRow extends LocationRow {
	line_number: number;
}

export interface CommentRow {
	identifier: number;
	project_id: number;
	repository_id: number;
	location_id: number;
	content: string;
	activity_id: number | null;
}

export interface CategoryRow {
	identifier: number;
	label: string;
	description: string | null;
}

export interface CommentCategoryRow {
	comment_id: number;
	category_id: number;
}

export interface ActivityRow {
	identifier: number;
	username: string;
	created_at: string; // SQLite returns dates as strings
	updated_at: string;
}
