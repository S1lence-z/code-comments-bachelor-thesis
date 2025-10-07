const useGithubBranchService = () => {
	const branchExistsInRepo = async (repositoryUrl: string, branchName: string): Promise<boolean> => {
		const ownerAndUserNames = new URL(repositoryUrl).pathname;
		const response = await fetch(`https://api.github.com/repos${ownerAndUserNames}branches/${branchName}`);
		return response.ok;
	};

	return {
		branchExistsInRepo,
	};
};

export default useGithubBranchService;
