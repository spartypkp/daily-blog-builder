let currentTaskId = 0; // Start from 1 because the initial task is already there

import { init, tx, id } from '@instantdb/core';
import { DailyBlog, Introduction, Task, Reflection } from './types';
// ID for app: Instant Tutorial Todo App
const APP_ID = '3b4a73a0-ffc6-488a-b883-550004ff6e0a';



type Schema = {
	dailyBlogs: DailyBlog;
};

const db = init<Schema>({ appId: APP_ID });


db.subscribeQuery({ dailyBlogs: {} }, (resp) => {
	if (resp.error) {
		renderError(resp.error.message); // Pro-tip: Check you have the right appId!
		return;
	}
	if (resp.data) {
		render(resp.data);
	}
});

function updateIntroduction(date: string, new_introduction: Introduction) {
	db.transact(tx.blogs[date].update({introduction: new_introduction}))

}

function updateTask(date: string, new_introduction: Introduction) {
	db.transact(tx.blogs[date].update({introduction: new_introduction}))

}

function updateReflection(date: string, new_reflection: Reflection) {
	db.transact(tx.blogs[date].update({reflection: new_reflection}))

}

// function deleteTodoItem(todo: Todo) {
// 	db.transact(tx.todos[todo.id].delete());
// }

// function toggleDone(todo: Todo) {
// 	db.transact(tx.todos[todo.id].update({ done: !todo.done }));
// }

// function deleteCompleted(todos: Todo[]) {
// 	const completed = todos.filter((todo) => todo.done);
// 	const txs = completed.map((todo) => tx.todos[todo.id].delete());
// 	db.transact(txs);
// }

// function toggleAllTodos(todos: Todo[]) {
// 	const newVal = !todos.every((todo) => todo.done);
// 	db.transact(todos.map((todo) => tx.todos[todo.id].update({ done: newVal })));
// }

const app = document.getElementById('app')!;


function render(data: { dailyBlogs: DailyBlog[]; }) {
	app.innerHTML = '';

	const { dailyBlogs } = data;
	const blog: DailyBlog = dailyBlogs[0];
	if (!blog) {
		throw new Error("No blog for today!")
	}

	const containerHTML = `
	<body id="app" class="bg-white p-4">
    <header class="text-center mb-6">
        <h1 class="text-5xl font-bold">Daily Blog Builder</h1>
        
        <select id="blogDateSelector" onchange="fetchBlogData(this.value)">
            <!-- Options will be dynamically populated by JavaScript -->
        </select>
        <div class="mt-4 bg-white rounded-lg p-4">
            <h2  class="text-3xl font-bold text-gray-800 text-center">Day Number</h2>
            <p id="day_count" class="text-m  text-gray-800 text-center"></p>
            <h2  class="text-3xl font-bold text-gray-800 text-center">Blog Title</h2>
            <p id="blog_title" class="text-m  text-gray-800 text-center"></p>
            <h2  class="text-3xl font-bold text-gray-800 text-center">Blog Description</h2>
            <p id="blog_description" class="text-m  text-gray-800 text-center"></p>
            
        </div>
       
        <!-- <p id="date" class="text-sm">Date: {{ today_date }}</p> -->
    </header>
    <!-- Introduction Section -->
    <section class="goals mb-8 bg-gray-200 shadow-md rounded-lg p-6">
        ${IntroductionSection(blog.introduction!)}
    </section>

    <section class="tasks mb-8 bg-gray-200 shadow-md rounded-lg p-6">
        <div class="flex justify-between items-center">
            <button onclick="toggleSection('daily-tasks')"
                class="text-xl font-semibold focus:outline-none bg-gray-200 hover:bg-blue-200 rounded-lg py-2 px-4 transition-colors duration-150">
                <span id="icon-daily-tasks">+</span> Daily Tasks
            </button>
            
        </div>
        <div id="daily-tasks" class="mx-auto hidden">
            <div id="tabs-container" class="tabs-container flex justify-center mb-2 border-b border-gray-300">
                <!-- Task Tabs dynamically populated -->
            </div>
            <div class="text-center">
                <button type="button" onclick="addTask()"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150">+
                    Add Task</button>
            </div>
            <div class="tab-content mt-4" id="tabContent">
                <!-- Content for each task -->
            </div>
        </div>
    </section>

    <!-- Reflection Section -->
    <section class="reflection mb-8 bg-gray-200 shadow-md rounded-lg p-6">
        ${ReflectionSection(blog.reflection!)}
    </section>



    <footer class="text-center">
        <button type="button" onclick="edit_blog()"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Edit Blog</button>
        <button type="button" onclick="publishBlog()"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Publish Blog</button>
    </footer>
</body>
	`;

	app.innerHTML = containerHTML;
}

