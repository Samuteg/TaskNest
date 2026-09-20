import type { AppRouterClient } from "@TaskNest/api/routers/index";
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
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import { Label } from "@TaskNest/ui/components/label";
import { Skeleton } from "@TaskNest/ui/components/skeleton";
import { Textarea } from "@TaskNest/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

type CommentItem = Awaited<
	ReturnType<AppRouterClient["comments"]["list"]>
>[number];

/**
 * Compact comment thread embedded in the task detail modal (built only from
 * existing ui primitives). Author/moderator controls are driven by the
 * API-provided `canEdit` flag — no client-side role math.
 */
export function CommentThread({ taskId }: { taskId: string }) {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [body, setBody] = useState("");

	const comments = useQuery(
		orpc.comments.list.queryOptions({ input: { taskId } })
	);

	const invalidateList = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: orpc.comments.list.queryKey({ input: { taskId } }),
		});
	}, [queryClient, taskId]);

	const createComment = useMutation(
		orpc.comments.create.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Failed to add comment");
			},
			onSuccess: () => {
				setBody("");
				invalidateList();
			},
		})
	);

	const handleBodyChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			setBody(e.target.value);
		},
		[]
	);

	const handleSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			const trimmed = body.trim();
			if (!trimmed || createComment.isPending) {
				return;
			}
			createComment.mutate({ body: trimmed, taskId });
		},
		[body, createComment, taskId]
	);

	return (
		<div className="space-y-2 border-t pt-3">
			<Label className="text-muted-foreground text-xs">
				Comments
				{comments.data?.length ? ` (${comments.data.length})` : ""}
			</Label>

			<CommentList
				comments={comments.data}
				invalidateList={invalidateList}
				isLoading={comments.isPending}
				sessionUserId={session?.user.id}
			/>

			<form className="space-y-1.5" onSubmit={handleSubmit}>
				<Textarea
					maxLength={2000}
					onChange={handleBodyChange}
					placeholder="Write a comment..."
					rows={2}
					value={body}
				/>
				<Button
					disabled={!body.trim() || createComment.isPending}
					size="sm"
					type="submit"
				>
					{createComment.isPending ? "Posting..." : "Comment"}
				</Button>
			</form>
		</div>
	);
}

function CommentList({
	comments,
	invalidateList,
	isLoading,
	sessionUserId,
}: {
	comments: CommentItem[] | undefined;
	invalidateList: () => void;
	isLoading: boolean;
	sessionUserId: string | undefined;
}) {
	if (isLoading) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	if (!comments?.length) {
		return (
			<p className="text-muted-foreground text-xs italic">No comments yet.</p>
		);
	}

	return (
		<div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
			{comments.map((comment) => (
				<CommentRow
					comment={comment}
					invalidateList={invalidateList}
					key={comment.id}
					sessionUserId={sessionUserId}
				/>
			))}
		</div>
	);
}

function CommentRow({
	comment,
	invalidateList,
	sessionUserId,
}: {
	comment: CommentItem;
	invalidateList: () => void;
	sessionUserId: string | undefined;
}) {
	const [draft, setDraft] = useState("");
	const [isEditing, setIsEditing] = useState(false);

	const updateComment = useMutation(
		orpc.comments.update.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Failed to update comment");
			},
			onSuccess: () => {
				setIsEditing(false);
				setDraft("");
				invalidateList();
			},
		})
	);

	const deleteComment = useMutation(
		orpc.comments.delete.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Failed to delete comment");
			},
			onSuccess: () => {
				toast.success("Comment deleted");
				invalidateList();
			},
		})
	);

	const handleDraftChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			setDraft(e.target.value);
		},
		[]
	);

	const handleStartEdit = useCallback(() => {
		setDraft(comment.body);
		setIsEditing(true);
	}, [comment.body]);

	const handleCancelEdit = useCallback(() => {
		setDraft("");
		setIsEditing(false);
	}, []);

	const handleSaveEdit = useCallback(() => {
		const trimmed = draft.trim();
		if (!trimmed || updateComment.isPending) {
			return;
		}
		updateComment.mutate({ body: trimmed, commentId: comment.id });
	}, [comment.id, draft, updateComment]);

	return (
		<div className="flex gap-2">
			<Avatar className="h-6 w-6">
				<AvatarImage src={comment.author.image ?? undefined} />
				<AvatarFallback className="text-[10px]">
					{comment.author.name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex items-center gap-1.5">
					<p className="truncate font-medium text-xs">{comment.author.name}</p>
					{sessionUserId === comment.author.id ? (
						<Badge className="text-[9px]" variant="outline">
							You
						</Badge>
					) : null}
					<span className="shrink-0 text-[10px] text-muted-foreground">
						{new Date(comment.createdAt).toLocaleString()}
					</span>
				</div>

				{isEditing ? (
					<div className="space-y-1.5">
						<Textarea
							maxLength={2000}
							onChange={handleDraftChange}
							rows={2}
							value={draft}
						/>
						<div className="flex gap-1.5">
							<Button
								disabled={updateComment.isPending}
								onClick={handleSaveEdit}
								size="sm"
							>
								{updateComment.isPending ? "Saving..." : "Save"}
							</Button>
							<Button onClick={handleCancelEdit} size="sm" variant="ghost">
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<p className="break-words text-xs leading-relaxed">{comment.body}</p>
				)}

				{comment.canEdit && !isEditing ? (
					<div className="flex items-center gap-1">
						<Button
							className="h-6 px-1.5 text-[10px]"
							onClick={handleStartEdit}
							size="sm"
							variant="ghost"
						>
							Edit
						</Button>
						<AlertDialog>
							<AlertDialogTrigger
								render={
									<Button
										aria-label="Delete comment"
										className="h-6 w-6 text-muted-foreground"
										size="icon"
										variant="ghost"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								}
							/>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete comment?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. The comment will be
										permanently removed.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										disabled={deleteComment.isPending}
										onClick={() =>
											deleteComment.mutate({ commentId: comment.id })
										}
										variant="destructive"
									>
										{deleteComment.isPending ? "Deleting..." : "Delete"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				) : null}
			</div>
		</div>
	);
}
