from flask import Flask, render_template, request, redirect, url_for
import datetime
from datetime import date
from werkzeug.utils import secure_filename
from flask import jsonify
import os
from pydantic import ValidationError
from pydanticModels import DailyBlog, Task, Introduction, Reflection
from utilityFunctions import pydantic_upsert, pydantic_select, upload_to_supabase, pydantic_update
from typing import List, Optional
from dave import ai_edit_introduction, ai_edit_task, ai_edit_reflection
from pydantic import parse_obj_as 

# If localhost won't connect: chrome://net-internals/#sockets
app = Flask(__name__)



@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "Shit! Fuck! Bitch!",
        
    })
# @app.route('/')
# def home():
#     print(F"Starting up home route!")
#     selected_date = request.args.get('date', date.today().isoformat())  # Get date from URL query parameter or default to today

#     today_blog = get_blog_by_date(selected_date)
#     print(f"Today blog found!")

#     if today_blog:
#         print(f"Blog for {selected_date} already exists!")
#     else:
#         print(f"No blog found for {selected_date}, showing empty template.")

#     return render_template('home.html', today_blog=today_blog, today_date=selected_date)



@app.route('api/edit_introduction', methods=['POST'])
def edit_introduction():
    return jsonify({"message": "WHATUP BITCH"})
    # data = request.get_json()
    # intro_model = Introduction(**data)
    # updated_intro = ai_edit_introduction(intro_model)

    # return jsonify(updated_intro.dict())

@app.route('api/edit_task', methods=['POST'])
def edit_task():
    data = request.get_json()
    
    tasks = []
    for object in data['tasks']:
        task = Task(**object)
        tasks.append(task)

    # Process each task using the AI edit function and collect results
    updated_tasks = ai_edit_task(tasks)

    # Convert list of updated Task models back to JSON
    return jsonify(updated_tasks)

@app.route('api/edit_reflection', methods=['POST'])
def edit_reflection():
    data = request.get_json()
    reflection_model = DailyBlog(**data)
    updated_blog = ai_edit_reflection(reflection_model)
    return updated_blog


# @app.route('/api/available_dates')
# def available_dates():
#     today = datetime.date.today().isoformat()
#     dates = fetch_blog_dates()  # This function needs to query your database for all unique blog dates
    
#     if today not in dates:
#         dates.append(today)
#     dates.sort(reverse=True)
    
#     return jsonify(dates)

# @app.route('/api/blog_by_date/<date>', methods=['GET'])
# def get_blog_by_date(date):
#     blog = fetch_blog_by_date(date)
#     if blog.tasks == []:
#         blog.tasks.append(Task())
#     if blog:
#         return jsonify(blog.dict())
#     return jsonify({'error': 'Blog not found'}), 404
    
# @app.route('/save-blog', methods=['POST'])
# def save_blog():
#     try:
#         # Parse the incoming JSON data
#         data = request.get_json()

#         # Add today's date to the JSON data (assuming 'date' is the primary key)
#           # Format as 'YYYY-MM-DD'
        
#         # Validate the incoming data using the DailyBlog Pydantic model
#         daily_blog = DailyBlog(**data)

#         # Log the parsed data for debugging (Optional)
        
#         daily_blog.updated_at = datetime.datetime.now()
        
#         # Perform the upsert operation on the 'daily_blogs' table
#         pydantic_upsert(
#             table_name="daily_blogs", 
#             models=[daily_blog], 
#             where_field="date"
#         )

#         # Return a success response
#         return jsonify({"message": "Blog successfully saved!"}), 200

#     except ValidationError as e:
#         # Handle validation errors from Pydantic
#         print(f"Validation Error: {e}")
#         return jsonify({"error": "Invalid data", "details": e.errors()}), 400

#     except Exception as e:
#         # Handle other exceptions
#         print(f"Error: {e}")
#         return jsonify({"error": "An error occurred while saving the blog"}), 500
    
# @app.route('/publish-blog', methods=['POST']) 
# def publish_blog():
#     try:
#         # Parse the incoming JSON data
#         data = request.get_json()

#         # Add today's date to the JSON data (assuming 'date' is the primary key)
#           # Format as 'YYYY-MM-DD'
        
#         # Validate the incoming data using the DailyBlog Pydantic model
#         daily_blog = DailyBlog(**data)

#         # Log the parsed data for debugging (Optional)
        
#         daily_blog.updated_at = datetime.datetime.now()
#         daily_blog.status = "published"
#         # Perform the upsert operation on the 'daily_blogs' table
#         pydantic_upsert(
#             table_name="daily_blogs", 
#             models=[daily_blog], 
#             where_field="date"
#         )

#         # Return a success response
#         return jsonify({"message": "Blog successfully published!"}), 200

#     except ValidationError as e:
#         # Handle validation errors from Pydantic
#         print(f"Validation Error: {e}")
#         return jsonify({"error": "Invalid data", "details": e.errors()}), 400

#     except Exception as e:
#         # Handle other exceptions
#         print(f"Error: {e}")
#         return jsonify({"error": "An error occurred while publishing the blog"}), 500

# @app.route('/upload_image', methods=['POST'])
# def upload_image():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No file part'}), 400

#     file = request.files['image']
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     if file and allowed_file(file.filename):  # Implement this function to check file extensions
#         filename = secure_filename(file.filename)
#         save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

#         # Save the file locally for backup
#         file.save(save_path)

#         # Upload the file to Supabase
#         result = upload_to_supabase(save_path, 'daily-blogs', f"images/{filename}")
        
#         print(result)
#         if result['success']:
#             return jsonify({'path': result['url']}), 200
#         else:
            
#             return jsonify({'error': 'Failed to upload image', 'details': result}), 500

#     return jsonify({'error': 'Invalid file format'}), 


# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# def allowed_file(filename):
#     # This function will return True if file extension is allowed
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def fetch_blog_dates():
#     # Example SQL query to fetch all unique blog dates
#     results: List[DailyBlog] = pydantic_select(f"SELECT * FROM daily_blogs ORDER BY date DESC;", modelType=DailyBlog)
    
#     return [result.date.isoformat() for result in results]

# def fetch_blog_by_date(date: str = None):
#     if date is None:
#         date = datetime.date.today().isoformat()  # Get today's date as a string in ISO format
    
#     # Parse the input string date to datetime.date object
#     parsed_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()

#     # Define the start date
    

#     # Fetch a blog by its date
#     query = f"SELECT * FROM daily_blogs WHERE date='{date}';"
#     results = pydantic_select(query, modelType=DailyBlog)
#     start_date = datetime.date(2024, 9, 5)  # Define start date once

#     if results:
#         # Calculate the number of days from start_date to the date of the blog
#         day_count = (parsed_date - start_date).days
#         print(f"Day Count: {day_count}")
#         results[0].day_count = day_count
#         return results[0]
    
#     if parsed_date == datetime.date.today():
#         # If no results and the date is today, return a new empty blog for today
#         empty_blog = DailyBlog(date=date, day_count=(parsed_date - start_date).days)
#         return empty_blog
    
#     return None
if __name__ == '__main__':
    app.run(debug=True, port=8080)
