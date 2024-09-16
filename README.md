# Blog Builder

## Overview
Daily-blog-builder was developed as a simple tool to help structure and write daily blogs. These daily blogs are intended to be equal parts technical documentation, daily progress reports for people working towards a greater goal, and a method for self reflection and improvement. The blog-builder tool is a completely local Flask application optimized for one thing: ease of use. I personally struggle with writing and documenting my progress, and developed this tool to help me overcome my fear of putting myself out there. The AI tool not only streamlines writing, but provides functionality for an AI editor to improve your writing.

The AI Editor will:
1. Summarize your writing in each major section, providing humorous introductions/teasers for the day.
2. Extract structured data from technical documentation, such as "Tools Used", "Challenges Encountered", "Unanswered Questions", and "Interesting Bugs".
3. Help you stay motivated and on your goals by helping you reflect on the day. It can analyze your successes and failures, providing support and honest feedback.
4. Add humor to the structured daily blog. The AI Editor has been prompted to provide a contrast to deeply technical work, by adopting a personality of a skeptical and seasoned editor. Honestly, I'm surprised by some of the humor it's capable of.
5. Generate custom React components, which are intended to be rendered on the NextJS frontend. These components are intended to annotate original writing with humor and content, helping to break up long parts of writing.
6. Automatically edit and publish your blogs.

## Features
Some of the key features of the blog include:
- Rich text editing using Quill.js
- AI-assisted content refinement
- Automatic storage and management of daily blogs in Postgres and Supabase Storage for embedded images.
- Export functionality to the main website, including AI annotations and additions.
- Help you be more consistent in achieving your goals.

## Getting Started

### Prerequisites
PostgresSQL is necessary. I recommend using Supabase free tier.
Create a table using the following SQL:
```sql
create table
  daily_blogs (
    date date not null,
    introduction jsonb null,
    tasks jsonb null,
    reflection jsonb null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    status text null,
    day_count integer null,
    blog_title text null,
    blog_description text null,
    blog_tags jsonb null,
    constraint daily_blogs_pkey primary key (date)
  );
```
Create a public storage bucket called "daily-blogs".
Fill in the .env file with necessary values:
POSTGRES_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
OPENAI_API_KEY=

Edit the prompts as needed, in order to change the personality of the AI Editor. (Unless you want the AI to call you Will for some reason)
