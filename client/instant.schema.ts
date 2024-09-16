// blogBuilder
// https://instantdb.com/dash?s=main&t=home&app=3b4a73a0-ffc6-488a-b883-550004ff6e0a

import { i } from "@instantdb/core";

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
			introduction: i.json().optional(),
			tasks: i.json().optional(),
			reflection: i.json().optional(),
			status: i.string().optional(),
			created_at: i.string(),
			updated_at: i.string(),
		}),
		
	},
	{}
  
);


export default graph;
