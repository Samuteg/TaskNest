import type { AppRouterClient } from "@TaskNest/api/routers/index";
import { Button } from "@TaskNest/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@TaskNest/ui/components/dropdown-menu";
import { Input } from "@TaskNest/ui/components/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
	type ChangeEvent,
	type FormEvent,
	useCallback,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";

import { TagBadge } from "@/components/tags/tag-badge";
import { orpc } from "@/utils/orpc";

export type TagSummary = Awaited<
	ReturnType<AppRouterClient["tags"]["list"]>
>[number];

/**
 * Controlled tag picker: removable `TagBadge` chips + "Add tag" dropdown
 * listing the user's tags, with an inline create flow (Ruling 2: built only
 * from existing ui primitives, no popover/command).
 *
 * `selected` is the caller's OWN tag selection — `onChange` only ever emits
 * owned tags, so a `setTags` payload can never contain foreign ids.
 * `attached` (optional) is the task's full attached list: tags owned by
 * other members render as non-removable read-only chips and are never
 * echoed back through `onChange`.
 */
export function TagEditor({
	attached = [],
	onChange,
	selected,
}: {
	attached?: TagSummary[];
	onChange: (next: TagSummary[]) => void;
	selected: TagSummary[];
}) {
	const queryClient = useQueryClient();
	const [isCreating, setIsCreating] = useState(false);
	const [newTagName, setNewTagName] = useState("");

	const availableTags = useQuery(orpc.tags.list.queryOptions());

	const ownIds = useMemo(
		() => new Set((availableTags.data ?? []).map((t) => t.id)),
		[availableTags.data]
	);

	const foreignTags = attached.filter((t) => !ownIds.has(t.id));

	const createTag = useMutation(
		orpc.tags.create.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Failed to create tag");
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.tags.list.queryKey(),
				});
			},
		})
	);

	const handleToggle = useCallback(
		(tagItem: TagSummary) => {
			onChange(
				selected.some((t) => t.id === tagItem.id)
					? selected.filter((t) => t.id !== tagItem.id)
					: [...selected, tagItem]
			);
		},
		[onChange, selected]
	);

	const handleNameChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value),
		[]
	);

	const handleCreateTag = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			const name = newTagName.trim();
			if (!name || createTag.isPending) {
				return;
			}
			try {
				const created = await createTag.mutateAsync({ name });
				setNewTagName("");
				setIsCreating(false);
				if (!selected.some((t) => t.id === created.id)) {
					onChange([...selected, created]);
				}
			} catch {
				// onError toast already surfaced the failure.
			}
		},
		[newTagName, createTag, selected, onChange]
	);

	const handleStartCreate = useCallback((e: { preventDefault: () => void }) => {
		e.preventDefault();
		setIsCreating(true);
	}, []);

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{foreignTags.map((t) => (
				<TagBadge color={t.color} key={`foreign-${t.id}`} name={t.name} />
			))}
			{selected.map((t) => (
				<TagBadge
					color={t.color}
					key={t.id}
					name={t.name}
					onRemove={() => handleToggle(t)}
				/>
			))}
			<DropdownMenu>
				<DropdownMenuTrigger
					className="h-6 gap-1 px-1.5 text-[10px]"
					render={<Button size="sm" type="button" variant="outline" />}
				>
					<Plus className="h-3 w-3" />
					<span>Add tag</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-52 bg-card">
					{availableTags.data?.length ? (
						availableTags.data.map((t) => (
							<DropdownMenuCheckboxItem
								checked={selected.some((s) => s.id === t.id)}
								key={t.id}
								onCheckedChange={() => handleToggle(t)}
							>
								<TagBadge color={t.color} name={t.name} />
							</DropdownMenuCheckboxItem>
						))
					) : (
						<p className="px-2 py-1.5 text-muted-foreground text-xs">
							No tags yet — create one below.
						</p>
					)}
					<DropdownMenuSeparator />
					{isCreating ? (
						<form
							className="flex items-center gap-1 p-1.5"
							onSubmit={handleCreateTag}
						>
							<Input
								autoFocus
								className="h-7 text-xs"
								maxLength={30}
								onChange={handleNameChange}
								placeholder="Tag name"
								value={newTagName}
							/>
							<Button
								className="h-7 shrink-0 px-2 text-xs"
								disabled={createTag.isPending}
								size="sm"
								type="submit"
							>
								{createTag.isPending ? "..." : "Add"}
							</Button>
						</form>
					) : (
						<DropdownMenuItem onClick={handleStartCreate}>
							<Plus className="mr-1 h-3.5 w-3.5" />
							<span>Create tag</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
