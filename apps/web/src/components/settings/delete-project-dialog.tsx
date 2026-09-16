import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@TaskNest/ui/components/alert-dialog";
import { Button } from "@TaskNest/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@TaskNest/ui/components/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function DeleteProjectDialog({
	projectId,
	projectName,
}: {
	projectId: string;
	projectName: string;
}) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const deleteProject = useMutation(
		orpc.projects.delete.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.projects.list.queryKey(),
				});
				toast.success("Project deleted successfully");
				navigate({ to: "/dashboard" });
			},
		})
	);

	const handleDelete = useCallback(() => {
		deleteProject.mutate({ projectId });
	}, [deleteProject, projectId]);

	return (
		<Card className="border-destructive/30 bg-destructive/5">
			<CardHeader>
				<CardTitle className="text-destructive text-lg">Danger Zone</CardTitle>
				<CardDescription>
					Permanently delete this project, along with all its tasks, member
					associations, and pending invitations.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AlertDialog>
					<AlertDialogTrigger
						render={
							<Button className="gap-2" variant="destructive">
								<Trash2 className="h-4 w-4" />
								<span>Delete Project</span>
							</Button>
						}
					/>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the
								project <strong>"{projectName}"</strong> and remove all
								associated data.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								disabled={deleteProject.isPending}
								onClick={handleDelete}
								variant="destructive"
							>
								{deleteProject.isPending ? "Deleting..." : "Delete Project"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardContent>
		</Card>
	);
}
