import HomePage from "../pages/SetupPage.vue";
import ReviewPage from "../pages/ReviewPage.vue";
import ProjectOverviewPage from "../pages/ProjectOverviewPage.vue";

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
		path: "/review",
		component: ReviewPage,
	},
	{
		path: "/project-overview",
		component: ProjectOverviewPage,
	},
];

export default routes;
