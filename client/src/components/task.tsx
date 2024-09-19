"use client";
import { Task } from "../lib/types";
import { init, tx, id, InstantReactWeb } from '@instantdb/react';
import { TxChunk } from '@instantdb/core/src/instatx';
import { InstantGraph } from '@instantdb/core/src/schema';
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef, useMemo } from "react";
import { useQuill } from 'react-quilljs';
import { Slider } from "@nextui-org/slider";
import { selectLocalImage } from "@/lib/quillHelpers";
import { Button } from "./ui/button";

type Schema = {
	dailyBlogs: DailyBlog;
};
interface TaskSectionProps {
	selectedBlog: { id: string; } & DailyBlog;
	db: InstantReactWeb<Schema, {}, false>;
	tx: TxChunk<InstantGraph<any, any, {}>>;
	taskId: number;
	deleteTask: (selectedBlog: { id: string; } & DailyBlog, taskId: number) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({ selectedBlog, db, tx, taskId, deleteTask }) => {

	function mergeField(id: string, field_name: string, field_value: string) {
		db.transact([
			tx.dailyBlogs[id].merge({
				tasks: {
					[taskId]: {
						[field_name]: field_value
					},
				},
			}),
		]);
	}

	function mergeNumericField(id: string, field_name: string, field_value: number | number[]) {
		if (typeof (field_value) !== 'number') {
			field_value = field_value[0];
		}
		db.transact([
			tx.dailyBlogs[id].merge({
				tasks: {
					[taskId]: {
						[field_name]: field_value
					},
				},
			}),
		]);
	}

	let task = selectedBlog.tasks[taskId];
	if (!task) {
		const emptyTask: Task = {
			task_goal: '',
			task_description: '',
			task_expected_difficulty: 50,
			task_planned_approach: '',
			task_progress_notes: '',
			task_start_summary: '',
			time_spent_coding: '',
			time_spent_researching: '',
			time_spent_debugging: '',
			task_reflection_summary: '',
			output_or_result: '',
			challenges_encountered: '',
			follow_up_tasks: '',
			reflection_successes: '',
			reflection_failures: '',
			research_questions: '',
			tools_used: ''
		};
		task = emptyTask;
	}

	const theme = "snow";
	const modules = {
		toolbar: [
			['bold', 'italic', 'underline', 'strike'],
			['blockquote', 'code-block'],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'indent': '-1' }, { 'indent': '+1' }],
			[{ 'size': ['small', false, 'large', 'huge'] }],
			['image']
		],
	};

	const { quill: quill_task_goal, quillRef: quillRef_task_goal } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_task_goal && task) {
			const module: any = quill_task_goal.getModule('toolbar');
			module.addHandler('image', selectLocalImage);
			quill_task_goal.clipboard.dangerouslyPasteHTML(task.task_goal!);

			const key = 'task_goal';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_task_goal.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_task_goal.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_task_goal.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_task_goal, selectedBlog.id]);
	const { quill: quill_task_description, quillRef: quillRef_task_description } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_task_description && task) {
			const module: any = quill_task_description.getModule('toolbar');
			module.addHandler('image', selectLocalImage);
			quill_task_description.clipboard.dangerouslyPasteHTML(task.next_steps_short_term!);

			const key = 'next_steps_short_term';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_task_description.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_task_description.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_task_description.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_task_description, selectedBlog.id]);
	const { quill: quill_task_planned_approach, quillRef: quillRef_task_planned_approach } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_task_planned_approach && task) {
			const module: any = quill_task_planned_approach.getModule('toolbar');
			module.addHandler('image', selectLocalImage);
			quill_task_planned_approach.clipboard.dangerouslyPasteHTML(task.next_steps_long_term!);

			const key = 'next_steps_long_term';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_task_planned_approach.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_task_planned_approach.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_task_planned_approach.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_task_planned_approach, selectedBlog.id]);
	const { quill: quill_progress_notes, quillRef: quillRef_progress_notes } = useQuill({theme, modules});
	useEffect(() => {
		if (quill_progress_notes && task) {
			const module: any = quill_progress_notes.getModule('toolbar');
			module.addHandler('image', selectLocalImage);
			quill_progress_notes.clipboard.dangerouslyPasteHTML(task.personal_context!);


			const key = 'personal_context';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_progress_notes.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_progress_notes.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_progress_notes.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_progress_notes, selectedBlog.id]);
	

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
			if (quill_progress_notes && task.progress_notes) {
				quill_progress_notes.clipboard.dangerouslyPasteHTML(task.progress_notes);
			}

		}

	}, [selectedBlog.id]);



	return (
		<div>
			<div id={`task-start${taskId}`} className="mb-4 bg-white p-4 border rounded">
				<h3 className="font-bold mt-2">Task Goal:</h3>
				<div id={`task_goal${taskId}`} className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_task_goal}></div>

				<h3 className="font-bold mt-2">Task Description:</h3>
				<div id={`task_description${taskId}`} className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_task_description}></div>

				<h3 className="font-bold mt-2">Expected Difficulty:</h3>
				<Slider
					key="task_expected_difficulty"
					aria-label="task_expected_difficulty"
					minValue={0}
					step={1}
					maxValue={100}
					defaultValue={task.task_expected_difficulty || 50}

					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `bg-blue`,
						thumb: `transition-transform bg-blue shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "task_expected_difficulty", value)}>
				</Slider>


				<h3 className="font-bold mt-2">Planned Approach:</h3>
				<div id={`task_planned_approach${taskId}`} className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_task_planned_approach}></div>

				<h3 className="font-bold mt-4">Dave's Task Summary:</h3>
				<div id={`task_start_summary${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.task_start_summary}</div>
			</div>



			<div id={`task-work${taskId}`} className="mb-4 bg-white p-4 border rounded">
				<h3 className="font-bold">Progress Notes:</h3>
				<div id={`task_progress_notes${taskId}`} className="min-h-[300px] bg-gray-50 p-4 rounded border" ref={quillRef_progress_notes}></div>
			</div>



			<div id={`task-reflection${taskId}`} className="mb-4 bg-white p-4 border rounded">
				
				<h2>Human Reflection</h2>
				<h3 className="font-bold mt-4">Time Spent Coding:</h3>
				<input aria-label={`time_spent_coding${taskId}`} type="text" id={`time_spent_coding${taskId}`} className="w-full p-2 border border-gray-300 rounded" value={task.time_spent_coding} />

				<h3 className="font-bold mt-4">Time Spent Researching:</h3>
				<input aria-label={`time_spent_researching${taskId}`} type="text" id={`time_spent_researching${taskId}`} className="w-full p-2 border border-gray-300 rounded" value={task.time_spent_researching} />

				<h3 className="font-bold mt-4">Time Spent Debugging:</h3>
				<input aria-label={`time_spent_debugging${taskId}`} type="text" id={`time_spent_debugging${taskId}`} className="w-full p-2 border border-gray-300 rounded" value={task.time_spent_debugging} />

				
				<h2>AI Generated Task Reflection</h2>
				<h3 className="font-bold">AI Reflection Summary:</h3>
				<div id={`task_reflection_summary${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.task_reflection_summary}</div>

				<h3 className="font-bold mt-4">Output or Result:</h3>
				<div id={`output_or_result${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.output_or_result}</div>

				<h3 className="font-bold mt-4">Challenges Encountered:</h3>
				<div id={`challenges_encountered${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.challenges_encountered}</div>

				<h3 className="font-bold mt-4">Follow-Up Tasks:</h3>
				<div id={`follow_up_tasks${taskId}`} className="min-h-[150px] bg-gray-50 p-4 rounded border">{task.follow_up_tasks}</div>

				<h3 className="font-bold mt-4">Successes:</h3>
				<div id={`reflection_successes${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.reflection_successes}</div>

				<h3 className="font-bold mt-4">Failures or Shortcomings:</h3>
				<div id={`reflection_failures${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.reflection_failures}</div>

				<h3 className="font-bold mt-4">Research Questions:</h3>
				<div id={`research_questions${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.research_questions}</div>

				<h3 className="font-bold mt-4">Tools Used:</h3>
				<div id={`tools_used${taskId}`} className="min-h-[150px] bg-gray-100 p-4 rounded border">{task.tools_used}</div>
			</div>

			<Button onClick={() => deleteTask(selectedBlog, taskId)}
				className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Task</Button>
		</div>
	);
};
export default TaskSection;