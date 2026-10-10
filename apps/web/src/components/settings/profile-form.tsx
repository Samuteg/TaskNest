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
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function ProfileForm({
	user,
}: {
	user: { name: string; email: string };
}) {
	const [name, setName] = useState(user.name);

	const updateProfile = useMutation(
		orpc.profile.update.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				toast.success("Profile updated successfully");
			},
		})
	);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		// Email changes only via a verified flow; profile keeps the name.
		await updateProfile.mutateAsync({
			name: name.trim() || undefined,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Details</CardTitle>
				<CardDescription>
					Update your personal account information.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-1">
						<Label htmlFor="profile-name">Name</Label>
						<Input
							id="profile-name"
							onChange={(e) => setName(e.target.value)}
							required
							value={name}
						/>
					</div>

					<div className="space-y-1">
						<Label htmlFor="profile-email">Email Address</Label>
						<Input
							disabled
							id="profile-email"
							type="email"
							value={user.email}
						/>
						<p className="text-muted-foreground text-xs">
							Email changes require verification and are not edited here.
						</p>
					</div>

					<Button disabled={updateProfile.isPending} type="submit">
						{updateProfile.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
