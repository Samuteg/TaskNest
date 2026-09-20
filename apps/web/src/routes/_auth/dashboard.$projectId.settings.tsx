import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@TaskNest/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { InviteModal } from "@/components/members/invite-modal";
import { MemberList } from "@/components/members/member-list";
import { DeleteProjectDialog } from "@/components/settings/delete-project-dialog";
import { ProjectSettingsForm } from "@/components/settings/project-settings-form";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/dashboard/$projectId/settings")({
	component: ProjectSettingsPage,
});

function ProjectSettingsPage() {
	const { projectId } = Route.useParams();
	const { data: session } = authClient.useSession();
	const currentUserId = session?.user?.id ?? "";

	const project = useQuery(
		orpc.projects.get.queryOptions({ input: { projectId } })
	);
	const members = useQuery(
		orpc.members.list.queryOptions({ input: { projectId } })
	);

	const isOwner =
		members.data?.some(
			(m) => m.userId === currentUserId && m.role === "owner"
		) ?? false;

	const isAdmin =
		members.data?.some(
			(m) =>
				m.userId === currentUserId && (m.role === "owner" || m.role === "admin")
		) ?? false;

	if (project.isLoading || members.isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="animate-pulse text-muted-foreground text-sm">
					Loading settings...
				</p>
			</div>
		);
	}

	if (project.isError || !project.data) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-destructive text-sm">
					Project not found or access denied.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-8">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">
					{project.data.name} Settings
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Manage project configuration, team members, and permissions.
				</p>
			</div>

			<Tabs className="w-full" defaultValue="general">
				<TabsList className="grid w-full max-w-md grid-cols-3">
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="members">Members</TabsTrigger>
					{isOwner ? (
						<TabsTrigger value="danger">Danger Zone</TabsTrigger>
					) : null}
				</TabsList>

				<TabsContent className="mt-6" value="general">
					<ProjectSettingsForm disabled={!isAdmin} project={project.data} />
				</TabsContent>

				<TabsContent className="mt-6 space-y-4" value="members">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-medium text-lg">Team Members</h3>
							<p className="text-muted-foreground text-xs">
								Manage roles and invite new members to collaborate.
							</p>
						</div>
						{isAdmin ? <InviteModal projectId={projectId} /> : null}
					</div>

					<MemberList
						currentUserId={currentUserId}
						isOwner={isOwner}
						projectId={projectId}
					/>
				</TabsContent>

				{isOwner ? (
					<TabsContent className="mt-6" value="danger">
						<DeleteProjectDialog
							projectId={projectId}
							projectName={project.data.name}
						/>
					</TabsContent>
				) : null}
			</Tabs>
		</div>
	);
}
