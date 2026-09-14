import { Badge } from "@TaskNest/ui/components/badge";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import { Gauge, Kanban, Layers, ListTodo, Lock, Users } from "lucide-react";

export function Features() {
	return (
		<section className="border-y bg-muted/30 py-24">
			<div className="container mx-auto max-w-6xl space-y-16 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<Badge className="px-3 py-1 text-xs" variant="outline">
						Platform Capabilities
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Purpose-built for modern software teams
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						TaskNest cuts out the bloat of enterprise project management tools
						and focuses on speed, developer experience, and strict role-based
						access control.
					</p>
				</div>

				<div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{/* Large Feature Card */}
					<Card className="relative col-span-1 overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 sm:col-span-2 lg:col-span-3">
						<CardContent className="relative z-10 flex flex-col items-center justify-between gap-8 p-8 md:flex-row md:p-12">
							<div className="max-w-lg space-y-4">
								<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Kanban className="h-5 w-5" />
								</div>
								<h3 className="font-bold text-2xl tracking-tight">
									Real-Time Kanban Boards
								</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Drag and drop tasks across customizable statuses. See task
									updates and priority changes instantly without refreshing the
									page, powered by fine-grained reactive state.
								</p>
							</div>
							<div className="hidden h-48 w-64 items-center justify-center gap-3 rounded-2xl border bg-background/50 p-4 shadow-inner backdrop-blur-xs md:flex">
								<div className="h-full w-1/3 space-y-2 rounded-lg border border-border/50 bg-muted/60 p-2">
									<div className="h-2 w-full rounded bg-foreground/20" />
									<div className="h-8 w-full rounded border bg-card shadow-xs" />
									<div className="h-10 w-full rounded border bg-card shadow-xs" />
								</div>
								<div className="h-full w-1/3 space-y-2 rounded-lg border border-primary/20 bg-primary/10 p-2">
									<div className="h-2 w-full rounded bg-primary/30" />
									<div className="h-12 w-full rounded border border-primary/30 bg-card shadow-xs" />
								</div>
								<div className="h-full w-1/3 space-y-2 rounded-lg border border-green-500/20 bg-green-500/10 p-2">
									<div className="h-2 w-full rounded bg-green-500/30" />
									<div className="h-14 w-full rounded border border-green-500/30 bg-card line-through decoration-green-500/50 opacity-70 shadow-xs" />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Standard Cards */}
					<Card className="col-span-1 border bg-card/50">
						<CardContent className="space-y-4 p-6">
							<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
								<Layers className="h-5 w-5" />
							</div>
							<h3 className="font-semibold text-base">Priority Levels</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Differentiate Critical bugs from standard chores with 4 distinct
								priority tiers: Urgent, High, Medium, and Low.
							</p>
						</CardContent>
					</Card>

					<Card className="col-span-1 border bg-card/50">
						<CardContent className="space-y-4 p-6">
							<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
								<Users className="h-5 w-5" />
							</div>
							<h3 className="font-semibold text-base">
								Role-Based Access Control
							</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Easily toggle between Owner, Admin, and Member roles. Protect
								critical actions like inviting users or deleting projects
								automatically.
							</p>
						</CardContent>
					</Card>

					<Card className="col-span-1 border bg-card/50">
						<CardContent className="space-y-4 p-6">
							<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
								<ListTodo className="h-5 w-5" />
							</div>
							<h3 className="font-semibold text-base">Assignee Tracking</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Assign tasks directly to colleagues. When looking at the Kanban
								board, see avatars and track who owns what at a glance.
							</p>
						</CardContent>
					</Card>

					<Card className="col-span-1 border bg-card/50">
						<CardContent className="space-y-4 p-6">
							<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
								<Lock className="h-5 w-5" />
							</div>
							<h3 className="font-semibold text-base">Zero Config Auth</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Built securely on Better Auth with native session-based
								management, CSRF protection, HTTP-only cookies, and strong
								origin handling.
							</p>
						</CardContent>
					</Card>

					<Card className="col-span-1 border bg-card/50 sm:col-span-2">
						<CardContent className="flex flex-col items-center justify-between gap-6 space-y-4 p-6 sm:flex-row md:p-8">
							<div className="flex-1 space-y-2">
								<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
									<Gauge className="h-5 w-5" />
								</div>
								<h3 className="font-semibold text-base">
									Blazing Fast & Strictly Typed
								</h3>
								<p className="text-muted-foreground text-xs leading-relaxed">
									Zero unused re-renders via TanStack Query, type-safe
									end-to-end routing via TanStack Router, and highly optimized
									oRPC server-side handlers.
								</p>
							</div>
							<div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 font-mono text-primary text-xs">
								<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
								oRPC Latency: &lt;15ms
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
