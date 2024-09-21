'use client';

import { useState, useEffect, useMemo } from "react";
import { init, tx, id } from '@instantdb/react';
import { DailyBlog, Introduction, Task, Reflection } from "@/lib/types";
import IntroductionSection from '@/components/introduction';
import ReflectionSection from '@/components/reflection';
import TaskSection from '@/components/task';
import DateSelector from "@/components/dateSelector";

import 'quill/dist/quill.snow.css'; // Add css for snow theme
import { Button } from "@/components/ui/button";
import { getAllBlogs } from "@/lib/sqlConversion";
import { EditBlogDialog } from "@/components/editBlogDialog";
import { AnnotateBlogDialog } from "@/components/annotateBlogDialog";
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
		const newTaskId = id();
		db.transact([
			tx.task[newTaskId].update(emptyTask),
			tx.task[newTaskId].link({ dailyBlogs: selectedBlog.id })

		]);
		setActiveTask(newTaskId);
	}


	function deleteTask(task: { id: string; } & Task) {
		if (selectedBlog?.tasks && selectedBlog.tasks.length == 1) {
			// Pass if trying to delete the only Task
			console.log(`Cannot delete a task when it's the only task for a blog!`);
		} else {
			console.log(`Deleting task with id: ${task.id}`);
			// Delete a task indicated by the taskIndex. Calls merge with a null value
			db.transact([tx.task[task.id].delete()]);
			// Select the first task that wasn't the deleted one. Should trigger re-render
			selectedBlog!.tasks!.map((oldTask) => {
				if (oldTask.id !== task.id) {
					setActiveTask(oldTask.id);
					return;
				}
			});
		}

	}

	function createNewBlog(date: string) {
		const newId = id();
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
	}

	const selectedBlog: ({ id: string; } & DailyBlog) | undefined = useMemo(() => {

		const blog = dailyBlogs?.find((b) => b.date === selectedDate);
		console.log(`selectedBlog changing to: Day ${blog?.day_count} - ${blog?.date}`);
		return blog;
	}, [selectedDate, activeTask]);

	// iterate through dailyBlogs, finding the blog which has today's date (may not exist!). Set selectedBlog
	// Handle changes to selectedDate
	useEffect(() => {
		if (!selectedBlog && !isLoading && selectedDate) {
			createNewBlog(selectedDate);
		} else if (selectedBlog) {

			if (!selectedBlog.tasks || !selectedBlog!.tasks!.length) {
				addTask(selectedBlog);
			} else {
				const firstActiveTask = selectedBlog.tasks![0].id;
				setActiveTask(firstActiveTask);
			}
		}
	}, [selectedDate, selectedBlog, isLoading]);


	const handleDateChange = (newDate: string) => {
		console.log(`Handling date change! newDate: ${newDate}`);
		setSelectedDate(newDate);
	};

	const handleAddAnnotations = () => {
		// Logic to add Dave Annotations
		console.log('Adding Dave annotations...');
	};

	const handlePublishBlog = () => {
		// Logic to publish the blog
		console.log('Publishing blog...');
	};

	if (isLoading) {
		return <p>loading</p>;
	}

	return (
		<div className="bg-white p-4">
			<header className="flex flex-col justify-center items-center text-center mb-6">
				<h1 className="text-5xl font-bold">Daily Blog Builder</h1>
				<DateSelector dailyBlogs={dailyBlogs!} handleDateChange={handleDateChange} />
			</header>

			{selectedBlog && (

				<div>

					<section className="mb-8 rounded lg border border-gray-400 bg-blue-100 text-black p-4 mt-6">
						<h1 className="text-4xl font-bold text-black">{`Day ${selectedBlog?.day_count}: ${selectedBlog?.blog_title}`}</h1>
						<p className="mb-4">{`Date: ${selectedBlog?.date}`}</p>
						<p>{selectedBlog?.blog_description}</p>

					</section>

					<div className="bg-gray-100 p-4 rounded shadow-md flex items-center justify-left">
						<EditBlogDialog selectedBlogId={selectedBlog.id} activeTask={activeTask} setActiveTask={setActiveTask} />
						<AnnotateBlogDialog selectedBlogId={selectedBlog.id} activeTask={activeTask} setActiveTask={setActiveTask} />
						<Button onClick={handlePublishBlog} className="mx-2 bg-purple-400">
							Publish Blog
						</Button>
					</div>

					


					<section className="goals mb-8 bg-gray-200 shadow-md rounded-lg p-6">
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
						<ReflectionSection selectedBlog={selectedBlog!} db={db} tx={tx} />
					</section>
				</div>
			)}



		</div >
	);
}

function test_connection() {
	fetch("http://localhost:8080/api/home")  // Use http if it's not over SSL
		.then(response => {
			// Check if the response is successful
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();  // Parse JSON from the response
		})
		.then(data => {
			console.log(data.message);  // Log the message from the response
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});
}

function edit_blog() {
	fetch("https://localhost:8080/api/home");
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


