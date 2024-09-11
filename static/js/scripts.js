let currentTaskId = 0; // Start from 1 because the initial task is already there

function initializeBlog(blogData) {
    // Reset the current task count
    currentTaskId = 0;

    // Clear existing task tabs and content
    const tabButtonsContainer = document.getElementById('tabs-container');
    const tabContentContainer = document.getElementById('tabContent');
    while (tabButtonsContainer.firstChild) {
        tabButtonsContainer.removeChild(tabButtonsContainer.firstChild);
    }
    while (tabContentContainer.firstChild) {
        tabContentContainer.removeChild(tabContentContainer.firstChild);
    }
    
    // Cleanup for Quill editors if they were previously initialized
    const quillEditors = tabContentContainer.querySelectorAll('.quill-editor');
    quillEditors.forEach(editor => {
        // Assuming the Quill editor instance is stored on the element
        if (editor.__quill) {
            editor.__quill.deleteText(0, editor.__quill.getLength()); // Clears all text
            editor.__quill = null; // Remove reference to the Quill instance
        }
        editor.innerHTML = ''; // Clear the editor container
    });

    // Set the values for Introduction section fields
    if (blogData.introduction) {
        initializeEditor('daily_goals', '', blogData.introduction.daily_goals || '', '');
        initializeEditor('learning_focus', '',  blogData.introduction.learning_focus || '', '');
        initializeEditor('challenges', '', blogData.introduction.challenges || '', '');
        initializeEditor('plan_of_action', '', blogData.introduction.plan_of_action || '', '');
        initializeEditor('personal_context','', blogData.introduction.personal_context || '', '');
    
        // Set the mood sliders
        document.getElementById('enthusiasm_level').value = blogData.introduction.enthusiasm_level || 50;
        document.getElementById('burnout_level').value = blogData.introduction.burnout_level || 50;
        document.getElementById('focus_level').value = blogData.introduction.focus_level || 50;
        document.getElementById('leetcode_hatred_level').value = blogData.introduction.leetcode_hatred_level || 50;

        document.getElementById('introduction_summary').innerHTML = blogData.introduction.introduction_summary || '';
    }
    
    // Set the values for Reflection section fields
    if (blogData.reflection) {
        initializeEditor('learning_outcomes','', blogData.reflection.learning_outcomes || '', '');
        initializeEditor('next_steps_short_term','', blogData.reflection.next_steps_short_term || '', '');
        initializeEditor('next_steps_long_term','', blogData.reflection.next_steps_long_term || '', '');
    
        // Set the self-reflective mood sliders
        document.getElementById('productivity_level').value = blogData.reflection.productivity_level || 50;
        document.getElementById('distraction_level').value = blogData.reflection.distraction_level || 50;
        document.getElementById('desire_to_play_steam_games_level').value = blogData.reflection.desire_to_play_steam_games_level || 50;
        document.getElementById('overall_frustration_level').value = blogData.reflection.overall_frustration_level || 50;

        document.getElementById('entire_blog_summary').innerHTML = blogData.introduction.entire_blog_summary || '';
        document.getElementById('technical_challenges').innerHTML = blogData.introduction.technical_challenges || '';
        document.getElementById('interesting_bugs').innerHTML = blogData.introduction.interesting_bugs || '';
        document.getElementById('unanswered_questions').innerHTML = blogData.introduction.unanswered_questions || '';
    }
    // Add a new task for however many tasks there are
    for (let i = 0; i < blogData.tasks.length; i++) {
        addTask(blogData.tasks[i]); // Add additional tasks
    }

    selectTab(1); // Ensure this is called after the DOM is fully loaded

}

document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('blogDateSelector');

    fetch('/api/available_dates')
        .then(response => response.json())
        .then(dates => {
            dates.forEach(date => {
                console.log(date)
                const option = document.createElement('option');
                option.value = date;
                option.textContent = date; // Format this if necessary
                selectElement.appendChild(option);
            });

            // Set the current value to the first date or a default
            selectElement.value = dates[0] || new Date().toISOString().slice(0, 10);

            fetchBlogData(selectElement.value); // Load the blog for the selected date

            // Update the color of all sliders on the page initially
            updateAllSliders();
        })
        .catch(error => console.error('Failed to load available dates:', error));
});

// Function to update all sliders' colors based on their initial values
function updateAllSliders() {
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        updateSliderColor(slider.id);
    });
}



function fetchBlogData(date) {
    fetch(`/api/blog_by_date/${date}`)
        .then(response => response.json())
        .then(blogData => {
            if (blogData.error) {
                console.error('No blog found for this date:', date);
            } else {
                initializeBlog(blogData); // Initialize with fetched blog data
            }
        })
        .catch(error => {
            console.error('Error fetching blog data:', error);
        });
}





