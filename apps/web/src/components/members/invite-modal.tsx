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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@TaskNest/ui/components/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function InviteModal({ projectId }: { projectId: string }) {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"admin" | "member">("member");
	const [error, setError] = useState<string | null>(null);

	const queryClient = useQueryClient();

	const invite = useMutation(
		orpc.invitations.create.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.invitations.list.queryKey({ input: { projectId } }),
				});
				toast.success("Invitation sent successfully");
				setEmail("");
				setRole("member");
				setError(null);
				setOpen(false);
			},
		})
	);

	const handleEmailChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
		[]
	);

	const handleRoleChange = useCallback((val: string | null) => {
		if (val) {
			setRole(val as "admin" | "member");
		}
	}, []);

	const handleCancel = useCallback(() => {
		setOpen(false);
	}, []);

	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			if (!email.trim()) {
				setError("Email address is required");
				return;
			}
			setError(null);
			await invite.mutateAsync({
				email: email.trim(),
				projectId,
				role,
			});
		},
		[email, projectId, role, invite]
	);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger
				render={
					<Button className="gap-2" size="sm">
						<UserPlus className="h-4 w-4" />
						<span>Invite Member</span>
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Invite to Project</DialogTitle>
				</DialogHeader>
				<form className="space-y-4 pt-2" onSubmit={handleSubmit}>
					<div className="space-y-1">
						<Label htmlFor="invite-email">Email Address</Label>
						<Input
							id="invite-email"
							onChange={handleEmailChange}
							placeholder="colleague@example.com"
							required
							type="email"
							value={email}
						/>
						{error ? <p className="text-destructive text-xs">{error}</p> : null}
					</div>

					<div className="space-y-1">
						<Label>Project Role</Label>
						<Select onValueChange={handleRoleChange} value={role}>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="member">Member</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button onClick={handleCancel} type="button" variant="outline">
							Cancel
						</Button>
						<Button disabled={invite.isPending} type="submit">
							{invite.isPending ? "Sending..." : "Send Invitation"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
