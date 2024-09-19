// blogBuilder
// https://instantdb.com/dash?s=main&t=home&app=3b4a73a0-ffc6-488a-b883-550004ff6e0a

import { i } from "@instantdb/core";
import { Reflection, Introduction } from "@/lib/types";
const INSTANT_APP_ID = "3b4a73a0-ffc6-488a-b883-550004ff6e0a";

// Example entities and links (you can delete these!)
const graph = i.graph(
	INSTANT_APP_ID,
	{
		dailyBlogs: i.entity({
			date: i.string().indexed(),
			day_count: i.number().indexed(),
			blog_title: i.string().optional(),
			blog_description: i.string().optional(),
			blog_tags: i.json().optional(),
			introduction: i.json<Introduction>().optional(),
			reflection: i.json<Reflection>().optional(),
			status: i.string().optional(),
			created_at: i.string(),
			updated_at: i.string(),
		}),
		task: i.entity({
			challenges_encountered: i.string().optional(),
			follow_up_tasks: i.string().optional(),
			output_or_result: i.string().optional(),
			reflection_failures: i.string().optional(),
			reflection_successes: i.string().optional(),
			research_questions: i.string().optional(),
			task_description: i.string().optional(),
			task_expected_difficulty: i.string().optional(),
			task_goal: i.string().optional(),
			task_name: i.string().optional(),
			task_planned_approach: i.string().optional(),
			task_progress_notes: i.string().optional(),
			task_reflection_summary: i.string().optional(),
			time_spent_coding: i.string().optional(),
			time_spent_debugging: i.string().optional(),
			time_spent_researching: i.string().optional(),
			tools_used: i.string().optional(),
			task_created_at: i.string(),
		})

	},
	{
		tasks: {
			forward: {
				on: 'dailyBlogs',
				has: 'many',
				label: 'tasks',
			},
			reverse: {
				on: 'task',
				has: 'one',
				label: 'dailyBlog',
			},
		}
	}

);


export default graph;
