import HomePage from "../pages/SetupPage.vue";
import CodeReviewPage from "../pages/CodeReviewPage.vue";
import ProjectReviewPage from "../pages/ProjectReviewPage.vue";

const routes = [
	{
		path: "/",
		redirect: "/setup",
	},
	{
		path: "/setup",
		component: HomePage,
	},
	{
		path: "/code-review",
		component: CodeReviewPage,
	},
	{
		path: "/project-review",
		component: ProjectReviewPage,
	},
];

export default routes;
