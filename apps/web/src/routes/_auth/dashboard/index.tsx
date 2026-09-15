import { createFileRoute } from "@tanstack/react-router";

import { ProjectList } from "@/components/dashboard/project-list";

export const Route = createFileRoute("/_auth/dashboard/")({
	component: DashboardIndexPage,
});

function DashboardIndexPage() {
	return <ProjectList />;
}
