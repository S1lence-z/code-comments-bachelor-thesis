const useGithubBranchService = () => {
	const branchExistsInRepo = async (repositoryUrl: string, branchName: string): Promise<boolean> => {
		const [owner, repo] = new URL(repositoryUrl).pathname.split("/").filter(Boolean);
		const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branchName}`);
		return response.ok;
	};

	return {
		branchExistsInRepo,
	};
};

export default useGithubBranchService;
