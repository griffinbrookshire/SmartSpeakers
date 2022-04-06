import spotipy
from spotipy.oauth2 import SpotifyOAuth
import json
import webbrowser
from flask import Flask, request

username = 'teamtopdeck9000'
clientID = '5f1b546e2c084571baf1f8b1d81988aa'
clientSecret = '8c861ad1693248e6a8d1439e987a3339'
redirectURI = 'http://google.com/'

scope = ["user-library-read", "user-read-currently-playing", "playlist-read-collaborative"]

subscribed_users = []
songs = set()


app = Flask(__name__)

@app.route('/')
def helloworld():
    return 'hello world'


'''
accepts user id and adds it to our subscribed users list
expects request body in form
{
    id: "sample_id"
}
'''
@app.route('/new_user', methods=["POST"])
def new_user():
    new_user_id = request.form.get('id')
    new_user_songs = request.form.get('songs')
    print(new_user_songs)
    if not new_user_id in subscribed_users and not new_user_id == None:
        subscribed_users.append(new_user_id)
        return "success"
    print(subscribed_users)
    print(songs)
    return "failure"

if __name__ == '__main__':
    # Create OAuth Object
    spotifyObject = spotipy.Spotify(auth_manager=SpotifyOAuth(clientID,clientSecret,redirectURI, scope = scope ))

    user = spotifyObject.current_user()# To print the response in readable format.
    saved_tracks = spotifyObject.current_user_saved_tracks()
    for item in saved_tracks['items']:
        song_uri = item['track']['uri']
        songs.add(song_uri)

    owner_id = user['id']
    subscribed_users.append(owner_id)

    

    app.run(debug=True, host="0.0.0.0")