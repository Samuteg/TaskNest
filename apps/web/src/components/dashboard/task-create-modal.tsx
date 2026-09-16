import { Button } from "@TaskNest/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@TaskNest/ui/components/dialog";
import { Input } from "@TaskNest/ui/components/input";
import { Label } from "@TaskNest/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@TaskNest/ui/components/select";
import { Textarea } from "@TaskNest/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useCallback, useState } from "react";
import { toast } from "sonner";

import { client, orpc } from "@/utils/orpc";

export function TaskCreateModal({
	projectId,
	defaultStatus,
	onClose,
}: {
	projectId: string;
	defaultStatus: "todo" | "in_progress" | "done";
	onClose: () => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<
		"low" | "medium" | "high" | "urgent"
	>("medium");
	const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
	const [dueDate, setDueDate] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const queryClient = useQueryClient();
	const members = useQuery(
		orpc.members.list.queryOptions({ input: { projectId } })
	);

	const createTask = useMutation(
		orpc.tasks.create.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.tasks.list.queryKey({ input: { projectId } }),
				});
				toast.success("Task created successfully");
				onClose();
			},
		})
	);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				onClose();
			}
		},
		[onClose]
	);

	const handleTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value),
		[]
	);

	const handleDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) =>
			setDescription(e.target.value),
		[]
	);

	const handlePriorityChange = useCallback((val: string | null) => {
		if (val) {
			setPriority(val as "low" | "medium" | "high" | "urgent");
		}
	}, []);

	const handleDueDateChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value),
		[]
	);

	const handleAssigneeChange = useCallback((val: string | null) => {
		setAssigneeId(val === "unassigned" ? undefined : (val ?? undefined));
	}, []);

	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			if (!title.trim()) {
				setError("Task title is required");
				return;
			}
			setError(null);
			const created = await createTask.mutateAsync({
				assigneeId: assigneeId || undefined,
				description: description.trim() || undefined,
				dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
				priority,
				projectId,
				title: title.trim(),
			});

			if (defaultStatus !== "todo") {
				await client.tasks.updateStatus({
					status: defaultStatus,
					taskId: created.id,
				});
				queryClient.invalidateQueries({
					queryKey: orpc.tasks.list.queryKey({ input: { projectId } }),
				});
			}
		},
		[
			title,
			description,
			assigneeId,
			dueDate,
			priority,
			projectId,
			defaultStatus,
			createTask,
			queryClient,
		]
	);

	return (
		<Dialog onOpenChange={handleOpenChange} open>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Create Task</DialogTitle>
				</DialogHeader>
				<form className="space-y-4 pt-2" onSubmit={handleSubmit}>
					<div className="space-y-1">
						<Label htmlFor="task-title">Title</Label>
						<Input
							id="task-title"
							onChange={handleTitleChange}
							placeholder="e.g. Implement authentication flow"
							required
							value={title}
						/>
						{error ? <p className="text-destructive text-xs">{error}</p> : null}
					</div>

					<div className="space-y-1">
						<Label htmlFor="task-desc">Description (optional)</Label>
						<Textarea
							id="task-desc"
							onChange={handleDescriptionChange}
							placeholder="Detailed description of the task"
							rows={3}
							value={description}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label>Priority</Label>
							<Select onValueChange={handlePriorityChange} value={priority}>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<Label htmlFor="due-date">Due Date (optional)</Label>
							<Input
								id="due-date"
								onChange={handleDueDateChange}
								type="date"
								value={dueDate}
							/>
						</div>
					</div>

					<div className="space-y-1">
						<Label>Assignee (optional)</Label>
						<Select
							onValueChange={handleAssigneeChange}
							value={assigneeId ?? "unassigned"}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select assignee" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="unassigned">Unassigned</SelectItem>
								{members.data?.map((m) => (
									<SelectItem key={m.userId} value={m.userId}>
										{m.user.name} ({m.user.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button onClick={onClose} type="button" variant="outline">
							Cancel
						</Button>
						<Button disabled={createTask.isPending} type="submit">
							{createTask.isPending ? "Creating..." : "Create Task"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
