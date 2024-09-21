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

interface AnnotateBlogDialogProps {
	selectedBlogId: string; // Add more properties to this type as needed
	setActiveTask: (taskId: string | null) => void;
	activeTask: string | null;
}

export const AnnotateBlogDialog: React.FC<AnnotateBlogDialogProps> = ({ selectedBlogId, setActiveTask, activeTask }) => {
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
		const task_to_reset = activeTask;
		setActiveTask(null)
		setTimeout(() => {
			setActiveTask(task_to_reset);
		}, 1000); // Delay in milliseconds
	};

	const handleEdit = async () => {
		setIsOpen(true);
		if (!selectedBlog) {
			throw new Error("SelectedBlog is null!");
		}
		setEditingInProgress(true)
	
		try {
			setStatusMessage('Dave is adding annotations and comments to your blog...');
			const blogResponse = await fetch(`http://localhost:8080/api/annotate_blog`, { 
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(selectedBlog)
			});
			const blogData = await blogResponse.json(); // Assuming response is in JSON format
			if (blogResponse.ok) {
				console.log(JSON.stringify(blogData))
				// db.transact([tx.dailyBlogs[selectedBlog.id].update(blogData)]);
				//console.log(JSON.stringify(introData))
				setStatusMessage('Finished adding annotations and comments to the blog...');
			} else {
				throw new Error('Failed to update introduction');
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
				<Button className="mx-2 bg-purple-400">Annotate Blog</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Have Dave Add Inline Comments (Custom React Components)</AlertDialogTitle>
					<AlertDialogDescription>
						{statusMessage}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleClose}>Cancel Annotating</AlertDialogCancel>
					{!editingInProgress && (<Button onClick={handleEdit} >Start Annotating</Button>)}
					
				</AlertDialogFooter>
				
			</AlertDialogContent>
		</AlertDialog>
	);
};
