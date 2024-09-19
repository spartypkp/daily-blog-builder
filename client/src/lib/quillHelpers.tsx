import Quill from "quill";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize the Supabase client (Do this somewhere central in your app)
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY!;
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveToServer(file: File, editor: Quill): Promise<void> {
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
        const bucketName = 'daily-blogs'; // Specify your bucket name here
        const pathOnSupabase = `images/${file.name}`; // Modify the path as needed
        const result = await uploadToSupabase(file, bucketName, pathOnSupabase);
        if (result.success && result.url) {
            insertToEditor(result.url, editor);
        } else {
            console.error('Failed to upload image:', result.error);
        }
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

function insertToEditor(url: string, editor: Quill) {
    const range = editor.getSelection();
    if (range) {
        editor.insertEmbed(range.index, 'image', url);
    }
}


export function selectLocalImage(editor: Quill) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files![0];
      saveToServer(file, editor);
    };
}

async function uploadToSupabase(file: File, bucketName: string, pathOnSupabase: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Convert File to Blob if necessary or use directly
        const fileOptions = { contentType: file.type }; // Ensure the content type is set correctly

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(pathOnSupabase, file, fileOptions);

        if (error) {
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