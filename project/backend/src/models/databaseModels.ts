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
	branch: string;
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

export interface FileLocation extends Location {
	// Currently, it inherits from Location
	// This interface can be extended with file-specific fields if needed
}

export interface ProjectLocation extends Location {
	// Currently, it inherits from Location
	// This interface can be extended with project-specific fields if needed
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
	branch: string;
	commit: string;
	token: string | null;
}

export interface LocationRow {
	identifier: number;
	location_type: string;
	file_path: string | null;
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
