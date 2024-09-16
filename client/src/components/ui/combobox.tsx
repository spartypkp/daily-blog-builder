"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface typeTags {
	value: string;
	label: string;
}
interface ComboboxProps {
	typeTags: typeTags[];
	inputMessage: string;
	emptyMessage: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
	typeTags,
	inputMessage,
	emptyMessage,
}) => {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{value
						? typeTags.find((tag) => tag.value === value)?.label
						: "Select tag..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder={inputMessage} />
					<CommandEmpty>{emptyMessage}</CommandEmpty>
					<CommandGroup>
						{typeTags.map((tag) => (
							<CommandItem
								key={tag.value}
								value={tag.value}
								onSelect={(currentValue) => {
									setValue(
										currentValue === value
											? ""
											: currentValue,
									);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value === tag.value
											? "opacity-100"
											: "opacity-0",
									)}
								/>
								{tag.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