function addTask(taskData) {
    currentTaskId++;
    const newTaskId = currentTaskId;
    console.log(`Current newTaskId: ${newTaskId}`);

    // Create the tab button for the new task
    const tabButton = document.createElement('button');
    tabButton.textContent = 'Task ' + newTaskId;
    tabButton.dataset.taskId = newTaskId;
    tabButton.className = 'tab text-gray-600 py-2 px-4 hover:text-blue-500 focus:outline-none border-b-2 border-transparent hover:border-blue-500';
    tabButton.onclick = function () {
        // Activate this tab
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('text-blue-500', 'border-blue-500');
            t.classList.add('text-gray-600', 'border-transparent');
        });
        this.classList.add('text-blue-500', 'border-blue-500');
        this.classList.remove('text-gray-600', 'border-transparent');

        // Show corresponding content
        document.querySelectorAll('.task-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`taskContent${newTaskId}`).classList.remove('hidden');
    };

    // Append the new tab button to the tab-buttons container
    const tabsContainer = document.getElementById('tabs-container');
    tabsContainer.appendChild(tabButton);

    // Populate task fields with values from taskData (if available) or defaults
    const tabContent = generateTaskHTML(newTaskId, taskData)
    document.getElementById('tabContent').appendChild(tabContent);

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

function generateTaskHTML(taskId, taskData) {
    // Populate task fields with values from taskData (if available) or defaults
    const task_start_summary = taskData?.task_start_summary || '';
    const task_reflection_summary = taskData?.task_reflection_summary || '';
    const output_or_result = taskData?.output_or_result || '';
    const challenges_encountered = taskData?.challenges_encountered || '';
    const follow_up_tasks = taskData?.follow_up_tasks || '';
    const reflection_successes = taskData?.reflection_successes || '';
    const reflection_failures = taskData?.reflection_failures || '';
    const research_questions = taskData?.research_questions || '';
    const tools_used = taskData?.tools_used || '';
    // Human Fields
    
    const task_expected_difficulty = taskData?.task_expected_difficulty || 50;
    const time_spent_coding = taskData?.time_spent_coding || '';
    const time_spent_researching = taskData?.time_spent_researching || '';
    const time_spent_debugging = taskData?.time_spent_debugging || '';


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
    return tabContent;


}

function selectTab(taskId) {
    const allTabs = document.querySelectorAll('.task-tab');
    const allContents = document.querySelectorAll('.task-content');

    // Hide all task contents and reset tab styles
    allTabs.forEach(tab => {
        console.log(tab)
        tab.classList.remove('bg-blue-100', 'font-bold');
        tab.classList.add('text-blue-700', 'hover:text-blue-900');
    });
    allContents.forEach(content => {
        content.classList.add('hidden');
    });

    // Show the selected task and highlight the tab
    const activeTab = document.querySelector(`[data-task-id="${taskId}"]`);
    const activeContent = document.getElementById(`taskContent${taskId}`);
    activeTab.classList.add('bg-blue-100', 'font-bold');
    activeTab.classList.remove('text-blue-700', 'hover:text-blue-900');
    activeContent.classList.remove('hidden');
}

function removeTask(taskId) {
    const taskButton = document.querySelector(`[data-task-id="${taskId}"]`);
    const taskContent = document.getElementById(`taskContent${taskId}`);
    taskButton.remove();
    taskContent.remove();

    // Select another tab if available
    const remainingTabs = document.querySelectorAll('.task-tab');
    if (remainingTabs.length > 0) {
        selectTab(remainingTabs[0].dataset.taskId);
    } else {
        currentTaskId = 0; // Reset task ID counter if all tasks are removed
    }
}

var BaseImageFormat = Quill.import('formats/image');
const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style'
];

