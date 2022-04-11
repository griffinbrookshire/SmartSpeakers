from flask import Flask, request

app = Flask(__name__)

@app.route('/update_song', methods=["POST"])
def update_song():
    title = request.get_json().get('title')
    artist = request.get_json().get('artist')
    print(title + " " + artist)
    return 'success'


if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0")