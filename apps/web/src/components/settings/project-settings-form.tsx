import { Button } from "@TaskNest/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@TaskNest/ui/components/card";
import { Input } from "@TaskNest/ui/components/input";
import { Label } from "@TaskNest/ui/components/label";
import { Textarea } from "@TaskNest/ui/components/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function ProjectSettingsForm({
	project,
	disabled,
}: {
	project: { id: string; name: string; description: string | null };
	disabled?: boolean;
}) {
	const [name, setName] = useState(project.name);
	const [description, setDescription] = useState(project.description ?? "");

	const queryClient = useQueryClient();

	const updateProject = useMutation(
		orpc.projects.update.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.projects.get.queryKey({
						input: { projectId: project.id },
					}),
				});
				queryClient.invalidateQueries({
					queryKey: orpc.projects.list.queryKey(),
				});
				toast.success("Project updated successfully");
			},
		})
	);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await updateProject.mutateAsync({
			description: description.trim() || undefined,
			name: name.trim() || undefined,
			projectId: project.id,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>General Settings</CardTitle>
				<CardDescription>
					Update your project name and description.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-1">
						<Label htmlFor="proj-name">Project Name</Label>
						<Input
							disabled={disabled}
							id="proj-name"
							onChange={(e) => setName(e.target.value)}
							required
							value={name}
						/>
					</div>

					<div className="space-y-1">
						<Label htmlFor="proj-desc">Description</Label>
						<Textarea
							disabled={disabled}
							id="proj-desc"
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							value={description}
						/>
					</div>

					{disabled ? null : (
						<Button disabled={updateProject.isPending} type="submit">
							{updateProject.isPending ? "Saving..." : "Save Changes"}
						</Button>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
