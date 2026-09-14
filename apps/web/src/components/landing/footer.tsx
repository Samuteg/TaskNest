import { Link } from "@tanstack/react-router";
import { FolderKanban, Globe, MessageSquare, Users } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-t bg-card py-16">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
					<div className="col-span-2 space-y-4 lg:col-span-2">
						<Link className="flex items-center gap-2" to="/">
							<FolderKanban className="h-6 w-6 text-primary" />
							<span className="font-bold text-lg">TaskNest</span>
						</Link>
						<p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
							Built with Next-Gen React, TanStack, and PostgreSQL. TaskNest
							gives fast-moving software teams a single source of truth for
							project delivery.
						</p>
						<div className="flex items-center gap-4 pt-2 text-muted-foreground">
							<MessageSquare className="h-4 w-4 cursor-pointer transition-colors hover:text-foreground" />
							<Users className="h-4 w-4 cursor-pointer transition-colors hover:text-foreground" />
							<Globe className="h-4 w-4 cursor-pointer transition-colors hover:text-foreground" />
						</div>
					</div>

					<div className="space-y-3">
						<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Product
						</h4>
						<ul className="space-y-2.5 text-muted-foreground text-xs">
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Features
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Integrations
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Changelog
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Company
						</h4>
						<ul className="space-y-2.5 text-muted-foreground text-xs">
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Blog
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Careers
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Legal
						</h4>
						<ul className="space-y-2.5 text-muted-foreground text-xs">
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Terms of Service
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Cookie Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
					<p className="text-[11px] text-muted-foreground">
						&copy; {new Date().getFullYear()} TaskNest Inc. All rights reserved.
					</p>
					<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
						<div className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-green-600 dark:text-green-400">
							<span className="h-1.5 w-1.5 rounded-full bg-green-500" />
							All Systems Operational
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
