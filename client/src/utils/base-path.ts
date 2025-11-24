export const formatBasePath = (basePath: string) => {
	if (!basePath) return "";
	const withTrailingSlash = basePath.endsWith("/") ? basePath : basePath + "/";
	return withTrailingSlash.startsWith("/") ? withTrailingSlash : "/" + withTrailingSlash;
};
