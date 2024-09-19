'use client';

import { useState, useEffect, useMemo } from "react";
import { init, tx, id } from '@instantdb/react';
import { DailyBlog, Introduction, Task, Reflection } from "@/lib/types";
import IntroductionSection from '@/components/introduction';
import ReflectionSection from '@/components/reflection';
import TaskSection from '@/components/task';
import DateSelector from "@/components/dateSelector";
import { useQuill } from 'react-quilljs';
// or const { useQuill } = require('react-quilljs');

import 'quill/dist/quill.snow.css'; // Add css for snow theme
import { Button } from "@/components/ui/button";
import { damp } from "three/src/math/MathUtils.js";

// ID for app: Instant Tutorial Todo App
const APP_ID = '3b4a73a0-ffc6-488a-b883-550004ff6e0a';

type Schema = {
	dailyBlogs: DailyBlog;
};

const db = init<Schema>({ appId: APP_ID });

const query = {
	dailyBlogs: {
		tasks: {},
	},
	
};


function App() {
	const today = (new Date).toISOString().slice(0, 10);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const { isLoading, error, data } = db.useQuery(query);
	const [activeTask, setActiveTask] = useState<string | null>(null);
	
	const dailyBlogs = data?.dailyBlogs;

	function addTask(selectedBlog: { id: string; } & DailyBlog) {
		const emptyTask: Task = {
			task_name: '',
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
			tools_used: '',
			task_created_at: new Date(),
		};
		// Update the index to the new task
		

		// Update the database
		const newTaskId = id()
		db.transact([
			tx.task[newTaskId].update(emptyTask),
			tx.task[newTaskId].link({dailyBlogs: selectedBlog.id })

		]);
		setActiveTask(newTaskId);
	}


	function deleteTask(task: { id: string; } & Task) {
		if (selectedBlog?.tasks && selectedBlog.tasks.length == 1) {
			// Pass if trying to delete the only Task
			console.log(`Cannot delete a task when it's the only task for a blog!`)
		} else {
			console.log(`Deleting task with id: ${task.id}`)
			// Delete a task indicated by the taskIndex. Calls merge with a null value
			db.transact([tx.task[task.id].delete()]);
			// Select the first task that wasn't the deleted one. Should trigger re-render
			selectedBlog!.tasks!.map((oldTask) => {
				if (oldTask.id !== task.id) {
					setActiveTask(oldTask.id)
					return;
				}
			})
		}
		
	}

	const selectedBlog: ({ id: string; } & DailyBlog) | undefined = useMemo(() => {

		const blog = dailyBlogs?.find((b) => b.date === selectedDate);
		//console.log(`selectedBlog has changed! ${JSON.stringify(blog)}`)
		// Map over task (Task[]), get all tasks
		return blog;
	}, [selectedDate, activeTask]);

	// iterate through dailyBlogs, finding the blog which has today's date (may not exist!). Set selectedBlog

	if (!selectedBlog && !isLoading && selectedDate) {
		const newId: string = id();
		let empty_blog = {
			"id": newId,
			"date": today,
			"blog_title": "",
			"blog_description": "",
			"created_at": (new Date).toDateString(),
			"day_count": calculateDayCount(),
			"status": null,
			"blog_tags": {}

		};

		db.transact([tx.dailyBlogs[newId].update(empty_blog)]);
		
	} else if (selectedBlog) {
		
		if (selectedBlog.tasks && selectedBlog.tasks.length == 0) {
			console.log("Adding task!")
			addTask(selectedBlog)
		} else if (activeTask === null) {
			const firstActiveTask = selectedBlog.tasks![0].id;
			setActiveTask(firstActiveTask);
		}
	}

	const handleDateChange = (newDate: string) => {
		console.log(`Handling date change! newDate: ${newDate}`);
		setSelectedDate(newDate);
	};

	if (isLoading) {
		return <p>loading</p>;
	}
	

	


	return (
		<div className="bg-white p-4">
			<header className="flex flex-col justify-center items-center text-center mb-6">
				<h1 className="text-5xl font-bold">Daily Blog Builder</h1>
				<DateSelector dailyBlogs={dailyBlogs!} handleDateChange={handleDateChange} />
				<div className="mt-4 bg-white rounded-lg p-4">
					<h2 className="text-3xl font-bold text-gray-800 text-center">Day Number</h2>
					<p id="day_count" className="text-m  text-gray-800 text-center"></p>
					<h2 className="text-3xl font-bold text-gray-800 text-center">Blog Title</h2>
					<p id="blog_title" className="text-m  text-gray-800 text-center"></p>
					<h2 className="text-3xl font-bold text-gray-800 text-center">Blog Description</h2>
					<p id="blog_description" className="text-m  text-gray-800 text-center"></p>

				</div>


			</header>

			{selectedBlog && (
				<div>
					<section className="goals mb-8 bg-gray-200 shadow-md rounded-lg p-6">
						<div className="flex justify-between items-center">

						</div>
						<IntroductionSection selectedBlog={selectedBlog!} db={db} tx={tx} />

					</section>
					{selectedBlog.tasks && (
						<section className="tasks mb-8 bg-gray-200 shadow-md rounded-lg p-6">
							<div className="flex justify-between items-center">

							</div>
							<div id="daily-tasks" className="mx-auto">
								<div id="tabs-container" className="tabs-container flex justify-center mb-2 border-b border-gray-300">
									{selectedBlog.tasks.map((task) => (
										<Button
											key={task.id}
											onClick={() => setActiveTask(task.id)}
											className={`tab text-gray-600 py-2 px-4 ${activeTask === task.id ? 'text-blue-500 border-blue-500' : 'text-gray-600 border-transparent'} hover:text-blue-500 focus:outline-none border-b-2 border-transparent hover:border-blue-500`}>
											{task.task_name || 'New Task'}
										</Button>

									))}


								</div>
								<div className="text-center">
									<button type="button" onClick={(e) => addTask(selectedBlog)}
										className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150">+
										Add Task</button>
								</div>
								<div className="tab-content mt-4" id="tabContent">
									{selectedBlog.tasks.map((task) => (
										<div key={task.id}>
											{activeTask === task.id &&
												<TaskSection
													task={task}
													db={db}
													tx={tx}
													deleteTask={deleteTask}
													setActiveTask={setActiveTask}
												/>
											}
										</div>
									))}

								</div>
							</div>
						</section>

					)}




					<section className="reflection mb-8 bg-gray-200 shadow-md rounded-lg p-6">
						<div className="flex justify-between items-center">

						</div>
						<ReflectionSection selectedBlog={selectedBlog!} db={db} tx={tx} />
					</section>



					<footer className="text-center">
						<button type="button" onClick={(e) => edit_blog()}
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Edit Blog</button>
						<button type="button" onClick={(e) => publish_blog()}
							className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Publish Blog</button>
					</footer>
				</div>
			)}



		</div >
	);
}

