from flask import Flask, render_template, request, redirect, url_for
import datetime
from datetime import date
from werkzeug.utils import secure_filename
from flask import jsonify
import os
from pydantic import ValidationError
from pydanticModels import DailyBlog, Task
from utilityFunctions import pydantic_upsert, pydantic_select
from typing import List, Optional

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'static/uploads/')

@app.route('/')
def home():
    today_date = date.today().strftime("%B %d, %Y")
    today_blog = get_blog_for_today()
    today_date = "TEST"

    if today_blog:
        print(f"Today's blog already exists!")
        # If today's blog exists, pass its data to the template
        return render_template('home.html', today_blog=today_blog, today_date=today_date)
    else:
        # If no blog exists for today, pass empty data
        return render_template('home.html', today_blog=None, today_date=today_date)
   

@app.route('/api/today_blog')
def get_today_blog():
    today_blog = get_blog_for_today()

    if today_blog:
        return jsonify(today_blog.dict())
    else:
        return jsonify(None), 200
    
def get_blog_for_today() -> Optional[DailyBlog]:
    today = date.today().isoformat()

    # Connect to the PostgreSQL database (adjust connection parameters as needed)
    results: List[DailyBlog] = pydantic_select(f"SELECT * FROM daily_blogs WHERE date = '{today}';", modelType=DailyBlog)



    if len(results) > 0:
        # Assuming your table structure matches the Pydantic model (adjust as needed)
        return results[0]
    else:
        # Return None if no blog entry for today is found
        return None
    
@app.route('/submit-blog', methods=['POST'])
def submit_blog():
    try:
        # Parse the incoming JSON data
        data = request.get_json()

        # Add today's date to the JSON data (assuming 'date' is the primary key)
        data['date'] = date.today().isoformat()  # Format as 'YYYY-MM-DD'

        # Validate the incoming data using the DailyBlog Pydantic model
        daily_blog = DailyBlog(**data)

        # Log the parsed data for debugging (Optional)
        print(f"Parsed DailyBlog: {daily_blog}")
        daily_blog.updated_at = datetime.datetime.now()
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

    except ValidationError as e:
        # If the data is not valid, return an error response
        print(f"Validation Error: {e}")
        return jsonify({"error": "Invalid data", "details": e.errors()}), 400

    except Exception as e:
        # Catch all other exceptions and return a server error response
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

if __name__ == '__main__':
    app.run(debug=True)
