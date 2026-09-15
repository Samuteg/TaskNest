import { Button } from "@TaskNest/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@TaskNest/ui/components/dialog";
import { Input } from "@TaskNest/ui/components/input";
import { Label } from "@TaskNest/ui/components/label";
import { Textarea } from "@TaskNest/ui/components/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function ProjectCreateModal() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const createProject = useMutation(
		orpc.projects.create.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: (newProject) => {
				queryClient.invalidateQueries({
					queryKey: orpc.projects.list.queryKey(),
				});
				toast.success("Project created successfully");
				setName("");
				setDescription("");
				setError(null);
				setOpen(false);
				if (newProject?.id) {
					navigate({
						params: { projectId: newProject.id },
						to: "/dashboard/$projectId",
					});
				}
			},
		})
	);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setError("Project name is required");
			return;
		}
		setError(null);
		await createProject.mutateAsync({
			description: description.trim() || undefined,
			name: name.trim(),
		});
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger
				render={
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
						<span>New Project</span>
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
				</DialogHeader>
				<form className="space-y-4 pt-2" onSubmit={handleSubmit}>
					<div className="space-y-1">
						<Label htmlFor="project-name">Project Name</Label>
						<Input
							id="project-name"
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Website Redesign"
							required
							value={name}
						/>
						{error ? <p className="text-destructive text-xs">{error}</p> : null}
					</div>

					<div className="space-y-1">
						<Label htmlFor="project-desc">Description (optional)</Label>
						<Textarea
							id="project-desc"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Brief description of the project"
							rows={3}
							value={description}
						/>
					</div>

					<Button
						className="w-full"
						disabled={createProject.isPending}
						type="submit"
					>
						{createProject.isPending ? "Creating..." : "Create Project"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
