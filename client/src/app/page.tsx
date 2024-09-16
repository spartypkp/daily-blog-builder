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


// ID for app: Instant Tutorial Todo App
const APP_ID = '3b4a73a0-ffc6-488a-b883-550004ff6e0a';

type Schema = {
	dailyBlogs: DailyBlog;
};

const db = init<Schema>({ appId: APP_ID });


function App() {
	// Read Data
	const { isLoading, error, data } = db.useQuery({ dailyBlogs: {} });
	if (isLoading) {
		return <div>Fetching data...</div>;
	}
	if (error) {
		return <div>Error fetching data: {error.message}</div>;
	}
	const { dailyBlogs } = data;
	const [selectedBlog, setSelectedBlog] = useState<DailyBlog>();
	const [selectedDate, setSelectedDate] = useState();

	return (
		<body className="bg-white p-4">
			<header className="text-center mb-6">
				<h1 className="text-5xl font-bold">Daily Blog Builder</h1>
				<Select>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={selectedBlog?.date.toString()} />
					</SelectTrigger>
					<SelectContent>
						{dailyBlogs.map((blog) => (
							// The key should be here, on the first element inside the map
							<SelectItem value={blog.date.toString()}>{blog.date.toString()}</SelectItem>
						))}

						<SelectItem value="dark">Dark</SelectItem>
						<SelectItem value="system">System</SelectItem>
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
				<IntroductionSection intro={selectedBlog?.introduction!} updateSliderColor={updateSliderColor} />

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
				<ReflectionSection reflection={selectedBlog?.reflection!} updateSliderColor={updateSliderColor} />
			</section>



			<footer className="text-center">
				<button type="button" onClick={(e) => edit_blog()}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Edit Blog</button>
				<button type="button" onClick={(e) => publish_blog()}
					className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Publish Blog</button>
			</footer>
		</body >
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
export default App;