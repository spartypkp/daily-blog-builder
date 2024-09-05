from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/submit-blog', methods=['POST'])
def submit_blog():
    task = request.form['task']
    description = request.form['description']
    # Here you might handle saving to the database or processing the input
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
