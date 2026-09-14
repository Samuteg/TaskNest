import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@TaskNest/ui/components/select";

export function RoleSelect({
	value,
	onChange,
	disabled,
}: {
	value: string;
	onChange: (role: "admin" | "member") => void;
	disabled?: boolean;
}) {
	return (
		<Select
			disabled={disabled}
			onValueChange={(val) => {
				if (val) {
					onChange(val as "admin" | "member");
				}
			}}
			value={value}
		>
			<SelectTrigger className="h-8 w-28 text-xs">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="admin">Admin</SelectItem>
				<SelectItem value="member">Member</SelectItem>
			</SelectContent>
		</Select>
	);
}
