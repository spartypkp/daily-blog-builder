'use client';

import { useState, useEffect } from "react";
import { init, tx, id } from '@instantdb/react';
import { DailyBlog, Introduction, Task, Reflection } from "@/lib/types";
import IntroductionSection from '@/components/introduction';
import ReflectionSection from '@/components/reflection';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useQuill } from 'react-quilljs';
// or const { useQuill } = require('react-quilljs');

import 'quill/dist/quill.snow.css'; // Add css for snow theme

// ID for app: Instant Tutorial Todo App
const APP_ID = '3b4a73a0-ffc6-488a-b883-550004ff6e0a';

type Schema = {
	dailyBlogs: DailyBlog;
};

const db = init<Schema>({ appId: APP_ID });


function App() {
	const today = (new Date).toISOString().slice(0, 10);
	const [selectedDate, setSelectedDate] = useState<string>(today);
	const { quill, quillRef } = useQuill();

	useEffect(() => {
		if (quill) {
		  quill.on('text-change', (delta, oldDelta, source) => {
			console.log('Text change!');
			console.log(quill.getText()); // Get text only
			console.log(quill.getContents()); // Get delta contents
			console.log(quill.root.innerHTML); // Get innerHTML using quill
			console.log(quillRef.current.firstChild.innerHTML); // Get innerHTML using quillRef
		  });
		}
	  }, [quill]);
	
	// Read Data
	const query = {
		dailyBlogs: {
			$: {
				where: {
					date: today,
				},
			},
		},
	};
	const { isLoading, error, data } = db.useQuery(query);

	if (isLoading) {
		console.log("loading!")
		return <div>Fetching data...</div>;
	}
	if (error) {

		return <div>Error!</div>
	}
	
	const { dailyBlogs } = data;
	
	
	let selectedBlog = dailyBlogs[0]

	if (!selectedBlog) {
		const newId: string = id()
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
		let empty_blog = {
			"id": newId,
			"date": today,
			"blog_title": "",
			"blog_description": "",
			"created_at": (new Date).toDateString(),
			"day_count": calculateDayCount(),
			"status": null,
			"blog_tags": {},
			"tasks": [emptyTask]

		}
		
		db.transact([tx.dailyBlogs[newId].update(empty_blog
			)
		]);

		
		selectedBlog = empty_blog;
	}
	
	console.log(selectedBlog)
    

	// useEffect(() => {
	// 	// Set the selected date to today's date if not already set
	// 	if (!selectedDate) {
	// 		const today = new Date().toISOString().slice(0, 10);
	// 		setSelectedDate(today);
	// 	} else {
	// 		// Find the blog with a matching date
	// 		const blog = dailyBlogs.find(blog => blog.date.toString() === selectedDate);
	// 		if (!blog) {
	// 			// If found, set it as the selected blog
	// 			const newBlog = createEmptyDailyBlog();
	// 			db.transact([tx.dailyBlogs[id()].update({ "introduction": newBlog.introduction!, "tasks": newBlog.tasks, "reflection": newBlog.reflection! })]);
	// 			console.error('No blog found for the selected date');
	// 		}
	// 	}
	// }, [selectedDate]);

	return (
		<div className="bg-white p-4">
			<header className="text-center mb-6 justify-center items-center">
				<h1 className="text-5xl font-bold">Daily Blog Builder</h1>
				<Select >
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Choose a date" />
					</SelectTrigger>
					<SelectContent>
						
							<SelectItem value={selectedDate}>{selectedDate}</SelectItem>

						
					</SelectContent>
				</Select>

				<select id="blogDateSelector" onChange={(e) => fetchBlogData(e.target.value)}>

				</select>
				<div className="mt-4 bg-white rounded-lg p-4">
					<h2 className="text-3xl font-bold text-gray-800 text-center">Day Number</h2>
					<p id="day_count" className="text-m  text-gray-800 text-center"></p>
					<h2 className="text-3xl font-bold text-gray-800 text-center">Blog Title</h2>
					<p id="blog_title" className="text-m  text-gray-800 text-center"></p>
					<h2 className="text-3xl font-bold text-gray-800 text-center">Blog Description</h2>
					<p id="blog_description" className="text-m  text-gray-800 text-center"></p>

				</div>


			</header>

			<section className="goals mb-8 bg-gray-200 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center">

				</div>
				<IntroductionSection id={selectedBlog.id} updateSliderColor={updateSliderColor} />

			</section>

			<section className="tasks mb-8 bg-gray-200 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center">

				</div>
				<div id="daily-tasks" className="mx-auto hidden">
					<div id="tabs-container" className="tabs-container flex justify-center mb-2 border-b border-gray-300">

					</div>
					<div className="text-center">
						<button type="button" onClick={(e) => add_task()}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150">+
							Add Task</button>
					</div>
					<div className="tab-content mt-4" id="tabContent">

					</div>
				</div>
			</section>


			<section className="reflection mb-8 bg-gray-200 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center">

				</div>
				<ReflectionSection id={selectedBlog.id} updateSliderColor={updateSliderColor} />
			</section>



			<footer className="text-center">
				<button type="button" onClick={(e) => edit_blog()}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Edit Blog</button>
				<button type="button" onClick={(e) => publish_blog()}
					className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Publish Blog</button>
			</footer>
		</div >
	);
}

function edit_blog() {
	return;
}
function fetchBlogData(date: string) {
	return;
}
function updateSliderColor(field_name: string): string {
	return "";
}
function add_task() {
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
export const createEmptyDailyBlog = (today: string): DailyBlog => {
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

	const emptyIntroduction: Introduction = {
		personal_context: '',
		daily_goals: '',
		learning_focus: '',
		challenges: '',
		plan_of_action: '',
		focus_level: 50,
		enthusiasm_level: 50,
		burnout_level: 50,
		leetcode_hatred_level: 50,
		introduction_summary: ''
	};

	const emptyReflection: Reflection = {
		learning_outcomes: '',
		next_steps_short_term: '',
		next_steps_long_term: '',
		productivity_level: 50,
		distraction_level: 50,
		desire_to_play_steam_games_level: 50,
		overall_frustration_level: 50,
		entire_blog_summary: '',
		technical_challenges: '',
		interesting_bugs: '',
		unanswered_questions: ''
	};

	return {
		date: today,
		day_count: calculateDayCount(),
		blog_title: '',
		blog_description: '',
		blog_tags: [],
		introduction: emptyIntroduction,
		tasks: [emptyTask],
		reflection: emptyReflection,
		status: ''
	};
};
export default App;