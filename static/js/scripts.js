let currentTaskId = 0; // Start from 1 because the initial task is already there

function initializeBlog(blogData) {
    
    // Set the values for Introduction section fields
    if (blogData.introduction) {
        document.getElementById('daily_goals').value = blogData.introduction.daily_goals || '';
        document.getElementById('learning_focus').value = blogData.introduction.learning_focus || '';
        document.getElementById('challenges').value = blogData.introduction.challenges || '';
        document.getElementById('plan_of_action').value = blogData.introduction.plan_of_action || '';
        document.getElementById('personal_context').value = blogData.introduction.personal_context || '';

        // Set the mood sliders
        document.getElementById('enthusiasm_level').value = blogData.introduction.enthusiasm_level || 50;
        document.getElementById('burnout_level').value = blogData.introduction.burnout_level || 50;
        document.getElementById('focus_level').value = blogData.introduction.focus_level || 50;
        document.getElementById('leetcode_hatred_level').value = blogData.introduction.leetcode_hatred_level || 50;
    }

    // Set the values for Reflection section fields
    if (blogData.reflection) {
        document.getElementById('technical_challenges').value = blogData.reflection.technical_challenges || '';
        document.getElementById('interesting_bugs').value = blogData.reflection.interesting_bugs || '';
        document.getElementById('unanswered_questions').value = blogData.reflection.unanswered_questions || '';
        document.getElementById('learning_outcomes').value = blogData.reflection.learning_outcomes || '';
        document.getElementById('next_steps_short_term').value = blogData.reflection.next_steps_short_term || '';
        document.getElementById('next_steps_long_term').value = blogData.reflection.next_steps_long_term || '';

        // Set the self-reflective mood sliders
        document.getElementById('productivity_level').value = blogData.reflection.productivity_level || 50;
        document.getElementById('distraction_level').value = blogData.reflection.distraction_level || 50;
        document.getElementById('desire_to_play_steam_games_level').value = blogData.reflection.desire_to_play_steam_games_level || 50;
        document.getElementById('overall_frustration_level').value = blogData.reflection.overall_frustration_level || 50;
    }
    console.log(`Blog Data: ${JSON.stringify(blogData, null, 2)}`)
    // Add a new task for however many tasks there are
    for (let i = 0; i < blogData.tasks.length; i++) {
        addTask(blogData.tasks[i]); // Add additional tasks
    }
    
    selectTab(1); // Ensure this is called after the DOM is fully loaded
    
}


// Fetch today's blog data using AJAX
document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/today_blog')
        .then(response => response.json())
        .then(blogData => {
            initializeBlog(blogData);
        })
        .catch(error => {
            console.error('Error fetching blog data:', error);
        });


    // Add the event listener to textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', autoResizeTextArea);
        // Initialize each textarea to resize on page load
        autoResizeTextArea({ target: textarea });
    });
});

function autoResizeTextArea(event) {
    event.target.style.height = 'auto';  // Reset the height
    event.target.style.height = event.target.scrollHeight + 'px';  // Set the height based on scroll height
}

