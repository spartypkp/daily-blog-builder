"use client";
import { Task } from "../lib/types";
import { init, tx, id, InstantReactWeb } from '@instantdb/react';
import { TxChunk } from '@instantdb/core/src/instatx';
import { InstantGraph } from '@instantdb/core/src/schemaTypes';
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef, useMemo, useState } from "react";
import { useQuill } from 'react-quilljs';
import { Slider } from "@nextui-org/slider";
import { selectLocalImage } from "@/lib/quillHelpers";
import { Button } from "./ui/button";

import { Textarea } from "./ui/textArea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";


type Schema = {
	dailyBlogs: DailyBlog;
};
interface TaskSectionProps {
	task: { id: string; } & Task;
	db: InstantReactWeb<Schema, {}, false>;
	tx: TxChunk<InstantGraph<any, any, {}>>;
	deleteTask: (task: { id: string; } & Task) => void;
	setActiveTask: (taskId: string | null) => void;
}

const FormSchema = z.object({
	task_name: z
		.string()
		.max(100, {
			message: "Name must not be longer than 100 characters.",
		}),
});

const TaskSection: React.FC<TaskSectionProps> = ({ task, db, tx, deleteTask, setActiveTask }) => {

	const [taskExpectedDifficulty, setTaskExpectedDifficulty] = useState(Number(task.task_expected_difficulty) || 50);
	const [timeSpentCoding, setTimeSpentCoding] = useState(Number(task.time_spent_coding) || 0);
	const [timeSpentDebugging, setTimeSpentDebugging] = useState(Number(task.time_spent_debugging) || 0);
	const [timeSpentResearching, setTimeSpentResearching] = useState(Number(task.time_spent_researching) || 0);



	function mergeField(taskId: string, field_name: string, field_value: string) {
		db.transact([
			tx.task[taskId].update({
				[field_name]: field_value
			}),
		]);
	}

	function mergeNumericField(taskId: string, field_name: string, field_value: number | number[]) {
		if (typeof (field_value) !== 'number') {
			field_value = field_value[0];
		}
		db.transact([
			tx.task[taskId].update({
				[field_name]: field_value
			}),
		]);
	}


	const theme = "snow";
	const modules = {
		toolbar: {
			container: [
				['bold', 'italic', 'underline', 'strike'],
				['code-block'],
				[{ 'list': 'ordered' }, { 'list': 'bullet' }],
				[{ 'indent': '-1' }, { 'indent': '+1' }],
				[{ 'size': ['small', false, 'large', 'huge'] }],
				['image']],
			handlers: {
				'code-block': () => { console.log('code-block was clicked');},
				
			}
		}
	};

	const { quill: quill_task_goal, quillRef: quillRef_task_goal } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_task_goal && task) {
			(quill_task_goal.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_task_goal));
			quill_task_goal.clipboard.dangerouslyPasteHTML(task.task_goal!);

			const key = 'task_goal';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_task_goal.root.innerHTML;

					mergeField(task.id, key, htmlText);
				}
			};

			quill_task_goal.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_task_goal.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_task_goal, task]);

	const { quill: quill_task_description, quillRef: quillRef_task_description } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_task_description && task) {
			(quill_task_description.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_task_description));
			
			quill_task_description.clipboard.dangerouslyPasteHTML(task.task_description!);

			const key = 'task_description';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_task_description.root.innerHTML;

					mergeField(task.id, key, htmlText);
				}
			};

			quill_task_description.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_task_description.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_task_description, task]);
	const { quill: quill_task_planned_approach, quillRef: quillRef_task_planned_approach } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_task_planned_approach && task) {
			(quill_task_planned_approach.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_task_planned_approach));
			
			quill_task_planned_approach.clipboard.dangerouslyPasteHTML(task.task_planned_approach!);

			const key = 'task_planned_approach';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_task_planned_approach.root.innerHTML;

					mergeField(task.id, key, htmlText);
				}
			};

			quill_task_planned_approach.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_task_planned_approach.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_task_planned_approach, task]);
	const { quill: quill_task_progress_notes, quillRef: quillRef_task_progress_notes } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_task_progress_notes && task) {
			(quill_task_progress_notes.getModule('toolbar') as any).addHandler('image',() => selectLocalImage(quill_task_progress_notes));
			
			quill_task_progress_notes.clipboard.dangerouslyPasteHTML(task.task_progress_notes!);


			const key = 'task_progress_notes';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_task_progress_notes.root.innerHTML;

					mergeField(task.id, key, htmlText);
				}
			};

			quill_task_progress_notes.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_task_progress_notes.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_task_progress_notes, task]);


	useMemo(() => {
		if (task) {
			if (task.task_goal && quill_task_goal) {
				quill_task_goal.clipboard.dangerouslyPasteHTML(task.task_goal);
			}
			if (quill_task_description && task.task_description) {
				quill_task_description.clipboard.dangerouslyPasteHTML(task.task_description);
			}
			if (quill_task_planned_approach && task.task_planned_approach) {
				quill_task_planned_approach.clipboard.dangerouslyPasteHTML(task.task_planned_approach);
			}
			if (quill_task_progress_notes && task.task_progress_notes) {
				quill_task_progress_notes.clipboard.dangerouslyPasteHTML(task.task_progress_notes);
			}

		}

	}, [task]);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		mergeField(task.id, "task_name", data.task_name);
		// Stupid hack to trigger a re-render
		setActiveTask(null);
		setTimeout(() => {
			setActiveTask(task.id);
		}, 1000); // Delay in milliseconds
	}

	useEffect(() => {
        setTaskExpectedDifficulty(task.task_expected_difficulty || 50)
		setTimeSpentCoding(Number(task.time_spent_coding) || 0)
		setTimeSpentResearching(Number(task.time_spent_researching) || 0)
		setTimeSpentDebugging(Number(task.time_spent_debugging) || 0);
    }, [task.id]);


	return (
		<div>
			<div id={`task-start${task.id}`} className="mb-4 bg-white p-4 border rounded">
				<h3 className="font-bold mt-2">Task Name:</h3>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="w-full p-2 border border-gray-300 rounded">
						<FormField
							control={form.control}
							name="task_name"
							render={({ field }) => (
								<FormItem>
									
									<FormControl>
										<Textarea
											placeholder={task.task_name}
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Change the task name.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
				

				<h3 className="font-bold mt-2">Task Goal:</h3>
				<div id={`task_goal${task.id}`} className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_task_goal}></div>

				<h3 className="font-bold mt-2">Task Description:</h3>
				<div id={`task_description${task.id}`} className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_task_description}></div>

				<h3 className="font-bold mt-2">Expected Difficulty:</h3>
				<Slider
					key="task_expected_difficulty"
					aria-label="task_expected_difficulty"
					minValue={0}
					step={1}
					maxValue={100}
					value={taskExpectedDifficulty}

					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `bg-blue-500`,
						thumb: `transition-transform bg-blue-500 shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeNumericField(task.id, "task_expected_difficulty", value)}
					onChange={(value) => setTaskExpectedDifficulty(value as number)}>
				</Slider>


				<h3 className="font-bold mt-2">Planned Approach:</h3>
				<div id={`task_planned_approach${task.id}`} className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_task_planned_approach}></div>

				<h3 className="font-bold mt-4">Dave's Task Summary:</h3>
				<div id={`task_start_summary${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.task_start_summary}</div>
			</div>



			<div id={`task-work${task.id}`} className="mb-4 bg-white p-4 border rounded">
				<h3 className="font-bold">Progress Notes:</h3>
				<div id={`task_progress_notes${task.id}`} className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_task_progress_notes}></div>
				
			</div>



			<div id={`task-reflection${task.id}`} className="mb-4 bg-white p-4 border rounded">
				<h3 className="font-bold mt-4">Time Spent Coding: {timeSpentCoding}</h3>
				<Slider
					key="time_spent_coding"
					aria-label="time_spent_coding"
					minValue={0}
					step={.25}
					maxValue={10}
					value={timeSpentCoding}
					
					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `bg-blue-500`,
						thumb: `transition-transform bg-blue-500 shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeField(task.id, "time_spent_coding", value.toString())}
					onChange={(value) => setTimeSpentCoding(value as number)}
					>
				</Slider>

				<h3 className="font-bold mt-4">Hours Spent Researching: {timeSpentResearching}</h3>
				<Slider
					
					key="time_spent_researching"
					aria-label="time_spent_researching"
					minValue={0}
					step={.25}
					maxValue={10}
					value={timeSpentResearching}

					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `bg-blue-500`,
						thumb: `transition-transform bg-blue-500 shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeField(task.id, "time_spent_researching", value.toString())}
					onChange={(value) => setTimeSpentResearching(value as number)}>
				</Slider>

				<h3 className="font-bold mt-4">Hours Spent Debugging: {timeSpentDebugging}</h3>
				<Slider
					key="time_spent_debugging"
					aria-label="time_spent_debugging"
					minValue={0}
					step={.25}
					maxValue={10}
					value={timeSpentDebugging}

					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `bg-blue-500`,
						thumb: `transition-transform bg-blue-500 shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeField(task.id, "time_spent_debugging", value.toString())}
					onChange={(value) => setTimeSpentDebugging(value as number)}>
					
				</Slider>


				
				<h3 className="font-bold mt-10">AI Reflection Summary:</h3>
				<div id={`task_reflection_summary${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.task_reflection_summary}</div>

				<h3 className="font-bold mt-4">Output or Result:</h3>
				<div id={`output_or_result${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.output_or_result}</div>

				<h3 className="font-bold mt-4">Challenges Encountered:</h3>
				<div id={`challenges_encountered${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.challenges_encountered}</div>

				<h3 className="font-bold mt-4">Follow-Up Tasks:</h3>
				<div id={`follow_up_tasks${task.id}`} className="min-h-[150px] bg-gray-50 p-4 rounded border">{task.follow_up_tasks}</div>

				<h3 className="font-bold mt-4">Successes:</h3>
				<div id={`reflection_successes${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.reflection_successes}</div>

				<h3 className="font-bold mt-4">Failures or Shortcomings:</h3>
				<div id={`reflection_failures${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.reflection_failures}</div>

				<h3 className="font-bold mt-4">Research Questions:</h3>
				<div id={`research_questions${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.research_questions}</div>

				<h3 className="font-bold mt-4">Tools Used:</h3>
				<div id={`tools_used${task.id}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.tools_used}</div>
			</div>

			<Button onClick={() => deleteTask(task)}
				className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Task</Button>
		</div>
	);
};
export default TaskSection;