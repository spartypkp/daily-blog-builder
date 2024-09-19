import Quill from "quill";
import { RefObject } from "react";

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Toolbar from "quill/modules/toolbar";
// Initialize the Supabase client (Do this somewhere central in your app)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveToServer(file: File, quill: Quill): Promise<void> {
	console.log(`Calling saveToServer!`)
	// Check if the file is valid
	if (!file || file.size === 0) {
		console.error('Error: No file selected');
		return;
	}

	// Check for file extension
	const validExtensions = ['jpg', 'jpeg', 'png', 'gif']; // Add other supported extensions here
	const extension = file.name.split('.').pop();
	if (!validExtensions.includes(extension!)) {
		console.error('Error: Invalid file format');
		return;
	}

	// Upload the file directly
	try {
		const newFileName = file.name.replaceAll(" ", "_").replaceAll(" ", "_")
		const bucketName = 'daily-blogs'; // Specify your bucket name here
		const pathOnSupabase = `images/${newFileName}`; // Modify the path as needed
		console.log(`pathOnSupabase: ${pathOnSupabase}`)
		const result = await uploadToSupabase(file, bucketName, pathOnSupabase);
		if (result.success && result.url) {
			insertToEditor(result.url, quill);
		} else {
			console.error('Failed to upload image:', result.error);
		}
	} catch (error) {
		console.error('Error uploading image:', error);
	}
}

function insertToEditor(url: string, quill: Quill) {
	
	const range = quill.getSelection(true)
	if (range) {
		quill.insertEmbed(range.index, 'image', url);
	}
}


export function selectLocalImage(quill: Quill) {
	
	const input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.setAttribute('accept', 'image/*');
	

	input.onchange = () => {
		const file = input.files![0];
		
		saveToServer(file, quill);
	};
	input.click();
}

async function uploadToSupabase(file: File, bucketName: string, pathOnSupabase: string): Promise<{ success: boolean; url?: string; error?: string; }> {
	try {
		// Convert File to Blob if necessary or use directly
		

		const { data, error } = await supabase
			.storage
			.from(bucketName)
			.upload(pathOnSupabase, file, {
				cacheControl: '3600',
				upsert: true
			});

		if (error) {
			console.log(error)
			throw error;
		}

		if (data) {
			const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${pathOnSupabase}`;
			
			return { success: true, url: storageUrl };
		}

		return { success: false, error: 'No data returned from Supabase.' };
	} catch (error: any) {
		console.error('Upload error:', error.message);
		return { success: false, error: error.message };
	}
}
