const useGithubBranchService = () => {
	// TODO: handle more response like rate limit exceeded
	const branchExistsInRepo = async (
		repositoryUrl: string,
		branchName: string
	): Promise<boolean> => {
		const [owner, repo] = new URL(repositoryUrl).pathname.split("/").filter(Boolean);
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/branches/${branchName}`
		);

		if (response.redirected) {
			console.warn("Request was redirected to:", response.url);
			return false;
		}

		return response.ok;
	};

	return {
		branchExistsInRepo,
	};
};

export default useGithubBranchService;