function renderError(errorMessage: string) {
	app.innerHTML = `
	  <div>${errorMessage}</div>
	`;
}


function addTask(taskData) {
    currentTaskId++;
    const newTaskId = currentTaskId.toString();
    console.log(`Current newTaskId: ${newTaskId}`);

    // Create the tab button for the new task
    const tabButton = document.createElement('button');
    tabButton.textContent = 'Task ' + newTaskId;
    tabButton.dataset.taskId = newTaskId;
    tabButton.className = 'tab text-gray-600 py-2 px-4 hover:text-blue-500 focus:outline-none border-b-2 border-transparent hover:border-blue-500';
    tabButton.onclick = function () {
        // Activate this tab

        // Show corresponding content
        document.querySelectorAll('.task-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`taskContent${newTaskId}`)!.classList.remove('hidden');
    };

    // Append the new tab button to the tab-buttons container
    const tabsContainer = document.getElementById('tabs-container')!;
    tabsContainer.appendChild(tabButton);

    // Populate task fields with values from taskData (if available) or defaults
    const tabContent = generateTaskHTML(newTaskId, taskData)
    document.getElementById('tabContent')!.appendChild(tabContent);

    const task_goal = taskData?.task_goal || '';
    initializeEditor("task_goal", newTaskId, task_goal, "");
    //initializeEditor("task_goal", "", task_goal, placeholder="")
    const task_description = taskData?.task_description || '';
    initializeEditor("task_description", newTaskId, task_description, "");

    const task_planned_approach = taskData?.task_planned_approach || '';
    initializeEditor("task_planned_approach", newTaskId, task_planned_approach, "");

    const task_progress_notes = taskData?.task_progress_notes || '';
    initializeEditor("task_progress_notes", newTaskId, task_progress_notes, "");
    // Initialize the Quill editor for the task progress notes

    // Select the new task tab
    selectTab(newTaskId);

}


function ReflectionSection(reflection: Reflection) {
	return `
	
            <!-- Learning Outcomes -->
            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Learning Outcomes</h2>
                <div id="learning_outcomes" class="min-h-[150px] bg-gray-50 p-4 rounded border">
				
				</div>
            </div>

            <!-- Short-Term Next Steps -->
            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Short-Term Next Steps</h2>
                <div id="next_steps_short_term" class="min-h-[150px] bg-gray-50 p-4 rounded border">
				
				</div>
            </div>

            <!-- Long-Term Next Steps -->
            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Long-Term Next Steps</h2>
                <div id="next_steps_long_term" class="min-h-[150px] bg-gray-50 p-4 rounded border">
				
				</div>
            </div>

            <!-- Mood Sliders (Self-Reflective & Humorous) -->
            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Mood & Self-Reflection</h2>
                <div class="space-y-4 mt-4">
                    <div>
                        <label for="productivity_level" class="block text-gray-800">Productivity Level:</label>
                        <input type="range" id="productivity_level" min="0" max="100" value="${reflection.productivity_level || 50}"
                            class="w-full h-2 rounded-lg appearance-none cursor-pointer" oninput="updateSliderColor('productivity_level')">
                    </div>
                    <div>
                        <label for="distraction_level" class="block text-gray-800">Distraction Level:</label>
                        <input type="range" id="distraction_level" min="0" max="100" value="${reflection.distraction_level || 50}"
                            class="w-full h-2 rounded-lg appearance-none cursor-pointer" oninput="updateSliderColor('distraction_level')">
                    </div>
                    <div>
                        <label for="desire_to_play_steam_games_level" class="block text-gray-800">Desire to Play Steam Games:</label>
                        <input type="range" id="desire_to_play_steam_games_level" min="0" max="100" value="${reflection.desire_to_play_steam_games_level || 50}"
                            class="w-full h-2 rounded-lg appearance-none cursor-pointer" oninput="updateSliderColor('desire_to_play_steam_games_level')">
                    </div>
                    <div>
                        <label for="overall_frustration_level" class="block text-gray-800">Overall Frustration:</label>
                        <input type="range" id="overall_frustration_level" min="0" max="100" value="${reflection.overall_frustration_level || 50}"
                            class="w-full h-2 rounded-lg appearance-none cursor-pointer" oninput="updateSliderColor('overall_frustration_level')">
                    </div>
                </div>
            </div>
            <h1> AI Generated Reflection</h1>
            <!-- Technical Challenges -->
            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Summary of Entire Blog</h2>
                <div id="entire_blog_summary" class="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.entire_blog_summary || ''}
				</div>
            </div>

            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Technical Challenges</h2>
                <div id="technical_challenges" class="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.technical_challenges || ''}
				</div>
            </div>

            <!-- Interesting Bugs -->
            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Interesting Bugs</h2>
                <div id="interesting_bugs" class="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.interesting_bugs || ''}
				</div>
            </div>

            <!-- Unanswered Questions -->
            <div class="mt-4 bg-white rounded-lg p-4">
                <h2 class="text-3xl font-bold text-gray-800 text-center">Unanswered Questions</h2>
                <div id="unanswered_questions" class="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.unanswered_questions || ''}
				</div>
            </div>
        
	`;
}

function IntroductionSection(intro: Introduction) {
	return `
	<!-- Section content -->
	<div class="mt-4 bg-white rounded-lg p-4">
		<h2 class="text-3xl font-bold text-gray-800 pb-4">Context for the Day</h2>
		<div id="personal_context" class="min-h-[100px] bg-gray-50 p-4 rounded border mt-4">
			
		</div>
	</div>

	<div class="mt-4 bg-white rounded-lg p-4">
		<h2 class="text-3xl font-bold text-gray-800 pb-4">Daily Goals</h2>
		<div id="daily_goals" class="min-h-[150px] bg-gray-50 p-4 rounded border">
		
		</div>
	</div>
	<div class="mt-4 bg-white rounded-lg p-4">
		<h2 class="text-3xl font-bold text-gray-800 pb-4">Learning Focus</h2>
		<div id="learning_focus" class="min-h-[100px] bg-gray-50 p-4 rounded border">
		
		</div>
	</div>
	<div class="mt-4 bg-white rounded-lg p-4">
		<h2 class="text-3xl font-bold text-gray-800 pb-4">Anticipated Challenges</h2>
		<div id="challenges" class="min-h-[100px] bg-gray-50 p-4 rounded border"></div>
	</div>
	<div class="mt-4 bg-white rounded-lg p-4">
		<h2 class="text-3xl font-bold text-gray-800 pb-4">Plan of Action</h2>
		<div id="plan_of_action" class="min-h-[100px] bg-gray-50 p-4 rounded border"></div>
	</div>
	<div class="mt-4 bg-white rounded-lg p-4">
		<!-- Mood Sliders -->
		<h2 class="text-2xl font-bold text-gray-800 text-center mt-4">Enthusiasm Level</h2>
		<input type="range" id="enthusiasm_level" min="0" max="100"
			value="${intro.enthusiasm_level || 50}"
			class="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
			oninput="updateSliderColor('enthusiasm_level')">

		<h2 class="text-2xl font-bold text-gray-800 text-center mt-4">Burnout Level</h2>
		<input type="range" id="burnout_level" min="0" max="100"
			value="${intro.burnout_level || 50}"
			class="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
			oninput="updateSliderColor('burnout_level')">

		<h2 class="text-2xl font-bold text-gray-800 text-center mt-4">LeetCode Hatred</h2>
		<input type="range" id="leetcode_hatred_level" min="0" max="100"
			value="${intro.leetcode_hatred_level || 50}"
			class="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
			oninput="updateSliderColor('leetcode_hatred_level')">

		<h2 class="text-2xl font-bold text-gray-800 text-center mt-4">Focus Level</h2>
		<input type="range" id="focus_level" min="0" max="100"
			value="${intro.focus_level || 50}"
			class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
			oninput="updateSliderColor('focus_level')">

	</div>
	<!-- AI Generated Teaser-->
	<div class="mt-4 bg-white rounded-lg p-4">
		<h2 class="text-3xl font-bold text-gray-800 text-center">Introduction Summary and Teaser</h2>
		<div id="introduction_summary" class="min-h-[150px] bg-gray-50 p-4 rounded border">
		${intro.introduction_summary || ''}
		</div>
	</div>
	`;
}

function Task(task: Task, taskId: number) {
	
	const task_start_summary = task?.task_start_summary || '';
    const task_reflection_summary = task?.task_reflection_summary || '';
    const output_or_result = task?.output_or_result || '';
    const challenges_encountered = task?.challenges_encountered || '';
    const follow_up_tasks = task?.follow_up_tasks || '';
    const reflection_successes = task?.reflection_successes || '';
    const reflection_failures = task?.reflection_failures || '';
    const research_questions = task?.research_questions || '';
    const tools_used = task?.tools_used || '';
    // Human Fields

    const task_expected_difficulty = task?.task_expected_difficulty || 50;
    const time_spent_coding = task?.time_spent_coding || '';
    const time_spent_researching = task?.time_spent_researching || '';
    const time_spent_debugging = task?.time_spent_debugging || '';


    // Create the task content (HTML)
    const tabContent = document.createElement('div');
    tabContent.className = 'task-content p-4 border rounded hidden';
    tabContent.id = `taskContent${taskId}`;

    tabContent.innerHTML = `
    <!-- Task Start -->
    
    <div id="task-start${taskId}" class="mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold mt-2">Task Goal:</h3>
        <div id="task_goal${taskId}" class="min-h-[150px] bg-gray-50 p-4 rounded border"></div>

        <h3 class="font-bold mt-2">Task Description:</h3>
        <div id="task_description${taskId}" class="min-h-[150px] bg-gray-50 p-4 rounded border"></div>

        <h3 class="font-bold mt-2">Expected Difficulty:</h3>
        <input type="range" id="task_expected_difficulty${taskId}" min="1" max="100" value="${task_expected_difficulty}" class="w-full">

        <h3 class="font-bold mt-2">Planned Approach:</h3>
        <div id="task_planned_approach${taskId}" class="min-h-[150px] bg-gray-50 p-4 rounded border"></div>

        <h3 class="font-bold mt-4">AI Summary:</h3>
        <div id="task_start_summary${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${task_start_summary}</div>
    </div>

    <!-- Task Work -->
    
    <div id="task-work${taskId}" class="mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold">Progress Notes:</h3>
        <div id="task_progress_notes${taskId}" class="min-h-[300px] bg-gray-50 p-4 rounded border"></div>
    </div>

    <!-- Task Reflection -->
    
    <div id="task-reflection${taskId}" class="mb-4 bg-white p-4 border rounded">
        <!-- Human Input -->
        <h2>Human Reflection</h2>
        <h3 class="font-bold mt-4">Time Spent Coding:</h3>
        <input type="text" id="time_spent_coding${taskId}" class="w-full p-2 border border-gray-300 rounded" value="${time_spent_coding}"/>

        <h3 class="font-bold mt-4">Time Spent Researching:</h3>
        <input type="text" id="time_spent_researching${taskId}" class="w-full p-2 border border-gray-300 rounded" value="${time_spent_researching}"/>

        <h3 class="font-bold mt-4">Time Spent Debugging:</h3>
        <input type="text" id="time_spent_debugging${taskId}" class="w-full p-2 border border-gray-300 rounded" value="${time_spent_debugging}"/>

        <!-- AI Generated -->
        <h2>AI Generated Task Reflection</h2>
        <h3 class="font-bold">AI Reflection Summary:</h3>
        <div id="task_reflection_summary${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${task_reflection_summary}</div>

        <h3 class="font-bold mt-4">Output or Result:</h3>
        <div id="output_or_result${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${output_or_result}</div>

        <h3 class="font-bold mt-4">Challenges Encountered:</h3>
        <div id="challenges_encountered${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${challenges_encountered}</div>
 
        <h3 class="font-bold mt-4">Follow-Up Tasks:</h3>
        <div id="follow_up_tasks${taskId}" class="min-h-[150px] bg-gray-50 p-4 rounded border">${follow_up_tasks}</div>

        <h3 class="font-bold mt-4">Successes:</h3>
        <div id="reflection_successes${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${reflection_successes}</div>

        <h3 class="font-bold mt-4">Failures or Shortcomings:</h3>
        <div id="reflection_failures${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${reflection_failures}</div>

        <h3 class="font-bold mt-4">Research Questions:</h3>
        <div id="research_questions${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${research_questions}</div>

        <h3 class="font-bold mt-4">Tools Used:</h3>
        <div id="tools_used${taskId}" class="min-h-[150px] bg-gray-100 p-4 rounded border">${tools_used}</div>
    </div>

    <button type="button" onclick="removeTask(${taskId})"
        class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Task</button>
	`;
	return 
}


function selectTab(taskId) {
    const allTabs = document.querySelectorAll('.task-tab');
    const allContents = document.querySelectorAll('.task-content');

    // Hide all task contents and reset tab styles
    allTabs.forEach(tab => {
        if (!tab) {
			throw new Error("No tabs!")
		}
        tab.classList.remove('bg-blue-100', 'font-bold');
        tab.classList.add('text-blue-700', 'hover:text-blue-900');
    });
    allContents.forEach(content => {
        content.classList.add('hidden');
    });

    // Show the selected task and highlight the tab
    const activeTab = document.querySelector(`[data-task-id="${taskId}"]`)!;
    const activeContent = document.getElementById(`taskContent${taskId}`)!;
    activeTab.classList.add('bg-blue-100', 'font-bold');
    activeTab.classList.remove('text-blue-700', 'hover:text-blue-900');
    activeContent.classList.remove('hidden');
}

function removeTask(taskId: string) {
    const taskButton = document.querySelector<HTMLElement>(`[data-task-id="${taskId}"]`);
    const taskContent = document.getElementById(`taskContent${taskId}`);

    if (taskButton) {
        taskButton.remove();
    }
    if (taskContent) {
        taskContent.remove();
    }

    // Select another tab if available
    const remainingTabs = document.querySelectorAll<HTMLElement>('.task-tab');
    if (remainingTabs.length > 0 && remainingTabs[0].dataset.taskId) {
        selectTab(remainingTabs[0].dataset.taskId);
    } else {
        // Assuming currentTaskId is declared elsewhere in your script with a proper type
        currentTaskId = 0; // Reset task ID counter if all tasks are removed
    }
}

