'use client';

import { init, tx, id } from '@instantdb/react';
import IntroductionSection from './components/introduction';
import ReflectionSection from './components/reflection';
// ID for app: Daily Blog Builder
const APP_ID = 'cde1ad29-8e6e-4f5f-bff9-57d6a7d96731';

// Optional: Declare your schema for intellisense!
type Schema = {
	todos: Todo;
};

const db = init<Schema>({ appId: APP_ID });

function edit_blog() {
	return;
}
function fetchBlogData(date: string) {
	return;
}
function updateSliderColor(field_name: string): string {
	return "";
}
function add_task() {
	return
}
function publish_blog() {
	return
}

function App() {
	// Read Data
	const { isLoading, error, data } = db.useQuery({ todos: {} });
	if (isLoading) {
		return <div>Fetching data...</div>;
	}
	if (error) {
		return <div>Error fetching data: {error.message}</div>;
	}
	const { todos } = data;
	return (
		<body className="bg-white p-4">
			<header className="text-center mb-6">
				<h1 className="text-5xl font-bold">Daily Blog Builder</h1>

				<select id="blogDateSelector" onChange={(e) => fetchBlogData(e.target.value)}>

				</select>
				<div className="mt-4 bg-white rounded-lg p-4">
					<h2 className="text-3xl font-bold text-gray-800 text-center">Day Number</h2>
					<p id="day_count" className="text-m  text-gray-800 text-center"></p>
					<h2 className="text-3xl font-bold text-gray-800 text-center">Blog Title</h2>
					<p id="blog_title" className="text-m  text-gray-800 text-center"></p>
					<h2 className="text-3xl font-bold text-gray-800 text-center">Blog Description</h2>
					<p id="blog_description" className="text-m  text-gray-800 text-center"></p>

				</div>


			</header>

			<section className="goals mb-8 bg-gray-200 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center">
					

				</div>
				<IntroductionSection intro={null} updateSliderColor={updateSliderColor} />

			</section>

			<section className="tasks mb-8 bg-gray-200 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center">

				</div>
				<div id="daily-tasks" className="mx-auto hidden">
					<div id="tabs-container" className="tabs-container flex justify-center mb-2 border-b border-gray-300">

					</div>
					<div className="text-center">
						<button type="button" onClick={(e) => add_task()}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150">+
							Add Task</button>
					</div>
					<div className="tab-content mt-4" id="tabContent">

					</div>
				</div>
			</section>


			<section className="reflection mb-8 bg-gray-200 shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center">

				</div>
				<ReflectionSection reflection={null} updateSliderColor={updateSliderColor} />
			</section>



			<footer className="text-center">
				<button type="button" onClick={(e) =>edit_blog()}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Edit Blog</button>
				<button type="button" onClick={(e) =>publish_blog()}
					className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Publish Blog</button>
			</footer>
		</body >
	);
}

// Write Data
// ---------
function addTodo(text: string) {
	db.transact(
		tx.todos[id()].update({
			text,
			done: false,
			createdAt: Date.now(),
		})
	);
}

function deleteTodo(todo: Todo) {
	db.transact(tx.todos[todo.id].delete());
}

function toggleDone(todo: Todo) {
	db.transact(tx.todos[todo.id].update({ done: !todo.done }));
}

function deleteCompleted(todos: Todo[]) {
	const completed = todos.filter((todo) => todo.done);
	const txs = completed.map((todo) => tx.todos[todo.id].delete());
	db.transact(txs);
}

function toggleAll(todos: Todo[]) {
	const newVal = !todos.every((todo) => todo.done);
	db.transact(todos.map((todo) => tx.todos[todo.id].update({ done: newVal })));
}

// Components
// ----------
function TodoForm({ todos }: { todos: Todo[]; }) {
	return (
		<div style={styles.form}>
			<div style={styles.toggleAll} onClick={() => toggleAll(todos)}>
				⌄
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					addTodo(e.target[0].value);
					e.target[0].value = '';
				}}
			>
				<input
					style={styles.input}
					autoFocus
					placeholder="What needs to be done?"
					type="text"
				/>
			</form>
		</div>
	);
}

function TodoList({ todos }: { todos: Todo[]; }) {
	return (
		<div style={styles.todoList}>
			{todos.map((todo) => (
				<div key={todo.id} style={styles.todo}>
					<input
						type="checkbox"
						key={todo.id}
						style={styles.checkbox}
						checked={todo.done}
						onChange={() => toggleDone(todo)}
					/>
					<div style={styles.todoText}>
						{todo.done ? (
							<span style={{ textDecoration: 'line-through' }}>
								{todo.text}
							</span>
						) : (
							<span>{todo.text}</span>
						)}
					</div>
					<span onClick={() => deleteTodo(todo)} style={styles.delete}>
						𝘟
					</span>
				</div>
			))}
		</div>
	);
}

function ActionBar({ todos }: { todos: Todo[]; }) {
	return (
		<div style={styles.actionBar}>
			<div>Remaining todos: {todos.filter((todo) => !todo.done).length}</div>
			<div style={{ cursor: 'pointer' }} onClick={() => deleteCompleted(todos)}>
				Delete Completed
			</div>
		</div>
	);
}

// Types
// ----------
type Todo = {
	id: string;
	text: string;
	done: boolean;
	createdAt: number;
};

// Styles
// ----------
const styles: Record<string, React.CSSProperties> = {
	container: {
		boxSizing: 'border-box',
		backgroundColor: '#fafafa',
		fontFamily: 'code, monospace',
		height: '100vh',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	header: {
		letterSpacing: '2px',
		fontSize: '50px',
		color: 'lightgray',
		marginBottom: '10px',
	},
	form: {
		boxSizing: 'inherit',
		display: 'flex',
		border: '1px solid lightgray',
		borderBottomWidth: '0px',
		width: '350px',
	},
	toggleAll: {
		fontSize: '30px',
		cursor: 'pointer',
		marginLeft: '11px',
		marginTop: '-6px',
		width: '15px',
		marginRight: '12px',
	},
	input: {
		backgroundColor: 'transparent',
		fontFamily: 'code, monospace',
		width: '287px',
		padding: '10px',
		fontStyle: 'italic',
	},
	todoList: {
		boxSizing: 'inherit',
		width: '350px',
	},
	checkbox: {
		fontSize: '30px',
		marginLeft: '5px',
		marginRight: '20px',
		cursor: 'pointer',
	},
	todo: {
		display: 'flex',
		alignItems: 'center',
		padding: '10px',
		border: '1px solid lightgray',
		borderBottomWidth: '0px',
	},
	todoText: {
		flexGrow: '1',
		overflow: 'hidden',
	},
	delete: {
		width: '25px',
		cursor: 'pointer',
		color: 'lightgray',
	},
	actionBar: {
		display: 'flex',
		justifyContent: 'space-between',
		width: '328px',
		padding: '10px',
		border: '1px solid lightgray',
		fontSize: '10px',
	},
	footer: {
		marginTop: '20px',
		fontSize: '10px',
	},
};

export default App;