class ImageFormat extends BaseImageFormat {
    static formats(domNode) {
        return ImageFormatAttributesList.reduce(function (formats, attribute) {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
        }, {});
    }
    format(name, value) {
        if (ImageFormatAttributesList.indexOf(name) > -1) {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}

function initializeEditor(idName, taskId, text, placeholder) {
    const editorId = `#${idName}${taskId}`;
    const editorElement = document.querySelector(editorId);

    // Check if Quill has already been initialized on this element
    if (editorElement.__quill) {
        // If editor already exists, just update its content
        editorElement.__quill.root.innerHTML = text;
        return editorElement.__quill; // Optionally return the existing instance
    } else {
        // Register custom formats or modules if not already registered
        Quill.register(ImageFormat, true);

        var toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['image']
        ];

        // Initialize a new Quill editor
        var editor = new Quill(editorId, {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: placeholder,
            theme: 'snow'
        });

        // Store the Quill instance directly on the element for future reference
        editorElement.__quill = editor;

        if (text && text.trim() !== "") {
            editor.clipboard.dangerouslyPasteHTML(text);
        }

        // Image handling
        editor.getModule('toolbar').addHandler('image', function () {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*'); // Ensure only images are selected
            input.click();

            input.addEventListener('change', () => {
                if (input.files != null && input.files[0] != null) {
                    const file = input.files[0];
                    saveToServer(file, editor);
                }
            });
        });

        return editor; // Optionally return the new instance
    }
}

function selectLocalImage(editor) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        if (/^image\//.test(file.type)) {
            saveToServer(file, editor);
        } else {
            console.warn('You could only upload images.');
        }
    };
}

