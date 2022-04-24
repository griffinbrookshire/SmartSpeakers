from flask import Flask, render_template, request, redirect, url_for
from turbo_flask import Turbo
import datetime
app = Flask(__name__)
turbo = Turbo(app)

title = 'Not Playing'
artist = '----'

@app.route('/update_song', methods=["POST"])
def update_song():
    global title, artist
    title = request.get_json().get('title')
    artist = request.get_json().get('artist')
    print(title + " " + artist)
    #turbo.push(turbo.update(render_template('index.html', title = title,  artist = artist)))
    requests.get('0.0.0.0:5000/')
    return 'success'

@app.route('/')
def root():
    global title, artist;
    return render_template('index.html', title = title, artist = artist)

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0")