function addTask(taskData) {
    currentTaskId++;
    const newTaskId = currentTaskId;
    console.log(`Current newTaskId: ${newTaskId}`)

    // Create the tab button for the new task
    const tabButton = document.createElement('button');
    tabButton.textContent = 'Task ' + newTaskId;
    tabButton.dataset.taskId = newTaskId;
    tabButton.className = 'task-tab px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap';
    tabButton.onclick = function () { selectTab(newTaskId); };
    document.querySelector('.tab-buttons').appendChild(tabButton);

    // Populate task fields with values from taskData (if available) or defaults
    const task_goal = taskData?.task_goal || '';
    const task_description = taskData?.task_description || '';
    const task_expected_difficulty = taskData?.task_expected_difficulty || 50;
    const task_planned_approach = taskData?.task_planned_approach || '';
    
    const task_progress_notes = taskData?.task_progress_notes || '';
    const challenges_encountered = taskData?.challenges_encountered || '';
    const research_questions = taskData?.research_questions || '';
    
    const tools_used = taskData?.tools_used || '';
    const reflection_successes = taskData?.reflection_successes || '';
    const reflection_failures = taskData?.reflection_failures || '';
    const output_or_result = taskData?.output_or_result || '';
    const time_spent_coding = taskData?.time_spent_coding || '';
    const time_spent_researching = taskData?.time_spent_researching || '';
    const time_spent_debugging = taskData?.time_spent_debugging || '';
    const follow_up_tasks = taskData?.follow_up_tasks || '';

    // Create the task content (HTML)
    const tabContent = document.createElement('div');
    tabContent.className = 'task-content p-4 border rounded hidden';
    tabContent.id = `taskContent${newTaskId}`;
    
    tabContent.innerHTML = `
    <!-- Task Start -->
    <div class="task-start mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold">Task Start</h3>
        <label for="task_goal${newTaskId}">Task Goal:</label>
        <textarea id="task_goal${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="Desired outcome or goal for the task..." oninput="autoResizeTextArea(event)">${task_goal}</textarea>
        
        <label for="task_description${newTaskId}" class="block mt-2">Task Description:</label>
        <textarea id="task_description${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="Task description..." oninput="autoResizeTextArea(event)">${task_description}</textarea>
        
        <label for="task_expected_difficulty${newTaskId}" class="block mt-2">Expected Difficulty:</label>
        <input type="range" id="task_expected_difficulty${newTaskId}" min="1" max="100" value="${task_expected_difficulty}" class="w-full">
        
        <label for="task_planned_approach${newTaskId}" class="block mt-2">Planned Approach:</label>
        <textarea id="task_planned_approach${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="Planned approach or strategy to solve the problem..." oninput="autoResizeTextArea(event)">${task_planned_approach}</textarea>
    </div>

    <!-- Task Work -->
    <div class="task-work mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold">Task Work</h3>
        <label for="task_progress_notes${newTaskId}" class="block">Progress Notes:</label>
        <div id="task_progress_notes${newTaskId}" class="min-h-[300px]">${task_progress_notes}</div>

        <label for="challenges_encountered${newTaskId}" class="block mt-4">Challenges Encountered:</label>
        <textarea id="challenges_encountered${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="Key challenges or bugs encountered..." oninput="autoResizeTextArea(event)">${challenges_encountered}</textarea>

        <label for="research_questions${newTaskId}" class="block mt-4">Research Questions:</label>
        <textarea id="research_questions${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="List of research questions that arose while working on the task..."
            oninput="autoResizeTextArea(event)">${research_questions}</textarea>
    </div>

    <!-- Task Reflection -->
    <div class="task-reflection mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold">Task Reflection</h3>

        <label for="tools_used${newTaskId}" class="block">Tools Used:</label>
        <textarea id="tools_used${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="Key tools, libraries, or frameworks used during the task..." oninput="autoResizeTextArea(event)">${tools_used}</textarea>

        <label for="reflection_successes${newTaskId}" class="block mt-4">Successes:</label>
        <textarea id="reflection_successes${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="What worked well during the task?" oninput="autoResizeTextArea(event)">${reflection_successes}</textarea>

        <label for="reflection_failures${newTaskId}" class="block mt-4">Failures or Shortcomings:</label>
        <textarea id="reflection_failures${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="What didn’t work and why?" oninput="autoResizeTextArea(event)">${reflection_failures}</textarea>

        <label for="output_or_result${newTaskId}" class="block mt-4">Output or Result:</label>
        <textarea id="output_or_result${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="The outcome or deliverable from this task (e.g., code, documentation)." oninput="autoResizeTextArea(event)">${output_or_result}</textarea>

        <!-- Time Spent Fields -->
        <label for="time_spent_coding${newTaskId}" class="block mt-4">Time Spent Coding:</label>
        <input type="text" id="time_spent_coding${newTaskId}" class="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter coding time spent (e.g., 2 hours)" value="${time_spent_coding}"/>

        <label for="time_spent_researching${newTaskId}" class="block mt-4">Time Spent Researching:</label>
        <input type="text" id="time_spent_researching${newTaskId}" class="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter research time spent (e.g., 30 minutes)" value="${time_spent_researching}"/>

        <label for="time_spent_debugging${newTaskId}" class="block mt-4">Time Spent Debugging:</label>
        <input type="text" id="time_spent_debugging${newTaskId}" class="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter debugging time spent (e.g., 45 minutes)" value="${time_spent_debugging}"/>

        <label for="follow_up_tasks${newTaskId}" class="block mt-4">Follow-Up Tasks:</label>
        <textarea id="follow_up_tasks${newTaskId}" class="w-full p-2 border border-gray-300 rounded min-h-[150px]"
            placeholder="Immediate next steps or follow-up tasks..." oninput="autoResizeTextArea(event)">${follow_up_tasks}</textarea>
    </div>

    <button type="button" onclick="removeTask(${newTaskId})"
        class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Task</button>
    `;

    document.getElementById('tabContent').appendChild(tabContent);
    
    // Initialize the Quill editor for the task progress notes
    initializeEditor(newTaskId, task_progress_notes);

    // Select the new task tab
    selectTab(newTaskId);

    // Resize all newly added textAreas
    document.querySelectorAll('textarea').forEach(textarea => {
        autoResizeTextArea({ target: textarea });
    });
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
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
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

function initializeEditor(editorId, notes) {
    Quill.register(ImageFormat, true);
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['image']
    ];

    var editor = new Quill(`#task_progress_notes${editorId}`, {
        modules: {
            toolbar: toolbarOptions
        },
        placeholder: 'How goes the grinding?',
        theme: 'snow'
    });
    if (notes && notes.trim() !== "") {
        editor.clipboard.dangerouslyPasteHTML(notes);
    }

    // Simplify image handling
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
        
        // Wait for the DOM update
        setTimeout(() => {
            const images = editor.container.getElementsByTagName('img');
            if (images.length) {
                Array.from(images).forEach(img => {
                    
                    if (img.src.includes(url)) {
                        img.style.width = '30%';  // Set image width to 50%
                        img.style.height = 'auto'; // Maintain aspect ratio
                    }
                });
            }
        }, 10); // Short delay to ensure the image element is rendered in the DOM
    }
}

