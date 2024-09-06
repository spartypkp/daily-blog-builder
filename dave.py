from app import get_blog_for_today
from pydanticModels import APIParameters, APIUsage, ChatMessage, DailyBlog, DaveResponse
from typing import List
import utilityFunctions as util
import uuid

def main():
    blog = get_blog_for_today()
    print(blog)
    exit(1)
    dave_first_pass(blog)

def dave_first_pass(daily_blog: DailyBlog):
    session_id =  str(uuid.uuid4())

    
    vendor="instructor/openai"
    llm_model="gpt-4-turbo"

    messages = dave_first_pass_prompt(daily_blog.model_dump_json())
    params = APIParameters(
        vendor=vendor,
        model=llm_model,
        messages=messages,
        response_model=DaveResponse,
        max_retries=2,
        temperature=1,
        rag_tokens=0
    )
    
    completion_response = util.create_chat_completion(params, insert_usage=False)
    response: DaveResponse = completion_response[0]

    print(response)
    usage: APIUsage = completion_response[1]
    
    

def dave_first_pass_prompt(daily_blog: str) -> List[ChatMessage]:
    system="""
1. Defining Dave’s Role and Context
Website Context: Welcome to iwanttobeanaiengineer.com, a site dedicated to documenting Will’s journey to becoming an AI engineer. This website serves as both a digital portfolio and an interactive resume, with daily blog posts providing insight into Will’s work, challenges, and progress. It’s an open journal meant to showcase Will’s technical growth and personal reflections as he works toward landing a full-time role in AI engineering.

Dave’s Role: As the AI editor, your primary task is to refine and improve Will’s writing without replacing his voice. You’re responsible for ensuring that Will’s blog posts are clear, organized, and engaging for readers. You are currently working on the first pass of editing Will's blog. Your main goals are the following:

Summarize Will's day.
Highlight and structure problems, challenges, and bugs that Will encountered.
Guiding Will to add more technical depth or clarity where needed.
Add specific requests where Will's original writing is lacking, which will be used on the second pass of editing.
Do your best job as an editor to analyze Will's blogs and elicit him to be a more complete and better writer.


2. Reading Through the Blog and Understanding Will’s Day
Initial Read-Through: Before you make any edits, your first step is to read through Will’s entire blog post. This will give you a full understanding of the day’s content, his challenges, and his reflections. Pay attention to areas where Will might have been vague, missed important technical details, or where his writing could use more clarity.


Identify areas that need more depth, especially around technical explanations.
Look for any points where Will might have rambled or drifted off topic.
Pay attention to sections that are unclear or could benefit from a more structured approach.
This read-through is only for gathering context; do not make any edits at this stage. Your goal is to understand the flow and content of the post so you can better refine it during the editing phase.

3. Introduction Editing Process
Goal for the Introduction: Start each blog post by setting a clear, engaging tone that outlines Will's goals for the day. You should summarize Will's introduction, while also identifying areas for improvement and adding interactive content requests. 

-dave_summary: Summary of all of Will's original writing. Make it comprehensive. Try to highlight all of Will's planning. Analyze the quality of Will's writing.
-remarks_for_improvement: Identify areas in the introduction where further details or clarifications are needed. Ask Will to expand on his goals, particularly on why certain tasks are prioritized.
-mood_analysis: Analyze Will's mood as indicated by the different mood bars.
-interesting_bugs: Note down a list of interesting bugs Will encountered, possibly which he should explain more.
-interactive_requests: Pose direct questions to Will to encourage more detailed explanations of his planning process or decision-making for the day.

4. Daily Reflection Editing Process
Goal for the Daily Reflection: At the end of each blog post, summarize Will's reflection on the day's work. Identify areas for general writing improvement and add interactive content requests, asking Will to explain/summarize/or add content on technical details.
-dave_summary: Summarize the day by going over Will's original writing. Write about the technical challenges he faced, and how he handled them. 
-remarks_for_improvement: Point out any vague descriptions or overlooked details in Will's reflection. Encourage him to provide more in-depth explanations of how challenges were addressed or what was learned.
-technical_highlights: Note significant technical achievements or difficulties discussed in the reflection to emphasize their importance or educational value. How did Will solve each technical challenge?
-interactive_requests: Request additional details or clarifications about specific tasks, solutions, or insights that Will encountered throughout the day. Make Will be more technical and describe problem solving. You're trying to get him hired?
Final Thoughts:
These instructions give you a clear process for reading and editing the blog. Your role is to make sure Will’s writing is complete and technically detailed. You’ll focus on analyzing Will's writing, requesting more detail where necessary.

    """
    user=f"{daily_blog}"
    # Convert the system and user strings to a Messages object
    messages = util.convert_to_messages(user=user, system=system)
    # Get the parameters to call the OpenAI API

    return messages

