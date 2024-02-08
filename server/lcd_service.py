from flask import Flask, render_template, request, redirect, url_for
from turbo_flask import Turbo
import datetime
app = Flask(__name__)
turbo = Turbo(app)

title = 'Not Playing'
artist = '----'
image_url = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'

@app.route('/update_song', methods=["POST"])
def update_song():
    global title, artist, image_url
    title = request.get_json().get('title')
    artist = request.get_json().get('artist')
    image_url = request.get_json().get('image_url')
    print(title + " " + artist)
    turbo.push(turbo.update(render_template('data.html', title = title, artist = artist, image_url = image_url), 'data'))
    return 'success'

@app.route('/')
def root():
    return render_template('index.html', title = title, artist = artist, image_url = image_url)

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0")

