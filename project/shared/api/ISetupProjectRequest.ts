export default interface ISetupProjectRequest {
	repoUrl: string; // URL of the repository to set up
	branch: string; // Optional branch to check out
	repoType?: string; // Optional type of the repository (e.g., Git, SVN)
	commit?: string; // Optional commit hash to check out
	token?: string; // Optional authentication token for private repositories
}
