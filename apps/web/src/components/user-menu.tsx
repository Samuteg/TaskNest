import { Button } from "@TaskNest/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@TaskNest/ui/components/dropdown-menu";
import { Skeleton } from "@TaskNest/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";

import { authClient } from "@/lib/auth-client";

function SignInButton() {
	return (
		<Link search={{ verified: undefined }} to="/login">
			<Button variant="outline">Sign In</Button>
		</Link>
	);
}

function MenuDropdown() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		return <SignInButton />;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{session.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>{session.user.email}</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
						Dashboard
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
						Account Settings
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										navigate({ to: "/" });
									},
								},
							});
						}}
						variant="destructive"
					>
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default function UserMenu() {
	return (
		<ErrorBoundary FallbackComponent={SignInButton}>
			<MenuDropdown />
		</ErrorBoundary>
	);
}
