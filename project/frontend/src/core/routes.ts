import HomePage from "../pages/SetupPage.vue";
import CodeReviewPage from "../pages/CodeReviewPage.vue";
import ProjectReviewPage from "../pages/ProjectReviewPage.vue";
import NotFoundPage from "../pages/NotFoundPage.vue";

const routes = [
	{
		path: "/",
		redirect: "/setup",
	},
	{
		path: "/setup",
		name: "Home",
		component: HomePage,
	},
	{
		path: "/code-review",
		name: "Code Review",
		component: CodeReviewPage,
	},
	{
		path: "/project-review",
		name: "Project Review",
		component: ProjectReviewPage,
	},
	{
		path: "/:pathMatch(.*)*",
		component: NotFoundPage,
	},
];

export const navigationRoutes = routes.filter((route) => route.name);
export default routes;
