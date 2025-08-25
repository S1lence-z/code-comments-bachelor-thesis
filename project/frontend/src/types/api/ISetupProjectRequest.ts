// TODO: make the name mandatory

export default interface ISetupProjectRequest {
	repositoryUrl: string; // URL of the repository to set up
	name?: string; // Name of the project
	branch: string; // Optional branch to check out
	commitHash?: string; // Optional commit hash to check out
	repositoryType?: string; // Optional type of the repository (e.g., Git, SVN)
	token?: string; // Optional authentication token for private repositories
}
