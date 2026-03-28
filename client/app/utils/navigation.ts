export const formatBasePath = (basePath: string) => {
	if (!basePath) return "";
	const withTrailingSlash = basePath.endsWith("/") ? basePath : basePath + "/";
	return withTrailingSlash.startsWith("/") ? withTrailingSlash : "/" + withTrailingSlash;
};

export const navigateToManager = () => {
	const runtimeConfig = useRuntimeConfig();
	const managerUrl = runtimeConfig.public.managerUrl || "";
	window.location.href = managerUrl;
};
