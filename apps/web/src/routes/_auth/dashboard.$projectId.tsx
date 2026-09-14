import { createFileRoute } from "@tanstack/react-router";

import { TaskBoard } from "@/components/dashboard/task-board";

export const Route = createFileRoute("/_auth/dashboard/$projectId")({
	component: ProjectDetailPage,
});

function ProjectDetailPage() {
	const { projectId } = Route.useParams();

	return <TaskBoard projectId={projectId} />;
}
