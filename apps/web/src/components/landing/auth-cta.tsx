import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export function AuthCta({ compact = false }: { compact?: boolean }) {
	const { data: session, isPending } = authClient.useSession();
	if (isPending) {
		return null;
	}
	if (session) {
		return (
			<Link to="/dashboard">
				<Button
					className="gap-2 font-semibold text-sm"
					size={compact ? "sm" : "lg"}
				>
					<span>Go to Dashboard</span>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</Link>
		);
	}
	return (
		<Link to="/login">
			<Button
				className="gap-2 font-semibold text-sm"
				size={compact ? "sm" : "lg"}
			>
				<span>{compact ? "Try Demo" : "Try the Demo"}</span>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</Link>
	);
}
