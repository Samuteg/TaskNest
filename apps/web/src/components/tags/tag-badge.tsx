import { X } from "lucide-react";

export function TagBadge({
	color,
	name,
	onRemove,
}: {
	color: string;
	name: string;
	onRemove?: () => void;
}) {
	return (
		<span
			className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[10px]"
			style={{
				backgroundColor: `${color}20`,
				border: `1px solid ${color}40`,
				color,
			}}
		>
			{name}
			{onRemove ? (
				<button
					aria-label={`Remove ${name}`}
					className="rounded-full opacity-70 transition-opacity hover:opacity-100"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					type="button"
				>
					<X className="h-2.5 w-2.5" />
				</button>
			) : null}
		</span>
	);
}
