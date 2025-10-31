export interface GithubFileContentResponse {
	type: string;
	size: number;
	name: string;
	path: string;
	sha: string;
	content: string | null;
	url: string;
	git_url: string | null;
	html_url: string | null;
	download_url: string | null;
	entries?: GithubFileEntry[];
	encoding?: string;
	_links: GithubFileLinks;
}

interface GithubFileLinks {
	git: string | null;
	html: string | null;
	self: string;
}

interface GithubFileEntry {
	type: string;
	size: number;
	name: string;
	path: string;
	sha: string;
	url: string;
	git_url: string | null;
	html_url: string | null;
	download_url: string | null;
	_links: GithubFileLinks;
}
