import { createClient } from "./utils/supabase/client";
import { DailyBlog } from "./types";
import { init, tx, id } from '@instantdb/react';

const APP_ID = '3b4a73a0-ffc6-488a-b883-550004ff6e0a';

type Schema = {
	dailyBlogs: DailyBlog;
};

const db = init<Schema>({ appId: APP_ID });

export async function getAllBlogs() {
	const supabase = createClient();
	const { data, error } = await supabase.from("daily_blogs").select("*").order("day_count", { ascending: false }).returns<DailyBlog[]>();

	if (error) {
		console.log(`Error in getAllBlogs()`);
		console.log(error);
		return null;
	}
	data.map((blog) => {
		const newId = id();
		let empty_blog = {
			"id": newId,
			"date": blog.date,
			"blog_title": blog.blog_title,
			"blog_description": blog.blog_description,
			"created_at": blog.created_at,
			"day_count": blog.day_count,
			"status": null,
			"blog_tags": {},
			"introduction": blog.introduction!,
			"reflection": blog.reflection!

		};
		db.transact([
			tx.dailyBlogs[newId].update(empty_blog)]);

		const tasks = blog.tasks!;
		tasks.map((task) => {
			const newTaskId = id();
			db.transact([
				tx.task[newTaskId].update(task),
				tx.task[newTaskId].link({ dailyBlogs: newId })]);
		});
		console.log(tasks);
		// db.transact([
		// 	tx.dailyBlogs[id()].update(blog),


		// ]);

	}
	);
	console.log(data);
	return;

}