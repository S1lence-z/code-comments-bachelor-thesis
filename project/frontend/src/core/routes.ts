import HomePage from "../pages/SetupPage.vue";
import ReviewPage from "../pages/ReviewPage.vue";
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
		path: "/review",
		component: ReviewPage,
	},
	{
		path: "/project-review",
		component: ProjectReviewPage,
	},
];

export default routes;