function exportBlog() {
    // Introduction Section
    const daily_goals = (document.getElementById('daily_goals').value).trim();
    const learning_focus = (document.getElementById('learning_focus').value).trim();
    const challenges = (document.getElementById('challenges').value).trim();
    const plan_of_action = (document.getElementById('plan_of_action').value).trim();
    const personal_context = (document.getElementById('personal_context').value).trim();

    const enthusiasm_level = parseInt(document.getElementById('enthusiasm_level').value);
    const burnout_level = parseInt(document.getElementById('burnout_level').value);
    const focus_level = parseInt(document.getElementById('focus_level').value);
    const leetcode_hatred_level = parseInt(document.getElementById('leetcode_hatred_level').value);

    const introduction = {
        personal_context: personal_context,
        daily_goals: daily_goals,
        learning_focus: learning_focus,
        challenges: challenges,
        plan_of_action: plan_of_action,
        enthusiasm_level: enthusiasm_level,
        burnout_level: burnout_level,
        focus_level: focus_level,
        leetcode_hatred_level: leetcode_hatred_level
    };

    // Reflection Section
    const technical_challenges = document.getElementById('technical_challenges').value.trim();
    const interesting_bugs = document.getElementById('interesting_bugs').value.trim();
    const unanswered_questions = document.getElementById('unanswered_questions').value.trim();
    const learning_outcomes = document.getElementById('learning_outcomes').value.trim();
    const next_steps_short_term = document.getElementById('next_steps_short_term').value.trim();
    const next_steps_long_term = document.getElementById('next_steps_long_term').value.trim();

    const productivity_level = parseInt(document.getElementById('productivity_level').value);
    const distraction_level = parseInt(document.getElementById('distraction_level').value);
    const desire_to_play_steam_games_level = parseInt(document.getElementById('desire_to_play_steam_games_level').value);
    const overall_frustration_level = parseInt(document.getElementById('overall_frustration_level').value);

    const reflection = {
        technical_challenges: technical_challenges,
        interesting_bugs: interesting_bugs,
        unanswered_questions: unanswered_questions,
        learning_outcomes: learning_outcomes,
        next_steps_short_term: next_steps_short_term,
        next_steps_long_term: next_steps_long_term,
        productivity_level: productivity_level,
        distraction_level: distraction_level,
        desire_to_play_steam_games_level: desire_to_play_steam_games_level,
        overall_frustration_level: overall_frustration_level,
    };

    // Task Section
    const tasks = [];
    document.querySelectorAll('.task-content').forEach((taskElement, index) => {
        const task_goal = document.getElementById(`task_goal${index + 1}`).value.trim();
        const task_description = document.getElementById(`task_description${index + 1}`).value.trim();
        const task_expected_difficulty = parseInt(document.getElementById(`task_expected_difficulty${index + 1}`).value);
        const task_planned_approach = document.getElementById(`task_planned_approach${index + 1}`).value.trim();

        const quillEditor = document.querySelector(`#task_progress_notes${index + 1}`).__quill; // Access Quill
        const task_progress_notes = quillEditor.root.innerHTML.trim(); // Get Quill editor content

        const challenges_encountered = document.getElementById(`challenges_encountered${index + 1}`).value.trim();
        const research_questions = document.getElementById(`research_questions${index + 1}`).value.trim();

        const tools_used = document.getElementById(`tools_used${index + 1}`).value.trim();
        const reflection_successes = document.getElementById(`reflection_successes${index + 1}`).value.trim();
        const reflection_failures = document.getElementById(`reflection_failures${index + 1}`).value.trim();
        const output_or_result = document.getElementById(`output_or_result${index + 1}`).value.trim();

        const time_spent_coding = document.getElementById(`time_spent_coding${index + 1}`).value.trim();
        const time_spent_researching = document.getElementById(`time_spent_researching${index + 1}`).value.trim();
        const time_spent_debugging = document.getElementById(`time_spent_debugging${index + 1}`).value.trim();

        const follow_up_tasks = document.getElementById(`follow_up_tasks${index + 1}`).value.trim();

        tasks.push({
            task_goal: task_goal,
            task_description: task_description,
            task_expected_difficulty: task_expected_difficulty,
            task_planned_approach: task_planned_approach,
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
            follow_up_tasks: follow_up_tasks
        });
    });

    // Create the blog object
    const today_blog = {
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

