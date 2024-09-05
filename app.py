from flask import Flask, render_template, request, redirect, url_for
from datetime import date
from werkzeug.utils import secure_filename
from flask import jsonify
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'static/uploads/')

@app.route('/')
def home():
    today_date = date.today().strftime("%B %d, %Y")
    return render_template('home.html', today_date=today_date)

@app.route('/submit-blog', methods=['POST'])
def submit_blog():
    # Parse the incoming JSON data
    data = request.get_json()
    
    # Extract all fields from the JSON object
    daily_goals = data.get('dailyGoals')
    enthusiasm = data.get('enthusiasm')
    burnout = data.get('burnout')
    leetcode_hatred = data.get('leetcodeHatred')
    tasks = data.get('tasks')  # This will be a list of task objects
    daily_reflection = data.get('dailyReflection')
    next_steps = data.get('nextSteps')

    # You can now save this data to your database or process it further
    # For simplicity, let's just print it out
    print(f"Daily Goals: {daily_goals}")
    print(f"Enthusiasm: {enthusiasm}, Burnout: {burnout}, Leetcode Hatred: {leetcode_hatred}")
    print(f"Tasks: {tasks}")
    print(f"Daily Reflection: {daily_reflection}")
    print(f"Next Steps: {next_steps}")

    # Return a success response
    return jsonify({"message": "Blog successfully saved!"}), 200

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
