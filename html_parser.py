from bs4 import BeautifulSoup, Tag
from typing import List
import json
from pydanticModels import APIParameters, APIUsage, ChatMessage, DailyBlog, Introduction, Reflection, Task, IntroductionContent, TaskContent, ReflectionContent, TaskDataContent
from typing import List
import utilityFunctions as util
import uuid

import os
DIR = os.path.dirname(os.path.realpath(__file__))

def main():
    task_progress_notes="""<p>My day started out by thinking about a list of requirements for the blog builder. I already detailed these requirements in the daily goals. I jumped right into research with ChatGPT, my favorite partner programming rubber ducky. After discussing with ChatGPT, it became clear that Flask would probably be the best choice. It would allow me the most flexibility and speed to MVP. I wanted something simple, and this would do the trick. I can use Python for my entire backend, while also using Pydantic models to pass data in a more structured way. I already extensively use Pydantic when interacting with SQL tables, and imported some of my common used functions. The function I show below is a simple generic python function for writing a select query on a given table, and returning all results as a List of pydantic models. Provide the table name, and the Pydantic type you want returned, and bam it works. It is considered bad practice to use Python f string formatting to inject the table name directly, however I don't care. I will always be manually specifying the table name, which is never derived from user input. I have some experimental versions of this function which use more safe Psycopg3 parameterized inputs, but that's still in development. I currently have separate functions for all the main SQL query types. In the future, I hope to finish my work on developing a generic function and library for interacting with SQL purely through Pydantic Models (which can be auto generated!). This will likely be a future blog post, so stick around!</p><pre class=\"ql-syntax\" spellcheck=\"false\">def pydantic_select(sql_select: str, modelType: Type[BaseModel]) -&gt; List[Any]:\n    \"\"\"\n    Executes a SQL SELECT statement and returns the result rows as a list of Pydantic models.\n\n\n    Args:\n        sql_select (str): The SQL SELECT statement to execute.\n        modelType (Optional[Any]): The Pydantic model to use for the row factory\n\n\n    Returns:\n        List[Any]: The rows returned by the SELECT statement as a list of Pydantic Models.\n    \"\"\"   \n    # Use the provided modelType (PydanticModel) for the row factory\n    if modelType:\n        conn = db_connect(row_factory=class_row(modelType))\n    \n\n\n    cur = conn.cursor()\n\n\n    # Execute the SELECT statement\n    cur.execute(sql_select)\n\n\n    # Fetch all rows\n    rows = cur.fetchall()\n    \n\n\n    # Close the cursor and the connection\n    cur.close()\n    conn.close()\n\n\n    return rows\n</pre><p><br></p><p>As I was looking for that pydantic_select function, I realized I have the same function defined in 10 different repositories. Some are slightly different, with slight enhancements and changes I've made throuhgout my Pydantic journey. I really need to go back and standardize. I think I need a better system for versioning across repos. Putting a mental note to be a smarter software engineer and find a solution for that.</p><p><br></p><p>The next step is of course to design the schema and structure of a daily blog post. I need to decide on what information I need to capture each day in all my blogs. How do I want to go about designing this? I started this process by deciding to split a given single blog post into 3 separate sections. There's an introduction, which occurs at the beginning of each day, and contains information about my goals, description of the problem, plan of attack, and some other fun mood sliders. The last section is the reflection, where I can reflect on the progress of the day and how i did or did not achieve my goals. I struggled to come up with a solid idea for tracking my work during the bulk of the day, where I'm working on different projects and tasks for different amount of time. I could be working on scraping legislation, practicing leetcode, working my part time AI Engineer consulting job, or building numerous different side projects. I needed something flexible that allowed me to track multiple different unique tasks throughout the day. I decided on building a dynamic task system, where I could track progress for 1 to N number of tasks I complete during the day. How I break up my goals into tasks will be left completely up to me (for now, maybe I'll integrate Dave to help me later). Each task has information on the task, description, and tracks some important information like \"Challenges Encountered\" and \"Research Questions\".</p><p><br></p><p>The first step to implementing my blog schema is to structure my thoughts into you guessed it, a Pydantic model! And because I love Pydantic and Postgres so much, I can concurrently create the schema for my backend data and my database. I map Pydantic models directly into PostgreSQL table schemas. The trick is to use JSONB for complex nested fields, which the corresponding Pydantic model represents as another Pydantic model! This allows for rapid iteration of design. As long as I get some of the key metadata fields right, I can effortlessly update how I structure and store data without ever having to worry about updating SQL schema. This can be incredibly important when doing rapid prompt engineering. In this case, I've developed Pydantic models for the \"Introduction\", \"Tasks\", and \"Reflection\" sections of each Daily Blog. Those are represented as JSONB in SQL, and have their own submodels in Python. Here's the code!</p><pre class=\"ql-syntax\" spellcheck=\"false\"># Submodel for Task\nclass Task(BaseModel):\n    # Task Start - filled out at start of task\n    task_goal: Optional[str] = Field(\"\", description=\"Desired outcome or goal for the task.\")\n    task_description: Optional[str] = Field(\"\", description=\"Description of the task or problem.\")\n    task_expected_difficulty: Optional[int] = Field(50, description=\"Focus level (0-100).\", ge=0, le=100)\n    task_planned_approach: Optional[str] = Field(\"\", description=\"Method or strategy Will plans to use to tackle the problem.\")\n\n\n    # Task Work - Ongoing throughout day\n    task_progress_notes: Optional[str] = Field(\"\", description=\"Main writing area for Will to document  his progress.\")\n    challenges_encountered: Optional[str] = Field(\"\", description=\"Key challenges or bugs encountered.\")\n    research_questions: Optional[str] = Field(\"\", description=\"An always updated list of research questions Will had while working on the task\")\n    \n    # Task Reflection - filled out after task completion\n    tools_used: Optional[str] = Field(\"\", description=\"Key tools, libraries, or frameworks used during the task.\")\n    reflection_successes: Optional[str] = Field(\"\", description=\"What worked well during the task?\")\n    reflection_failures: Optional[str] = Field(\"\", description=\"What didn't work, and why?\")\n    output_or_result: Optional[str] = Field(\"\", description=\"The outcome or deliverable from this task (e.g., code, documentation).\")\n    time_spent_coding: Optional[str] = Field(\"\", description=\"Time spent actively coding (e.g., '2 hours').\")\n    time_spent_researching: Optional[str] = Field(\"\", description=\"Time spent researching (e.g., '30 minutes').\")\n    time_spent_debugging: Optional[str] = Field(\"\", description=\"Time spent debugging (e.g., '45 minutes').\")\n    follow_up_tasks: Optional[str] = Field(\"\", description=\"Immediate next steps or follow-up tasks.\")\n\n\nclass Introduction(BaseModel):\n    personal_context: Optional[str] = Field(\"\", description=\"Additional context for the day (e.g., external factors).\")\n    daily_goals: Optional[str] = Field(\"\", description=\"Main tasks or goals for the day.\")\n    learning_focus: Optional[str] = Field(\"\", description=\"What Will wants to learn or improve on today.\")\n    challenges: Optional[str] = Field(\"\", description=\"Known challenges or experiments for the day.\")\n    plan_of_action: Optional[str] = Field(\"\", description=\"Will's initial plan for tackling the daily_goals and challenges today.\")\n\n\n    focus_level: Optional[int] = Field(50, description=\"Focus level (0-100).\", ge=0, le=100)\n    enthusiasm_level: Optional[int] = Field(50, description=\"Enthusiasm meter (0-100).\", ge=0, le=100)\n    burnout_level: Optional[int] = Field(50, description=\"Burnout meter (0-100).\", ge=0, le=100)\n    leetcode_hatred_level: Optional[int] = Field(99, description=\"LeetCode hatred meter (0-100).\", ge=0, le=100)\n    \nclass Reflection(BaseModel):\n    technical_challenges: Optional[str] = Field(\"\", description=\"Notable technical challenges or obstacles faced.\")\n    interesting_bugs: Optional[str] = Field(\"\", description=\"Details of any interesting bugs encountered.\")\n    unanswered_questions: Optional[str] = Field(\"\", description=\"Unanswered technical questions or topics for further research.\")\n    learning_outcomes: Optional[str] = Field(\"\", description=\"Key takeaways and things learned during the day.\")\n    next_steps_short_term: Optional[str] = Field(\"\", description=\"Immediate next steps or tasks for tomorrow.\")\n    next_steps_long_term: Optional[str] = Field(\"\", description=\"Long-term goals or ongoing technical objectives.\")\n    \n    # Humorous &amp; Self-Reflective Mood Sliders\n    productivity_level: Optional[int] = Field(50, description=\"Self-evaluation: Productivity (0-100).\", ge=0, le=100)\n    distraction_level: Optional[int] = Field(50, description=\"Self-evaluation: How Distracted were you (0-100).\", ge=0, le=100)\n    desire_to_play_steam_games_level: Optional[int] = Field(50, description=\"Desire to play Steam games (0-100). It's always Europa Universalis IV\", ge=0, le=100)\n    overall_frustration_level: Optional[int] = Field(50, description=\"Frustration level (0-100).\", ge=0, le=100)\n\n\n# Main model for the Daily Blog\nclass DailyBlog(BaseModel):\n    date: datetime.date = Field(..., description=\"Date of the blog entry.\")\n    introduction: Optional[Introduction] = Field(default=Introduction(), description=\"The introduction to Will's daily blog.\")\n    tasks: List[Task] = Field(default_factory=lambda: [Task()], description=\"List of technical tasks Will completed for the day.\")\n    reflection: Optional[Reflection] = Field(default=Reflection(), description=\"The reflection portion of Will's daily blog\")\n    created_at: Optional[datetime.datetime] = Field(default=None, description=\"Timestamp for when the blog was created.\")\n    updated_at: Optional[datetime.datetime] = Field(default=None, description=\"Timestamp for the last update.\")\n</pre><p>I really enjoy using the Field() feature of Pydantic, which allows me to set default values and add extensive descriptions, as well as constraints for improved automatic value validation. Also, I hope you see how I avoid using camelCase like the plague. I want the name of my Pydantic model fields to EXACTLY match the SQL column names. Now this naming, doesn't technically matter for submodels, which will be thrown into JSONB, but I like to be consistent. Speaking of JSONB, here's the SQL schema for the daily_blogs table!</p><p><br></p><pre class=\"ql-syntax\" spellcheck=\"false\">CREATE TABLE daily_blogs (\n\n&nbsp; &nbsp; date date PRIMARY KEY,\n\n&nbsp; &nbsp; introduction jsonb,\n\n&nbsp; &nbsp; tasks jsonb,\n\n&nbsp; &nbsp; reflection jsonb,\n\n&nbsp; &nbsp; created_at timestamp with time zone DEFAULT now(),\n\n&nbsp; &nbsp; updated_at timestamp with time zone DEFAULT now()\n\n);\n</pre><p>Shout out Postico, the best investment I ever made. As you can see, this table is brutally simple. I like to keep complex design and typing within the backend and out of the database. JSONB is great because it allows for incredible flexiblity in rapid iteration of schema, and I can still create complex SQL queries which access underlying data within JSONB columns. To my naive junior software development mind, this is an acceptable tradeoff. I love it.</p><p><br></p><p>I now need to set up my backend, super simple at first. I'm using Flask, and only need a couple of main routes.</p><p>My file system structure is stupid simple, and took me and ChatGPT about 5 minutes to setup.</p><p><img src=\"/static/uploads/Screenshot_2024-09-06_at_1.17.11_PM.png\" style=\"width: 30%; height: auto;\"></p><p><br></p><p>I've got a super simple setup here. I've got a home route, which gets the current blog for the day or creates an empty one, and then renders the home page with it.</p><ul><li>/api/today_blog route offers up the daily blog. It's useful because my Javascript function will ask for the daily blog to populate all of the daily tasks dynamically. I'm just now noticing it has a /api/ in the route. Bad ChatGPT, that's completely unnecessary.</li><li>/submit_blog reads in the values of all my forms and text areas for a daily blog, loads it into a Pydantic model, and then saves it to Postgres. Simple.</li><li>/upload_image is a route that handles the saving of image uploads into the repository. This is necessary to override the default functionality of Quill, a rich text editor for Javascript.</li></ul><p>Next it was necessary to start working on the frontend. To be honest, I worked simultaneously on the frontend as I was building out some of the functionality of the API routes. But for easier understanding, I'm talking about these two separately. First step was to start building out the frontend. I started by prompting ChatGPT to develop 3 distinct sections of content in the body, as well as set up Tailwind and the rest of the HTML document. There are 3 distinct sections corresponding to the Pydantic Model: introduction, tasks, and of course reflection. Here's an image of a VERY early version of the frontend.</p><p><img src=\"/static/uploads/Screenshot_2024-09-05_at_10.09.28_AM.png\" style=\"width: 30%; height: auto;\"></p><p><br></p><p>After some iteration, I was able to fully flesh out the correct input areas for ALL of the fields of the Pydantic model. I was very careful to make the ID of each input element the exact field name of the Pydantic model, to allow for super easy access. Smort. To be completely honest, this is the point where a lot of design iteration happened. I redesigned my Pydantic model a lot. I added new fields. I tested out new HTML. At this point I even started to write a partial blog. However, this blog eventually had to be overwritten, as I made simply too much radical changes to the Pydantic model schema and SQL table, and opted to simply restart. So if you feel as if I'm extra omnitient in this blog, that's why! I really do want to focus on writing the blogs more as I go, but I'll cut myself some slack as this is my first blog. Also, it's very difficult to use a tool which you are in the process of developing. So cut me some slack Dave. Here's a finalized version of the current introduction section, filled with text I am currently writing for the blog.</p><p><img src=\"/static/uploads/Screenshot_2024-09-06_at_1.37.40_PM.png\" style=\"width: 30%; height: auto;\"></p><p>My next step was to connect my frontend with my backend. I needed to write a bunch of different scripts, which would handle data loading between my backend. Possibly the most important function is the initializeBlog() function. This function takes in a Pydantic model of the blog data, dumped to JSON, and uses it to set the html of all my data input HTML elements. Simple, but works. And because I made the id of each element to map directly to my Pydantic model field names, it's super clean and easy. After adding all of the introduction and reflection sections, I have to iterate over all of the possible daily tasks and generate those separately. Onward!</p><p><br></p><pre class=\"ql-syntax\" spellcheck=\"false\">let currentTaskId = 0; // Start from 1 because the initial task is already there\n\n\nfunction initializeBlog(blogData) {\n    \n    // Set the values for Introduction section fields\n    if (blogData.introduction) {\n        document.getElementById('daily_goals').value = blogData.introduction.daily_goals || '';\n        document.getElementById('learning_focus').value = blogData.introduction.learning_focus || '';\n        document.getElementById('challenges').value = blogData.introduction.challenges || '';\n        document.getElementById('plan_of_action').value = blogData.introduction.plan_of_action || '';\n        document.getElementById('personal_context').value = blogData.introduction.personal_context || '';\n\n\n        // Set the mood sliders\n        document.getElementById('enthusiasm_level').value = blogData.introduction.enthusiasm_level || 50;\n        document.getElementById('burnout_level').value = blogData.introduction.burnout_level || 50;\n        document.getElementById('focus_level').value = blogData.introduction.focus_level || 50;\n        document.getElementById('leetcode_hatred_level').value = blogData.introduction.leetcode_hatred_level || 50;\n    }\n\n\n    // Set the values for Reflection section fields\n    if (blogData.reflection) {\n        document.getElementById('technical_challenges').value = blogData.reflection.technical_challenges || '';\n        document.getElementById('interesting_bugs').value = blogData.reflection.interesting_bugs || '';\n        document.getElementById('unanswered_questions').value = blogData.reflection.unanswered_questions || '';\n        document.getElementById('learning_outcomes').value = blogData.reflection.learning_outcomes || '';\n        document.getElementById('next_steps_short_term').value = blogData.reflection.next_steps_short_term || '';\n        document.getElementById('next_steps_long_term').value = blogData.reflection.next_steps_long_term || '';\n\n\n        // Set the self-reflective mood sliders\n        document.getElementById('productivity_level').value = blogData.reflection.productivity_level || 50;\n        document.getElementById('distraction_level').value = blogData.reflection.distraction_level || 50;\n        document.getElementById('desire_to_play_steam_games_level').value = blogData.reflection.desire_to_play_steam_games_level || 50;\n        document.getElementById('overall_frustration_level').value = blogData.reflection.overall_frustration_level || 50;\n    }\n    console.log(`Blog Data: ${JSON.stringify(blogData, null, 2)}`)\n    // Add a new task for however many tasks there are\n    for (let i = 0; i &lt; blogData.tasks.length; i++) {\n        addTask(blogData.tasks[i]); // Add additional tasks\n    }\n    \n    selectTab(1); // Ensure this is called after the DOM is fully loaded\n    \n}\n\n\n\n// Fetch today's blog data using AJAX\ndocument.addEventListener('DOMContentLoaded', function () {\n    fetch('/api/today_blog')\n        .then(response =&gt; response.json())\n        .then(blogData =&gt; {\n            initializeBlog(blogData);\n        })\n        .catch(error =&gt; {\n            console.error('Error fetching blog data:', error);\n        });\n\n\n\n    // Add the event listener to textareas\n    document.querySelectorAll('textarea').forEach(textarea =&gt; {\n        textarea.addEventListener('input', autoResizeTextArea);\n        // Initialize each textarea to resize on page load\n        autoResizeTextArea({ target: textarea });\n    });\n});\n</pre><p><br></p><p>I didn't mistype when I said \"generate\", instead of set data of already existing elements. I originally had the HTML template contain the code for the first task, which defaulted to empty values. This worked fine, until I wanted to start loading in multiple tasks from a given blog. I tried to do this weird thing where I set the values for the first task, and then generated new HTML with formatted values for consecutive tasks. This sucked. It was super hard to keep the HTML on the template and the HTML I generated to be the same. This was a bad way of designing it, which I realized, and changed. Now, the main HTML template has NO HTML elements for the daily tasks on DOM content load. Instead, I will dynamically generate new HTML for each task. Here's the function that adds a new task.</p><pre class=\"ql-syntax\" spellcheck=\"false\">function addTask(taskData) {\n    currentTaskId++;\n    const newTaskId = currentTaskId;\n    console.log(`Current newTaskId: ${newTaskId}`)\n\n\n    // Create the tab button for the new task\n    const tabButton = document.createElement('button');\n    tabButton.textContent = 'Task ' + newTaskId;\n    tabButton.dataset.taskId = newTaskId;\n    tabButton.className = 'task-tab px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap';\n    tabButton.onclick = function () { selectTab(newTaskId); };\n    document.querySelector('.tab-buttons').appendChild(tabButton);\n\n\n    // Populate task fields with values from taskData (if available) or defaults\n    const task_goal = taskData?.task_goal || '';\n    const task_description = taskData?.task_description || '';\n    const task_expected_difficulty = taskData?.task_expected_difficulty || 50;\n    const task_planned_approach = taskData?.task_planned_approach || '';\n    \n    const task_progress_notes = taskData?.task_progress_notes || '';\n    const challenges_encountered = taskData?.challenges_encountered || '';\n    const research_questions = taskData?.research_questions || '';\n    \n    const tools_used = taskData?.tools_used || '';\n    const reflection_successes = taskData?.reflection_successes || '';\n    const reflection_failures = taskData?.reflection_failures || '';\n    const output_or_result = taskData?.output_or_result || '';\n    const time_spent_coding = taskData?.time_spent_coding || '';\n    const time_spent_researching = taskData?.time_spent_researching || '';\n    const time_spent_debugging = taskData?.time_spent_debugging || '';\n    const follow_up_tasks = taskData?.follow_up_tasks || '';\n\n\n    // Create the task content (HTML)\n    const tabContent = document.createElement('div');\n    tabContent.className = 'task-content p-4 border rounded hidden';\n    tabContent.id = `taskContent${newTaskId}`;\n    \n    tabContent.innerHTML = `\n    &lt;!-- Task Start --&gt;\n    &lt;div class=\"task-start mb-4 bg-white p-4 border rounded\"&gt;\n        &lt;h3 class=\"font-bold\"&gt;Task Start&lt;/h3&gt;\n        &lt;label for=\"task_goal${newTaskId}\"&gt;Task Goal:&lt;/label&gt;\n        &lt;textarea id=\"task_goal${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"Desired outcome or goal for the task...\" oninput=\"autoResizeTextArea(event)\"&gt;${task_goal}&lt;/textarea&gt;\n        \n        &lt;label for=\"task_description${newTaskId}\" class=\"block mt-2\"&gt;Task Description:&lt;/label&gt;\n        &lt;textarea id=\"task_description${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"Task description...\" oninput=\"autoResizeTextArea(event)\"&gt;${task_description}&lt;/textarea&gt;\n        \n        &lt;label for=\"task_expected_difficulty${newTaskId}\" class=\"block mt-2\"&gt;Expected Difficulty:&lt;/label&gt;\n        &lt;input type=\"range\" id=\"task_expected_difficulty${newTaskId}\" min=\"1\" max=\"100\" value=\"${task_expected_difficulty}\" class=\"w-full\"&gt;\n        \n        &lt;label for=\"task_planned_approach${newTaskId}\" class=\"block mt-2\"&gt;Planned Approach:&lt;/label&gt;\n        &lt;textarea id=\"task_planned_approach${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"Planned approach or strategy to solve the problem...\" oninput=\"autoResizeTextArea(event)\"&gt;${task_planned_approach}&lt;/textarea&gt;\n    &lt;/div&gt;\n\n\n    &lt;!-- Task Work --&gt;\n    &lt;div class=\"task-work mb-4 bg-white p-4 border rounded\"&gt;\n        &lt;h3 class=\"font-bold\"&gt;Task Work&lt;/h3&gt;\n        &lt;label for=\"task_progress_notes${newTaskId}\" class=\"block\"&gt;Progress Notes:&lt;/label&gt;\n        &lt;div id=\"task_progress_notes${newTaskId}\" class=\"min-h-[300px]\"&gt;${task_progress_notes}&lt;/div&gt;\n\n\n        &lt;label for=\"challenges_encountered${newTaskId}\" class=\"block mt-4\"&gt;Challenges Encountered:&lt;/label&gt;\n        &lt;textarea id=\"challenges_encountered${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"Key challenges or bugs encountered...\" oninput=\"autoResizeTextArea(event)\"&gt;${challenges_encountered}&lt;/textarea&gt;\n\n\n        &lt;label for=\"research_questions${newTaskId}\" class=\"block mt-4\"&gt;Research Questions:&lt;/label&gt;\n        &lt;textarea id=\"research_questions${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"List of research questions that arose while working on the task...\"\n            oninput=\"autoResizeTextArea(event)\"&gt;${research_questions}&lt;/textarea&gt;\n    &lt;/div&gt;\n\n\n    &lt;!-- Task Reflection --&gt;\n    &lt;div class=\"task-reflection mb-4 bg-white p-4 border rounded\"&gt;\n        &lt;h3 class=\"font-bold\"&gt;Task Reflection&lt;/h3&gt;\n\n\n        &lt;label for=\"tools_used${newTaskId}\" class=\"block\"&gt;Tools Used:&lt;/label&gt;\n        &lt;textarea id=\"tools_used${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"Key tools, libraries, or frameworks used during the task...\" oninput=\"autoResizeTextArea(event)\"&gt;${tools_used}&lt;/textarea&gt;\n\n\n        &lt;label for=\"reflection_successes${newTaskId}\" class=\"block mt-4\"&gt;Successes:&lt;/label&gt;\n        &lt;textarea id=\"reflection_successes${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"What worked well during the task?\" oninput=\"autoResizeTextArea(event)\"&gt;${reflection_successes}&lt;/textarea&gt;\n\n\n        &lt;label for=\"reflection_failures${newTaskId}\" class=\"block mt-4\"&gt;Failures or Shortcomings:&lt;/label&gt;\n        &lt;textarea id=\"reflection_failures${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"What didn’t work and why?\" oninput=\"autoResizeTextArea(event)\"&gt;${reflection_failures}&lt;/textarea&gt;\n\n\n        &lt;label for=\"output_or_result${newTaskId}\" class=\"block mt-4\"&gt;Output or Result:&lt;/label&gt;\n        &lt;textarea id=\"output_or_result${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"The outcome or deliverable from this task (e.g., code, documentation).\" oninput=\"autoResizeTextArea(event)\"&gt;${output_or_result}&lt;/textarea&gt;\n\n\n        &lt;!-- Time Spent Fields --&gt;\n        &lt;label for=\"time_spent_coding${newTaskId}\" class=\"block mt-4\"&gt;Time Spent Coding:&lt;/label&gt;\n        &lt;input type=\"text\" id=\"time_spent_coding${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded\"\n            placeholder=\"Enter coding time spent (e.g., 2 hours)\" value=\"${time_spent_coding}\"/&gt;\n\n\n        &lt;label for=\"time_spent_researching${newTaskId}\" class=\"block mt-4\"&gt;Time Spent Researching:&lt;/label&gt;\n        &lt;input type=\"text\" id=\"time_spent_researching${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded\"\n            placeholder=\"Enter research time spent (e.g., 30 minutes)\" value=\"${time_spent_researching}\"/&gt;\n\n\n        &lt;label for=\"time_spent_debugging${newTaskId}\" class=\"block mt-4\"&gt;Time Spent Debugging:&lt;/label&gt;\n        &lt;input type=\"text\" id=\"time_spent_debugging${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded\"\n            placeholder=\"Enter debugging time spent (e.g., 45 minutes)\" value=\"${time_spent_debugging}\"/&gt;\n\n\n        &lt;label for=\"follow_up_tasks${newTaskId}\" class=\"block mt-4\"&gt;Follow-Up Tasks:&lt;/label&gt;\n        &lt;textarea id=\"follow_up_tasks${newTaskId}\" class=\"w-full p-2 border border-gray-300 rounded min-h-[150px]\"\n            placeholder=\"Immediate next steps or follow-up tasks...\" oninput=\"autoResizeTextArea(event)\"&gt;${follow_up_tasks}&lt;/textarea&gt;\n    &lt;/div&gt;\n\n\n    &lt;button type=\"button\" onclick=\"removeTask(${newTaskId})\"\n        class=\"mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600\"&gt;Remove Task&lt;/button&gt;\n    `;\n\n\n    document.getElementById('tabContent').appendChild(tabContent);\n    \n    // Initialize the Quill editor for the task progress notes\n    initializeEditor(newTaskId, task_progress_notes);\n\n\n    // Select the new task tab\n    selectTab(newTaskId);\n\n\n    // Resize all newly added textAreas\n    document.querySelectorAll('textarea').forEach(textarea =&gt; {\n        autoResizeTextArea({ target: textarea });\n    });\n</pre><p>If you're a smarter person than me, you'll instantly see a problem with this approach. Although much more elegant, there's a slight problem. What happens when there's not an already initialized blog for the day?? Well, to handle this I would initialize an empty Pydantic model in my backend, if there wasn't already a row in the database for today's blog. The problem is that I set the default value for the tasks field to an empty list. In the above script, it iterates through the 'blogData.tasks.length'. Well that would be 0, and an empty task would never be added for the beautiful writer to populate. I could write a separate function to create a fallback task HTML generation? No, that's dumb. I went for the simple approach of changing the Pydantic model code. The 'task' submodel has all optional fields, and all of their defaults are already set (empty strings, or some number for numeric). An 'empty' task submodel could simply be initialized automatically, if there's no data present. So I changed one single line of my Pydantic file: I made a default_factory with a lambda to simply initialize a list, with an empty Task model, if no value was provided. Done. Everything worked. Seriously, that's the solution. I love Pydantic.</p><p><br></p><p>That's about the end of the daily work. To recap, I've done some thinking work to decide on what my blog should look like, I did some research and decided on a tech stack, I iterated on a Pydantic model and SQL schema concurrently, built a super basic Flask backend, connected it to my database with my custom Pydantic functions, iterated on a relatively simple frontend, and then built some javascript scripts to read in data of a blog and populate the fields! I spent some time testing out Quill, which is a rich text editor, which is what allows me to embed pictures and code chunks into this text! I think I'm ready to move on to the next task, which in reality is finishing the blog (I have some retroactive writing to do, now that \"Blog Builder\" is usable\"). See you in the reflection!</p>"""
    html_json_to_process, soup = process_html(task_progress_notes, "task_progress_notes")
    modifications = [{'elementId': 'task_progress_notes-0', 'precedingText': "It is considered bad practice to use Python f string formatting to inject the table name directly, however I don't care.", 'componentType': 'Warning', 'componentMessage': "Well, when Will says 'I don't care,' he really means, 'Please don’t try this at home unless you love debugging security issues at midnight.'"}, {'elementId': 'task_progress_notes-3', 'precedingText': 'I have the same function defined in 10 different repositories.', 'componentType': 'Question', 'componentMessage': "So Will, when you said you were into DRY principle (Don’t Repeat Yourself), you meant 'Definitely Repeat Yourself', right?"}, {'elementId': 'task_progress_notes-5', 'precedingText': 'I needed something flexible that allowed me to track multiple different unique tasks throughout the day.', 'componentType': 'Question', 'componentMessage': 'Will, have you ever considered that your ‘flexible system’ is just a sneaky way to avoid making decisions? 😏'}, {'elementId': 'task_progress_notes-9', 'precedingText': 'I really enjoy using the Field() feature of Pydantic, which allows me to set default values and add extensive descriptions, as well as constraints for improved automatic value validation.', 'componentType': 'Warning', 'componentMessage': "Watch out—when Will says 'extensive descriptions', he might just mean his usual rambling but in JSON format. 🤷\u200d♂️"}, {'elementId': 'task_progress_notes-23', 'precedingText': 'Smort. To be completely honest, this is the point where a lot of design iteration happened.', 'componentType': 'Warning', 'componentMessage': '‘Smort’. Will trying to make ‘smart’ sound cool, or a typo? You decide!'}, {'elementId': 'task_progress_notes-29', 'precedingText': 'and then generated new HTML with formatted values for consecutive tasks.', 'componentType': 'Warning', 'componentMessage': '‘Formatted values’—another term for ‘I just hope this code works and I remember what it does tomorrow.’'}, {'elementId': 'task_progress_notes-33', 'precedingText': 'So, I changed one single line of my Pydantic file: I made a default_factory with a lambda to simply initialize a list, with an empty Task model, if no value was provided.', 'componentType': 'Informative', 'componentMessage': 'He means he cleverly avoided a potential crisis, or ‘introduced a subtle bug’—future Will can sort it out! 😜'}]
    updated_html = apply_modifications(soup, modifications)
    with open(f"{DIR}/temp.html", "w") as html_file:
        html_file.write(updated_html)
    

