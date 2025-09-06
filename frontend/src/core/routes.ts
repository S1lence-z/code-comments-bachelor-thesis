import HomePage from "../pages/SetupPage.vue";
import CodeReviewPage from "../pages/CodeReviewPage.vue";
import OverviewPage from "../pages/OverviewPage.vue";
import NotFoundPage from "../pages/NotFoundPage.vue";

const routes = [
	{ path: "/", redirect: "/setup" },
	{ path: "/setup", name: "Home", component: HomePage },
	{ path: "/review/code", name: "Code Review", component: CodeReviewPage },
	{ path: "/overview", name: "Overview", component: OverviewPage },
	{ path: "/:pathMatch(.*)*", component: NotFoundPage },
];

export const navigationRoutes = routes.filter((route) => route.name);
export default routes;