function edit_blog() {
	return;
}


function publish_blog() {
	return;
}


// Helper function to calculate day count
const calculateDayCount = (): number => {
	const startDate = new Date('2024-09-05');
	const today = new Date();
	return Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
};

// Function to create an empty daily blog
// export const createEmptyDailyBlog = (today: string): DailyBlog => {
// 	const emptyTask: Task = {
// 		task_name: '',
// 		task_goal: '',
// 		task_description: '',
// 		task_expected_difficulty: 50,
// 		task_planned_approach: '',
// 		task_progress_notes: '',
// 		task_start_summary: '',
// 		time_spent_coding: '',
// 		time_spent_researching: '',
// 		time_spent_debugging: '',
// 		task_reflection_summary: '',
// 		output_or_result: '',
// 		challenges_encountered: '',
// 		follow_up_tasks: '',
// 		reflection_successes: '',
// 		reflection_failures: '',
// 		research_questions: '',
// 		tools_used: ''
// 	};

// 	const emptyIntroduction: Introduction = {
// 		personal_context: '',
// 		daily_goals: '',
// 		learning_focus: '',
// 		challenges: '',
// 		plan_of_action: '',
// 		focus_level: 50,
// 		enthusiasm_level: 50,
// 		burnout_level: 50,
// 		leetcode_hatred_level: 50,
// 		introduction_summary: ''
// 	};

// 	const emptyReflection: Reflection = {
// 		learning_outcomes: '',
// 		next_steps_short_term: '',
// 		next_steps_long_term: '',
// 		productivity_level: 50,
// 		distraction_level: 50,
// 		desire_to_play_steam_games_level: 50,
// 		overall_frustration_level: 50,
// 		entire_blog_summary: '',
// 		technical_challenges: '',
// 		interesting_bugs: '',
// 		unanswered_questions: ''
// 	};

// 	return {
// 		date: today,
// 		day_count: calculateDayCount(),
// 		blog_title: '',
// 		blog_description: '',
// 		blog_tags: [],
// 		introduction: emptyIntroduction,
// 		tasks: [emptyTask],
// 		reflection: emptyReflection,
// 		status: ''
// 	};
// };

export default App;