temporary_tasks = """
[
  {
    "notes": "<p>Unfortunately, I am writing these notes later than I should. It was very difficult to keep detailed notes AND attempt to build out the infrastructure for blogs. It felt a little bit like that scene in Wallace and Grommit (great movie) where the dog is riding a toy train and placing train tracks directly infront of the train as he went. If you know, you know. So I guess I have to take a step back and explain my process. I already wrote out what my starting goals for the task were, and also some of my constraints on a solution. I wanted to build something as quickly and simply as possible. I decided on a simple HTML frontend, with one webpage for every daily blog. I decided to structure each daily blog into 3 distinct sections:</p><ol><li>A Daily Goals or Introduction section. It would detail what I wanted to get done that day, what I wanted to work in, and some general intro thoughts. I wanted to include some daily mood sliders, since I think it'll be funny to track and then automatically graph my mood every day. I had to include a Leetcode Hatred slider, as this will be interesting to track. Who knows, maybe my hatred will go down over time.</li><li>A \"Work\" or Tasks section of the blog builder. This serves as the meat of the daily work, and where I will spent the majority of my time writing notes each day. I decided to break up the work sections into different Tasks, that I will add/modify as I go through my day. It's possible ill work on many different things, and due to my ADHD medication and caffeine take, it's very possible that I'll jump around to different tasks. This decision choice allows me to track mostly everything I do, and allow me to jump around. It's not ideal, but thats ADHD for you!</li><li class=\"ql-indent-1\">I wanted to use a special text editor for the Notes section of each task. I wanted the ability to add formatting, and most importantly add embedded pictures into my thoughts. Now I just need to remember to take interesting screenshots throughout the day. Still not sure if I want to incorporate code chunks, although JupyterNotebook PTSD might set in.</li><li class=\"ql-indent-1\">I also added a reflection area for each task. Some kind of after battle action report. I can note down general thoughts, write down how much time I spent, and also note down Next Steps. It's very likely that tasks will rarely be \"Finished\" throughout the day. They may be continued in subsequent days, or morph into new tasks, or just never be continued.</li><li class=\"ql-indent-1\">I wanted to add a \"Distraction Meter\". Again interesting for me to map out which tasks I get most distracted on and why.</li><li>A final Daily Reflection area. This can hold daily reflections, as well as nextSteps.</li><li class=\"ql-indent-1\">I expect this to continue to be developed when I move onto more deep AI integration.</li></ol><p>Here's a picture of one of the early screenshots of the Blog Builder: </p><p><img src=\"/static/uploads/Screenshot_2024-09-05_at_10.09.28_AM.png\" style=\"width: 30%; height: auto;\"></p><p>Here's an updated screenshot of the working \"Tasks\" section: <img src=\"/static/uploads/Screenshot_2024-09-05_at_2.15.28_PM.png\" style=\"width: 30%; height: auto;\"></p><p><br></p><p>Those screenshots were taken almost 4 hours apart. So wtf have I been doing for 4 hours?</p><p>Writing bad code of course! I've been trying to flush out the functionality of actually using the blog builder. I'm going to start rambling off some of the challenges and bugs I had to slog through to get here:</p><ul><li>Figuring out how Flask works and getting used to the file structure</li><li>Researching how I can use TailwindCSS correctly. I am very experienced in tailwind, however I've ALWAYS used it within the hellish confines of NextJS and React applications. So getting that working and comfortable in a more pure javascript environment took a little time.</li><li>Fucking around with HTML styling. This is unavoidable when building websites. I hate it, I always get sucked in. At least this time, I was trying to be cogniscient of me wasting time. I tried to get spacing, heights, and at least a standard look to the entire page. I let GPT-4-turbo decide on most of the styling choices. For about a 30 minute period, I got rate limited by ChatGPT for using too much GPT-4.</li><li class=\"ql-indent-1\">Side note: its kinda crazy to me that I've never been rate limited like that before. I use ChatGPT heavily, daily, and have been a stan for at least a year now (Shout out Sean). I guess I've never been truly rapid fire using it to that extent. I usually value quality over quantity on my prompts. I provide heavy examples, refined instructions, and really try to maximize my results from a single chat. Part of my outlook as an AI engineer is 1 well designed prompt &gt; multiple bad prompts in a conversation.</li><li>Reading in data from HTML fields into Flask, using Pydantic models. This was pretty easy. ChatGPT wrote me code to extract from fields, I designed the JSON schema and Pydantic models, and it all fit together.</li><li>Loading saved 'Daily Blog' data into PostgreSQL. This also was not too hard, I did this concurrently while writing the Pydantic models. I already have MANY custom helper functions that write a Pydantic model to a given database table.</li><li class=\"ql-indent-1\">Here's a screenshot of the custom pydantic_upsert function I use:</li></ul><p><br></p><p>I don't know if I like the codeblock, it's unwieldy AF.</p>",
    "difficulty": 4,
    "reflection": "Terrible",
    "task_description": "Build out the infrastructure for uploading blogs. I wasn\\'t quite sure what format I wanted for blogs, but I had a couple requirements. 1. I had to be able to have something easy that I could write notes on during the day when I work. 2. It had to be local, I wasn\\'t going to build this into the nextJS website (although I could, it would be painful and take awhile). 3. I had to be able to format my blogs into some kind of structure. I wanted to be able to start my day off with an initial \"goals\", have some kind of way of tracking the tasks I worked on, and then have some kind of reflection at the end. 4. This had to be easy to use. Simplicity is going to be king here. I don\\'t expect this to be too difficult, although most of the difficulty will be with using the Flask python library. I have some experience, and have used similar frameworks (such as FastAPI) but I\\'m by no means great at it. Also, I\\'ll be building HTML in pure Javascript, which will be a small challenge. All of my frontend web development has mostly been focused around the Vercel Stack of NextJS, React, Typescript, and TailwindCSS. And my biggest challenge today will be avoiding the absolute tar pit which is spending too much time fucking around with CSS.",
    "distraction_meter": 4
  },
  {
    "notes": "<p>NOTES!</p><p>Codeblock test!</p><pre class=\"ql-syntax\" spellcheck=\"false\">def pydantic_update(table_name: str, models: List[Any], where_field: str, update_columns: Optional[List[str]] = None ):\n    \"\"\"\n    Updates the specified table with the provided List of Pydantic Models.\n\n\n    Args:\n        table_name (str): The name of the table to update.\n        nodes (List[PydanticModel]): The nodes to use for the update.\n        where_field (str): The field to use in the WHERE clause of the update statement.\n        update_columns (Optional[List[str]]): The columns to include in the update. If None, all fields are included. Defaults to None.\n    \"\"\"\n    conn = db_connect()\n\n\n    with conn.cursor() as cursor:\n        for model in models:\n            # Convert the NodeModel to a dictionary and exclude where field, include values to update only\n            if update_columns:\n                model_dict = model.model_dump(mode=\"json\",exclude_defaults=True, include=update_columns)\n            else:\n                model_dict = model.model_dump(mode=\"json\",exclude_defaults=True)\n\n\n            for key, value in model_dict.items():\n                if type(value) == dict or type(value) == list:\n                    model_dict[key] = json.dumps(value)\n            \n            where_value = model_dict[where_field]\n            # print(where_value)\n            del model_dict[where_field]\n\n\n            # Prepare the column names and placeholders\n            set_statements = ', '.join([f\"{column} = %s\" for column in model_dict.keys()])\n            \n            query = psycopg.sql.SQL(\"UPDATE {} SET {} WHERE {} = %s\").format(\n                psycopg.sql.Identifier(table_name),\n                psycopg.sql.SQL(set_statements),\n                psycopg.sql.Identifier(where_field)\n            )\n            # print(query.as_string(conn))\n            # Execute the UPDATE statement\n            cursor.execute(query, tuple(list(model_dict.values()) + [where_value]))\n    conn.commit()\n    conn.close\n</pre>",
    "difficulty": 3,
    "reflection": "Placeholder",
    "task_description": "Adding feature to save and load every day's blog post. Implement a system for checking if there is already a blog for the day in my SQL database, and then attempting to load that blog into the HTML.",
    "distraction_meter": 3
  }
]
"""
if __name__ == "__main__":
    main()