def process_html(html_content, field_name):
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    direct_children: List[Tag] = soup.find_all(True, recursive=False)  # This grabs all elements at the top level
    
    # Dictionary to hold the elements as strings with added IDs
    elements_to_process = []
    all_elements = []
    
    # Iterate over each child, adding an id and converting it back to string
    for index, child in enumerate(direct_children):
        # Add an ID to each element based on its index
        child['id'] = f'{field_name}-{index}'
        
        # Convert the element back to a string
        element_str = str(child)
        all_elements.append(element_str)
        # Elements to not process
        if child.name == "pre" or child.find("img", recursive=False) or child.get_text().strip() == "":
            continue
        # Skip empty paragraph elements
        
        # Append to the list as a dictionary
        elements_to_process.append(element_str)
    
    # Convert the list of dictionaries to JSON
    json_elements_to_process = json.dumps(elements_to_process, indent=2)
    
    return json_elements_to_process, soup


def apply_modifications(soup: BeautifulSoup, modifications: List[dict]):
    
    for mod in modifications:
        # Find the element by ID
        element = soup.find(id=mod['elementId'])
        if element:
            # Locate the specific spot for insertion
            text_to_find = mod['precedingText']
            found = element.find(text=lambda text: text and text_to_find in text)
            
            if found:
                # Create a new span tag for the custom component
                new_tag = soup.new_tag("span", **{'class': 'inline-block'})
                
                # Create the custom component tag
                custom_component = soup.new_tag(mod['componentType'], preface='', message=mod['componentMessage'])
                
                # Nest the custom component inside the span
                new_tag.append(custom_component)
                
                # Replace the found text with new text including the new HTML
                new_text = str(found).replace(text_to_find, text_to_find + str(new_tag), 1)
                found.replace_with(BeautifulSoup(new_text, 'html.parser'))  # parse the new text as HTML
            else:
                print(f"Couldn't insert modifications for: {mod}")

    # Return the modified HTML as a string
    return str(soup)

if __name__ == "__main__":
    main()