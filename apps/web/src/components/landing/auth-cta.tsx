import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export function AuthCta({
	compact = false,
	className,
}: {
	compact?: boolean;
	className?: string;
}) {
	const { data: session, isPending } = authClient.useSession();
	if (isPending) {
		return null;
	}
	if (session) {
		return (
			<Link to="/dashboard">
				<Button className={className} size={compact ? "sm" : "lg"}>
					<span>Go to Dashboard</span>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</Link>
		);
	}
	return (
		<Link search={{ verified: undefined }} to="/login">
			<Button className={className} size={compact ? "sm" : "lg"}>
				<span>{compact ? "Try Demo" : "Try the Demo"}</span>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</Link>
	);
}
