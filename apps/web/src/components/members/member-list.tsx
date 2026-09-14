import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

import { RoleSelect } from "./role-select";

export function MemberList({
	projectId,
	currentUserId,
	isOwner,
}: {
	projectId: string;
	currentUserId: string;
	isOwner: boolean;
}) {
	const queryClient = useQueryClient();
	const members = useQuery(
		orpc.members.list.queryOptions({ input: { projectId } })
	);

	const updateRole = useMutation(
		orpc.members.updateRole.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.members.list.queryKey({ input: { projectId } }),
				});
				toast.success("Role updated successfully");
			},
		})
	);

	const removeMember = useMutation(
		orpc.members.remove.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.members.list.queryKey({ input: { projectId } }),
				});
				toast.success("Member removed");
			},
		})
	);

	if (members.isLoading) {
		return (
			<p className="animate-pulse text-muted-foreground text-xs">
				Loading members...
			</p>
		);
	}

	const memberList = members.data ?? [];

	return (
		<div className="space-y-3">
			{memberList.map((m) => {
				const isSelf = m.userId === currentUserId;
				const isMemberOwner = m.role === "owner";

				return (
					<div
						className="flex items-center justify-between rounded-lg border bg-card p-3"
						key={m.id}
					>
						<div className="flex items-center gap-3">
							<Avatar className="h-8 w-8">
								<AvatarImage src={m.user.image ?? undefined} />
								<AvatarFallback className="text-xs">
									{m.user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium text-sm">
									{m.user.name} {isSelf ? "(You)" : ""}
								</p>
								<p className="text-muted-foreground text-xs">{m.user.email}</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{isMemberOwner ? (
								<Badge className="text-xs" variant="secondary">
									Owner
								</Badge>
							) : (
								<>
									<RoleSelect
										disabled={!isOwner || updateRole.isPending}
										onChange={(newRole) => {
											updateRole.mutate({
												projectId,
												role: newRole,
												userId: m.userId,
											});
										}}
										value={m.role}
									/>
									{isOwner && !isSelf ? (
										<Button
											className="h-8 w-8 text-muted-foreground hover:text-destructive"
											disabled={removeMember.isPending}
											onClick={() => {
												removeMember.mutate({
													projectId,
													userId: m.userId,
												});
											}}
											size="icon"
											variant="ghost"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									) : null}
								</>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
