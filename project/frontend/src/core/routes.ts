import HomePage from "../pages/SetupPage.vue";
import ReviewPage from "../pages/ReviewPage.vue";

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
];

export default routes;