function saveToServer(file, editor) {
    const formData = new FormData();
    formData.append('image', file);

    fetch('/upload_image', { // This URL needs to handle image uploads
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            insertToEditor(result.path, editor);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function insertToEditor(url, editor) {
    const range = editor.getSelection();
    if (range) {
        editor.insertEmbed(range.index, 'image', url);
    }
}

function exportBlog() {
    // Introduction Section - Refactored to use Quill where applicable
    const daily_goals = document.querySelector('#daily_goals').__quill.root.innerHTML.trim();
    const learning_focus = document.querySelector('#learning_focus').__quill.root.innerHTML.trim();
    const challenges = document.querySelector('#challenges').__quill.root.innerHTML.trim();
    const plan_of_action = document.querySelector('#plan_of_action').__quill.root.innerHTML.trim();
    const personal_context = document.querySelector('#personal_context').__quill.root.innerHTML.trim();

    const enthusiasm_level = parseInt(document.getElementById('enthusiasm_level').value);
    const burnout_level = parseInt(document.getElementById('burnout_level').value);
    const focus_level = parseInt(document.getElementById('focus_level').value);
    const leetcode_hatred_level = parseInt(document.getElementById('leetcode_hatred_level').value);

    const introduction_summary = document.getElementById('introduction_summary').innerHTML.trim();

    const introduction = {
        personal_context,
        daily_goals,
        learning_focus,
        challenges,
        plan_of_action,
        enthusiasm_level,
        burnout_level,
        focus_level,
        leetcode_hatred_level,
        introduction_summary
    };

    // Reflect - Human Input
    const learning_outcomes = document.querySelector('#learning_outcomes').__quill.root.innerHTML.trim();
    const next_steps_short_term = document.querySelector('#next_steps_short_term').__quill.root.innerHTML.trim();
    const next_steps_long_term = document.querySelector('#next_steps_long_term').__quill.root.innerHTML.trim();

    const productivity_level = parseInt(document.getElementById('productivity_level').value);
    const distraction_level = parseInt(document.getElementById('distraction_level').value);
    const desire_to_play_steam_games_level = parseInt(document.getElementById('desire_to_play_steam_games_level').value);
    const overall_frustration_level = parseInt(document.getElementById('overall_frustration_level').value);

    // Reflection - AI Generated
    const entire_blog_summary = document.getElementById('entire_blog_summary').innerHTML.trim();
    const technical_challenges = document.getElementById('technical_challenges').innerHTML.trim();
    const interesting_bugs = document.getElementById('interesting_bugs').innerHTML.trim();
    const unanswered_questions = document.getElementById('unanswered_questions').innerHTML.trim();

    const reflection = {
        
        learning_outcomes,
        next_steps_short_term,
        next_steps_long_term,
        productivity_level,
        distraction_level,
        desire_to_play_steam_games_level,
        overall_frustration_level,
        entire_blog_summary,
        technical_challenges,
        interesting_bugs,
        unanswered_questions,
    };

    // Task Section
    const tasks = [];
    document.querySelectorAll('.task-content').forEach((taskElement, index) => {
        const task_goal = document.querySelector(`#task_goal${index + 1}`).__quill.root.innerHTML.trim();
        const task_description = document.querySelector(`#task_description${index + 1}`).__quill.root.innerHTML.trim();
        const task_expected_difficulty = parseInt(document.getElementById(`task_expected_difficulty${index + 1}`).value);
        const task_planned_approach = document.getElementById(`task_planned_approach${index + 1}`).__quill.root.innerHTML.trim();
        const task_start_summary = document.getElementById(`task_start_summary${index + 1}`).innerHTML.trim();

        const task_progress_notes = document.querySelector(`#task_progress_notes${index + 1}`).__quill.root.innerHTML.trim();
        
        const time_spent_researching = document.getElementById(`time_spent_researching${index + 1}`).value.trim();
        const time_spent_debugging = document.getElementById(`time_spent_debugging${index + 1}`).value.trim();
        const time_spent_coding = document.getElementById(`time_spent_coding${index + 1}`).value.trim();

        const task_reflection_summary = document.getElementById(`task_reflection_summary${index + 1}`).innerHTML.trim();
        const challenges_encountered = document.getElementById(`challenges_encountered${index + 1}`).innerHTML.trim();
        const research_questions = document.getElementById(`research_questions${index + 1}`).innerHTML.trim();
        const tools_used = document.getElementById(`tools_used${index + 1}`).innerHTML.trim();
        const reflection_successes = document.getElementById(`reflection_successes${index + 1}`).innerHTML.trim();
        const reflection_failures = document.getElementById(`reflection_failures${index + 1}`).innerHTML.trim();
        const output_or_result = document.getElementById(`output_or_result${index + 1}`).innerHTML.trim();
        const follow_up_tasks = document.getElementById(`follow_up_tasks${index + 1}`).innerHTML.trim();

        tasks.push({
            task_goal: task_goal,
            task_description: task_description,
            task_expected_difficulty: task_expected_difficulty,
            task_planned_approach: task_planned_approach,
            task_start_summary: task_start_summary,
            task_progress_notes: task_progress_notes,
            challenges_encountered: challenges_encountered,
            research_questions: research_questions,
            tools_used: tools_used,
            reflection_successes: reflection_successes,
            reflection_failures: reflection_failures,
            output_or_result: output_or_result,
            time_spent_coding: time_spent_coding,
            time_spent_researching: time_spent_researching,
            time_spent_debugging: time_spent_debugging,
            follow_up_tasks: follow_up_tasks,
            task_reflection_summary: task_reflection_summary
        });
    });
    const date = document.getElementById("blogDateSelector").value
    console.log(`Saving blog for date: ${date}`)

    // Create the blog object
    const today_blog = {
        date: date,
        introduction: introduction,
        tasks: tasks,
        reflection: reflection
    };

    // Send the JSON object to Flask via a POST request
    fetch('/submit-blog', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(today_blog),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function toggleSection(sectionId) {
    var element = document.getElementById(sectionId);
    var icon = document.getElementById('icon-' + sectionId);
    if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
        icon.textContent = '−'; // Change to minus
        icon.classList.add('rotate-180'); // Rotate icon if desired
    } else {
        element.classList.add('hidden');
        icon.textContent = '+';
        icon.classList.remove('rotate-180');
    }
}

function updateSliderColor(sliderId) {
    const slider = document.getElementById(sliderId);
    const value = parseInt(slider.value, 10); // Convert the value to an integer for accurate comparison
    let newColorClass;

    // Determine the new color class based on the slider's value
    switch (sliderId) {
        case 'enthusiasm_level':
            newColorClass = value > 66 ? 'bg-green-500' : value > 33 ? 'bg-yellow-500' : 'bg-red-500';
            break;
        case 'burnout_level':
            newColorClass = value > 66 ? 'bg-red-500' : value > 33 ? 'bg-yellow-500' : 'bg-green-500';
            break;
        case 'leetcode_hatred_level':
            newColorClass = value > 66 ? 'bg-red-500' : value > 33 ? 'bg-purple-500' : 'bg-blue-500';
            break;
        case 'focus_level':
            newColorClass = value > 66 ? 'bg-green-500' : value > 33 ? 'bg-orange-500' : 'bg-red-500';
            break;
        case 'productivity_level':
            newColorClass = value > 66 ? 'bg-green-500' : value > 33 ? 'bg-green-300' : 'bg-green-100';
            break;
        case 'distraction_level':
            newColorClass = value > 66 ? 'bg-yellow-500' : value > 33 ? 'bg-yellow-300' : 'bg-yellow-100';
            break;
        case 'desire_to_play_steam_games_level':
            newColorClass = value > 66 ? 'bg-purple-500' : value > 33 ? 'bg-purple-300' : 'bg-purple-100';
            break;
        case 'overall_frustration_level':
            newColorClass = value > 66 ? 'bg-red-500' : value > 33 ? 'bg-red-300' : 'bg-red-100';
            break;
    }

    // Remove all potential color classes and then add the new one
    slider.className = slider.className.replace(/bg-(red|yellow|green|blue|purple|orange)-[1-9]00/g, '') + ` ${newColorClass}`;
}
