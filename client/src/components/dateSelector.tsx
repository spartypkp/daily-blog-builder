"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DailyBlog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
const FormSchema = z.object({
	date: z
		.string({
			required_error: "Please select a date to select a blog",
		})

});
interface DateSelectorProps {
	dailyBlogs: ({
		id: string;
	} & DailyBlog)[];
	handleDateChange: (newDate: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ dailyBlogs, handleDateChange }) => {
	const today = (new Date).toISOString().slice(0, 10);
	
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	const sortedAndFilteredBlogs = useMemo(() => {
		// First, sort blogs by day_count descending
		const sortedBlogs = [...dailyBlogs].sort((a, b) => b.day_count - a.day_count);
		// Then, filter out today's date if it exists to avoid duplications
		return sortedBlogs.filter(blog => blog.date !== today);
	}, [dailyBlogs, today]);

	function onSubmit(data: z.infer<typeof FormSchema>) {
		console.log(`Inside onSubmit, calling handleDateChange with ${data.date}`);
		handleDateChange(data.date);

	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-1/3 space-y-6">
				<FormField
					control={form.control}
					name="date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Date</FormLabel>
							<Select onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a date to display a blog." />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{/* Ensure today's date is always listed first */}

									<SelectItem key={today} value={today}>
										{today}
									</SelectItem>



									{/* Map through the filtered list of blogs */}
									{sortedAndFilteredBlogs.map((blog) => (
										<SelectItem key={blog.date} value={blog.date}>
											{blog.date}
										</SelectItem>
									))}

								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button className="bg-green-500" type="submit">Load Blog</Button>
			</form>
		</Form>
	);
};
export default DateSelector;
