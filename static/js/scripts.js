let currentTaskId = 1; // Start from 1 because the initial task is already there

// Function to handle blog initialization
function initializeBlog(blogData) {
    console.log("Inside initializeBlog!")
    console.log(JSON.stringify(blogData))
    if (blogData && blogData.tasks && blogData.tasks.length > 0) {
        setupInitialTask(blogData.tasks[0]); // Prepopulate the first task with existing data
        console.log("Called setupInitialTask!")
        for (let i = 1; i < blogData.tasks.length; i++) {
            addTask(blogData.tasks[i]); // Add additional tasks
        }
    } else {
        // No blog data, create an empty first task
        setupInitialTask(null);
    }
    selectTab(1); // Ensure this is called after the DOM is fully loaded
    initializeEditor("editor-container1");
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
            initializeBlog(null); // Initialize with no blog data
        });
});

function setupInitialTask(taskData) {
    const initialTabButton = document.createElement('button');
    initialTabButton.textContent = 'Task 1';
    initialTabButton.dataset.taskId = 1;
    initialTabButton.className = 'task-tab px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap';
    initialTabButton.onclick = function () { selectTab(1); };
    document.querySelector('.tab-buttons').appendChild(initialTabButton);

    // Populate the initial task's content with either taskData or default values
    const task_description = taskData ? taskData.task_description : '';
    const difficulty = taskData ? taskData.difficulty : 5;
    const reflection = taskData ? taskData.reflection : '';
    const time_spent = taskData ? taskData.time_spent : '';
    const distraction_meter = taskData ? taskData.distraction_meter : 5;
    const next_steps = taskData ? taskData.next_steps : '';

    const initialTabContent = document.querySelector('#taskContent1');
    initialTabContent.querySelector('textarea[placeholder="Task description..."]').value = task_description;
    initialTabContent.querySelector('input[type="range"]').value = difficulty;
    initialTabContent.querySelector('textarea[placeholder="Reflections on the task..."]').value = reflection;
    initialTabContent.querySelector('input[type="text"]').value = time_spent;
    initialTabContent.querySelector('input[type="range"][min="1"]').value = distraction_meter;
    initialTabContent.querySelector('textarea[placeholder="What\'s next?"]').value = next_steps;
}

function addTask(taskData) {
    console.log("AddTask called!")
    console.log(JSON.stringify(taskData))
    currentTaskId++;
    const newTaskId = currentTaskId;
    const tabButton = document.createElement('button');
    tabButton.textContent = 'Task ' + newTaskId;
    tabButton.dataset.taskId = newTaskId;
    tabButton.className = 'task-tab px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap';
    tabButton.onclick = function () { selectTab(newTaskId); };
    document.querySelector('.tab-buttons').appendChild(tabButton);

    const task_description = taskData ? taskData.task_description : '';
    const difficulty = taskData ? taskData.difficulty : 5;
    const reflection = taskData ? taskData.reflection : '';
    const time_spent = taskData ? taskData.time_spent : '';
    const distraction_meter = taskData ? taskData.distraction_meter : 5;
    const next_steps = taskData ? taskData.next_steps : '';

    const tabContent = document.createElement('div');
    tabContent.className = 'task-content p-4 border rounded hidden';
    tabContent.id = `taskContent${newTaskId}`;
    tabContent.innerHTML = `
    <div class="task-start mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold">Start</h3>
        <label>What I want to do:</label>
        <textarea class="w-full p-2 border border-gray-300 rounded"
            placeholder="Task description...">${task_description}</textarea>
        <label>Expected Difficulty:</label>
        <input type="range" min="1" max="10" value="${difficulty}" class="w-full">
    </div>
    <div class="task-work mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold">Work</h3>
        <label>Notes:</label>
        <div id="editor-container${newTaskId}" style="height: 300px;"></div>
    </div>
    <div class="task-reflection mb-4 bg-white p-4 border rounded">
        <h3 class="font-bold">Reflection</h3>
        <label>General Thoughts:</label>
        <textarea class="w-full p-2 border border-gray-300 rounded"
            placeholder="Reflections on the task...">${reflection}</textarea>
        <label>Time Spent:</label>
        <input type="text" class="w-full p-2 border border-gray-300 rounded" value="${time_spent}">
        <label>Distraction Meter:</label>
        <input type="range" min="1" max="10" value="${distraction_meter}" class="w-full">
        <label>Next Steps:</label>
        <textarea class="w-full p-2 border border-gray-300 rounded" placeholder="What's next?">${next_steps}</textarea>
    </div>
    <button type="button" onclick="removeTask(${newTaskId})"
        class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Task</button>
    `;
    document.getElementById('tabContent').appendChild(tabContent);
    initializeEditor(`editor-container${newTaskId}`);

    selectTab(newTaskId); // Automatically select the new task
}

function selectTab(taskId) {
    const allTabs = document.querySelectorAll('.task-tab');
    const allContents = document.querySelectorAll('.task-content');

    // Hide all task contents and reset tab styles
    allTabs.forEach(tab => {
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

function initializeEditor(editorId) {
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['image']
    ];

    var editor = new Quill(`#${editorId}`, {
        modules: {
            toolbar: toolbarOptions
        },
        placeholder: 'How goes the grinding?',
        theme: 'snow'
    });

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
    }
}

function exportBlog() {
    // Get daily goals and meters
    const daily_goals = document.getElementById('daily-goals').value;
    const enthusiasm = parseInt(document.getElementById('enthusiasm-meter').value);  // Convert to integer
    const burnout = parseInt(document.getElementById('burnout-meter').value);  // Convert to integer
    const leetcode_hatred = parseInt(document.getElementById('leetcode-meter').value);  // Convert to integer

    // Get reflection fields
    const daily_reflection = document.getElementById('daily-reflection').value;
    const next_steps = document.getElementById('next-steps').value;

    // Gather task data
    const tasks = [];
    document.querySelectorAll('.task-content').forEach((taskElement, index) => {
        const task_description = taskElement.querySelector('textarea').value; // Task description
        const difficulty = parseInt(taskElement.querySelector('input[type="range"]').value); // Expected Difficulty
        const quillEditor = document.querySelector(`#editor-container${index + 1}`).__quill; // Access Quill
        const notes = quillEditor.root.innerHTML; // Get Quill editor content
        const reflection = taskElement.querySelector('textarea[placeholder="Reflections on the task..."]').value; // Task reflection
        const time_spent = taskElement.querySelector('input[type="text"]').value; // Time Spent
        const distraction_meter = parseInt(taskElement.querySelector('input[type="range"][min="1"]').value); // Distraction meter
        const next_stepsTask = taskElement.querySelector('textarea[placeholder="What\'s next?"]').value; // Next steps

        // Push structured task data to array
        tasks.push({
            "task_description": task_description,
            "difficulty": difficulty,
            "notes": notes,
            "reflection": reflection,
            "time_spent": time_spent,
            "distraction_meter": distraction_meter,
            "next_steps": next_stepsTask
        });
    });

    // Create a structured JSON object
    const today_blog = {
        "daily_goals": daily_goals,
        "enthusiasm": enthusiasm,
        "burnout": burnout,
        "leetcode_hatred": leetcode_hatred,
        "tasks": tasks,
        "daily_reflection": daily_reflection,
        "next_steps": next_steps
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
