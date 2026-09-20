import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/$projectId")({
	component: ProjectLayout,
});

function ProjectLayout() {
	return <Outlet />;
}
