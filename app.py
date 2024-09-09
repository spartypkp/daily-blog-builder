from flask import Flask, render_template, request, redirect, url_for
import datetime
from datetime import date
from werkzeug.utils import secure_filename
from flask import jsonify
import os
from pydantic import ValidationError
from pydanticModels import DailyBlog, Task, Introduction, Reflection
from utilityFunctions import pydantic_upsert, pydantic_select
from typing import List, Optional

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'static/uploads/')

@app.route('/')
def home():
    selected_date = request.args.get('date', date.today().isoformat())  # Get date from URL query parameter or default to today

    today_blog = get_blog_by_date(selected_date)

    if today_blog:
        print(f"Blog for {selected_date} already exists!")
    else:
        print(f"No blog found for {selected_date}, showing empty template.")

    return render_template('home.html', today_blog=today_blog, today_date=selected_date)

@app.route('/api/available_dates')
def available_dates():
    today = datetime.date.today().isoformat()
    dates = fetch_blog_dates()  # This function needs to query your database for all unique blog dates
    for date in dates:
        print(date)
    if today not in dates:
        print(today)
        dates.append(today)
    dates.sort(reverse=True)
    
    return jsonify(dates)

@app.route('/api/blog_by_date/<date>', methods=['GET'])
def get_blog_by_date(date):
    blog = fetch_blog_by_date(date)
    if blog.tasks == []:
        blog.tasks.append(Task())
    if blog:
        return jsonify(blog.dict())
    return jsonify({'error': 'Blog not found'}), 404
    
@app.route('/submit-blog', methods=['POST'])
def submit_blog():
    try:
        # Parse the incoming JSON data
        data = request.get_json()

        # Add today's date to the JSON data (assuming 'date' is the primary key)
          # Format as 'YYYY-MM-DD'
        
        # Validate the incoming data using the DailyBlog Pydantic model
        daily_blog = DailyBlog(**data)

        # Log the parsed data for debugging (Optional)
        
        daily_blog.updated_at = datetime.datetime.now()
        print(daily_blog)
        # Perform the upsert operation on the 'daily_blogs' table
        pydantic_upsert(
            table_name="daily_blogs", 
            models=[daily_blog], 
            where_field="date"
        )

        # Return a success response
        return jsonify({"message": "Blog successfully saved!"}), 200

    except ValidationError as e:
        # Handle validation errors from Pydantic
        print(f"Validation Error: {e}")
        return jsonify({"error": "Invalid data", "details": e.errors()}), 400

    except Exception as e:
        # Handle other exceptions
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred while saving the blog"}), 500

    

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):  # Implement this function to check file extensions
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        # Return a URL that can be accessed from the client
        return jsonify({'path': url_for('static', filename='uploads/' + filename)})
    return jsonify({'error': 'Failed to upload image'}), 400


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    # This function will return True if file extension is allowed
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS




def fetch_blog_dates():
    # Example SQL query to fetch all unique blog dates
    results: List[DailyBlog] = pydantic_select(f"SELECT * FROM daily_blogs ORDER BY date DESC;", modelType=DailyBlog)
    
    return [result.date.isoformat() for result in results]

def fetch_blog_by_date(date):
    if date is None:
        date = datetime.date.today().isoformat()
    # Fetch a blog by its date
    results: List[DailyBlog] = pydantic_select(f"SELECT * FROM daily_blogs WHERE date='{date}';", modelType=DailyBlog)
    
    if results:
        return results[0]
    if date == datetime.date.today().isoformat():
        empty_blog = DailyBlog(date=datetime.date.today().isoformat())
        return empty_blog
    return None

if __name__ == '__main__':
    app.run(debug=True)
