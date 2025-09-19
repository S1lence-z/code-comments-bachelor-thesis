export const isValidUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch (e) {
		console.error("Invalid URL:", e);
		return false;
	}
};

export const isValidGithubUrl = (url: string): boolean => {
	const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+(\/)?$/;
	return githubUrlPattern.test(url);
};
