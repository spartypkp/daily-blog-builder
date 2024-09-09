
from pydanticModels import APIParameters, APIUsage, ChatMessage, DailyBlog, DaveResponse
from typing import List
import utilityFunctions as util
import uuid
import json
import os
from app import upload_to_supabase
from bs4 import BeautifulSoup
import os
import mimetypes
import app

DIR = os.path.dirname(os.path.realpath(__file__))

def main():
    models: List[DailyBlog] = util.pydantic_select(f"SELECT * FROM daily_blogs;", modelType=DailyBlog)
    for model in models:
        update_image_sources_in_blog(model)

def update_image_sources_in_blog(blog: DailyBlog):
    # Iterate over all tasks in the blog
    for task in blog.tasks:
        if task.task_progress_notes:
            updated_html = update_image_sources(task.task_progress_notes)
            task.task_progress_notes = updated_html  # Update the task notes with new image URLs
    util.pydantic_update("daily_blogs", [blog], "date")

def update_image_sources(html_content: str) -> str:
    soup = BeautifulSoup(html_content)
    images = soup.find_all('img')

    for img in images:
        del img['style']
        src = img['src']
        if src.startswith('/static/uploads/'):  # Check if the src is a local path
            filename = os.path.basename(src)
            upload_folder = os.path.join(os.getcwd(), 'static/uploads/')
            local_path = os.path.join(upload_folder, filename)
   
            result = upload_to_supabase(local_path, 'daily-blogs', f"images/{filename}")
            if result['success']:
                img['src'] = result['url']  # Update the src attribute with the new URL
            else:
                print(f"Failed to upload {filename}: {result['error']}")  # Handle errors appropriately
           

    return str(soup)
def build_blog_from_json():
    with open(f"{DIR}/blog.json") as json_data:
        text = json_data.read()
    blog_dct = json.loads(text)
    model = DailyBlog(**blog_dct)
    print(model)
    util.pydantic_insert("daily_blogs", [model])

if __name__ == "__main__":
    main()