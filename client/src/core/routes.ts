import CodeReviewPage from "../pages/CodeReviewPage.vue";
import OverviewPage from "../pages/OverviewPage.vue";
import NotFoundPage from "../pages/NotFoundPage.vue";
import { codeReviewPageKey, overviewPageKey } from "./keys";

const routes = [
	{ path: "/", redirect: "/review/code" },
	{ path: "/review/code", name: codeReviewPageKey, component: CodeReviewPage },
	{ path: "/overview", name: overviewPageKey, component: OverviewPage },
	{ path: "/:pathMatch(.*)*", component: NotFoundPage },
];

export const navigationRoutes = routes.filter((route) => route.name);
export default routes;
