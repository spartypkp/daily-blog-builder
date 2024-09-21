// blogBuilder
// https://instantdb.com/dash?s=main&t=home&app=3b4a73a0-ffc6-488a-b883-550004ff6e0a

import { i } from "@instantdb/core";
import { Reflection, Introduction } from "@/lib/types";

// Example entities and links (you can delete these!)
const graph = i.graph(
	{
		dailyBlogs: i.entity({
			date: i.string().optional(),
			day_count: i.number().optional(),
			blog_title: i.string().optional(),
			blog_description: i.string().optional(),
			blog_tags: i.json().optional(),
			introduction: i.json<Introduction>().optional(),
			reflection: i.json<Reflection>().optional(),
			status: i.string().optional(),
			created_at: i.string().optional(),
			updated_at: i.string().optional(),
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
			time_spent_coding: i.number().optional(),
			time_spent_debugging: i.number().optional(),
			time_spent_researching: i.number().optional(),
			tools_used: i.string().optional(),
			task_created_at: i.string().optional(),
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
