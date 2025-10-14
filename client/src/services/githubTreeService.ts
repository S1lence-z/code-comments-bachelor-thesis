import { type GithubTreeItem, type TreeNode, TreeNodeType, GithubTreeItemType } from "../types/github/githubTree.ts";

const useGithubTreeService = () => {
	const buildFileTreeFromGitHub = (gitHubItems: GithubTreeItem[]): TreeNode[] => {
		const rootNodes: TreeNode[] = [];
		const map: { [path: string]: TreeNode } = {};

		const sortedItems = [...gitHubItems].sort((a, b) => a.path.localeCompare(b.path));

		sortedItems.forEach((item) => {
			if (item.type === GithubTreeItemType.commit) return;

			const parts = item.path.split("/");
			const itemName = parts[parts.length - 1];
			const parentPath = parts.slice(0, -1).join("/");

			const node: TreeNode = {
				name: itemName,
				path: item.path,
				type: item.type === GithubTreeItemType.blob ? TreeNodeType.file : TreeNodeType.folder,
				children: [],
				isExpanded: item.type === GithubTreeItemType.tree && parts.length === 1, // Expand top-level folders by default
			};
			map[item.path] = node;

			if (parentPath && map[parentPath]) {
				map[parentPath].children.push(node);
				map[parentPath].children.sort((a, b) => {
					if (a.type === TreeNodeType.folder && b.type === TreeNodeType.file) return -1;
					if (a.type === TreeNodeType.file && b.type === TreeNodeType.folder) return 1;
					return a.name.localeCompare(b.name);
				});
			} else {
				rootNodes.push(node);
			}
		});

		rootNodes.sort((a, b) => {
			if (a.type === TreeNodeType.folder && b.type === TreeNodeType.file) return -1;
			if (a.type === TreeNodeType.file && b.type === TreeNodeType.folder) return 1;
			return a.name.localeCompare(b.name);
		});
		return rootNodes;
	};

	const getRepositoryTree = async (
		repositoryUrl: string,
		branch: string,
		GITHUB_PAT?: string
	): Promise<TreeNode[]> => {
		const url = new URL(repositoryUrl);
		// Extract owner and repo name from URL
		const [owner, repo] = url.pathname.split("/").filter(Boolean);
		if (!owner || !repo) {
			throw new Error("Invalid repository URL for API construction.");
		}
		// Construct the API URL
		const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

		const headers: HeadersInit = {
			Accept: "application/vnd.github.v3+json",
		};
		if (GITHUB_PAT) {
			headers["Authorization"] = `Bearer ${GITHUB_PAT}`;
		}

		// Fetch the repository tree from GitHub API
		const response = await fetch(`${apiBase}/git/trees/${branch}?recursive=1`, {
			headers,
		});
		if (!response.ok) {
			throw new Error(`Failed to load repo tree: ${response.status} ${response.statusText}`);
		}
		const data = await response.json();
		if (!data.tree || !Array.isArray(data.tree)) {
			throw new Error("Invalid tree data received from GitHub API.");
		}
		return buildFileTreeFromGitHub(data.tree as GithubTreeItem[]);
	};

	return { getRepositoryTree };
};

export default useGithubTreeService;
