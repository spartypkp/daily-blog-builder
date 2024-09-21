// Import necessary components and types
import React, { useState, useMemo } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { init, tx, id } from '@instantdb/react';
import { DailyBlog, Introduction, Reflection, Task } from '@/lib/types';

interface EditBlogDialogProps {
	selectedBlogId: string; // Add more properties to this type as needed
}

export const EditBlogDialog: React.FC<EditBlogDialogProps> = ({ selectedBlogId }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [statusMessage, setStatusMessage] = useState('');
	const [editingInProgress, setEditingInProgress] = useState(false);
	

	const APP_ID = '3b4a73a0-ffc6-488a-b883-550004ff6e0a';

	type Schema = {
		dailyBlogs: DailyBlog;
	};

	const db = init<Schema>({ appId: APP_ID });

	const query = {
		dailyBlogs: {
			$: {
				where: {
					id: selectedBlogId
				},
			},
			tasks: {},
		},

	};
	const { isLoading, error, data } = db.useQuery(query)
	

	const handleClose = () => {
		setIsOpen(false);
		setStatusMessage('');
	};

	// export interface DailyBlog {
	// 	id?: string;
	// 	date: string;
	// 	day_count: number;
	// 	blog_title: string;
	// 	blog_description: string;
	// 	blog_tags: any;
	// 	introduction?: Introduction;
	// 	tasks?: ({ id: string; } & Task)[];
	// 	reflection?: Reflection;
	// 	status: string | null;
	// 	created_at?: string;
	// 	updated_at?: string;
	// }

	const handleEdit = async () => {
		setIsOpen(true);
		if (!selectedBlog) {
			throw new Error("SelectedBlog is null!");
		}
		setEditingInProgress(true)
	
		try {
			setStatusMessage('Dave is editing the introduction...');
			const introResponse = await fetch(`http://localhost:8080/api/edit_introduction`, { 
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(selectedBlog.introduction!)
			});
			const introData: Introduction = await introResponse.json(); // Assuming response is in JSON format
			if (introResponse.ok) {
				// db.transact([tx.dailyBlogs[selectedBlog.id].update({"introduction": introData})]);
				console.log(JSON.stringify(introData))
				setStatusMessage('Introduction updated. Now updating the task...');
			} else {
				throw new Error('Failed to update introduction');
			}
	
			const taskResponse = await fetch(`http://localhost:8080/api/edit_task`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({tasks: selectedBlog.tasks!})
			});
			const taskData: Task[] = await taskResponse.json(); // Assuming response is in JSON format
			if (taskResponse.ok) {
				taskData.map((task) => {
					console.log(JSON.stringify(task))
					// db.transact([tx.tasks[task.id].update(task)]);
				})
				
				setStatusMessage('Tasks are editing. Now updating reflection...');
			} else {
				throw new Error('Failed to update task');
			}
	
			const reflectionResponse = await fetch(`http://localhost:8080/api/edit_reflection`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: selectedBlog.id,
					date: selectedBlog.date,
					day_count: selectedBlog.day_count,
					introduction: introData,
					tasks: taskData,
					reflection: selectedBlog.reflection!,
					status: selectedBlog.status,
					created_at: selectedBlog.created_at!,
					updated_at: selectedBlog.updated_at!
				})
			});
			const reflectionData: Reflection = await reflectionResponse.json(); // Assuming response is in JSON format
			if (reflectionResponse.ok) {
				console.log(JSON.stringify(reflectionData))
				// db.transact([tx.dailyBlogs[selectedBlog.id].update({"reflection": reflectionData})]);
				setStatusMessage('Reflection updated. All updates completed.');
			} else {
				throw new Error('Failed to update reflection');
			}

	
			setTimeout(handleClose, 2000); // Delay the dialog close to show final message
		} catch (error) {
			setStatusMessage('Error during update. Please try again.');
			console.error('Editing error:', error);
		}
		setEditingInProgress(false)
	};
	
	const selectedBlog: ({ id: string; } & DailyBlog) | undefined = useMemo(() => {
		if (!isLoading) {
			const blog = data?.dailyBlogs[0]
			return blog;
		} else {
			return undefined;
		}
	}, [selectedBlogId, isLoading]);

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="outline">Edit Blog</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Have Dave Edit Today's Blog</AlertDialogTitle>
					<AlertDialogDescription>
						<p>{statusMessage}</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleClose}>Cancel Editing</AlertDialogCancel>
					{!editingInProgress && (<Button onClick={handleEdit}>Start Editing</Button>)}
					
				</AlertDialogFooter>
				
			</AlertDialogContent>
		</AlertDialog>
	);
};
