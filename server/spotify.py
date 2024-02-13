'''
Main web server for SmartSpeaker
'''

# Relevant Imports
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, request, make_response, jsonify
import requests
from base_multi_set import BaseMultiSet
import json


# Globals for Spotify Authentication, these should be passed by env variables
with open('../mobile/config.json', 'r') as config_file:
    config = json.load(config_file)
username = config['SPOTIFY_USERNAME']
clientID = config['SPOTIFY_CLIENT_ID']
clientSecret = config['SPOTIFY_CLIENT_SECRET']
redirectURI = config['SPOTIFY_REDIRECT_URI']
scope = ['user-library-read', 'user-read-currently-playing', 'playlist-read-collaborative']

# Globals to maintain who is subscribed and what songs we can play
subscribed_users = []
songs = BaseMultiSet()
# users_priority = {}

# Initialize Flask app
app = Flask(__name__)


'''
accepts user id and selected songs and adds it to our subscribed users list
expects request body in form
{
    'id': 'sample_id', 
    'priority': 0 or 1
}
'''
@app.route('/new_user', methods=['POST'])
def new_user():
    global songs
    # new_user_priority = request.get_json().get('priority')
    new_user_id = request.get_json().get('id')
    subscribed_users.append(new_user_id)
    # users_priority[new_user_id] = new_user_priority
    return 'User ' + new_user_id + ' signed up'

'''
speaker code will make a request to get Spotify URI for next song to play
'''
@app.route('/get_song', methods=['GET'])
def get_song():
    global songs
    # check if our built playlist is empty
    if len(songs.data) == 0:
        return {}
    # O(1) way to get first element from the set
    song = songs.choose_and_remove()
    lcd_url_route = 'http://' + config['SERVER_HOST'] + ':' + config['LCD_SERVER_PORT'] + '/update_song'
    requests.post(lcd_url_route, json = song)
    return {
        'id': song['id']
    }

'''
Gets the current queue
'''
@app.route('/current_queue', methods=['GET'])
def get_queue():
    global songs
    return {
        'songs': songs.data
    }

'''
Add a song to the queue
'''
@app.route('/current_queue', methods=['POST'])
def add_queue():
    global songs
    # user_id = request.get_json().get('user')
    # priority = int(users_priority[user_id])
    print(request.get_json())
    queued_song = request.get_json()
    new_set = BaseMultiSet()
    new_set.append(queued_song)
    # if priority == 1:
    #     new_set.append(queued_song)
    # intersect = songs.intersection(new_set)
    # if not intersect.length() == 0:
    songs = songs.union(new_set)
    response = make_response()
    response.status_code = 200
    return response

'''
Yield current playing song
'''
@app.route('/currently_playing', methods=['GET'])
def currently_playing():
    current_song = spotifyObject.currently_playing()
    try:
        id = current_song['item']['id']
        title = current_song['item']['name']
        artist = current_song['item']['artists'][0]['name']
        image = current_song['item']['album']['images'][0]['url']
        return {
            'id': id,
            'artist': artist,
            'title': title,
            'image': image
        }
    except:
        return {
            'id': None,
            'artist': None,
            'title': None,
            'image': None
        }


if __name__ == '__main__':

    # Authenticate
    spotifyObject = spotipy.Spotify(auth_manager=SpotifyOAuth(clientID, clientSecret, redirectURI, scope=scope))

    # Start our playlist with owner music
    saved_tracks = spotifyObject.current_user_saved_tracks(limit=5)
    for track in saved_tracks['items']:
        id = track['track']['id']
        title = track['track']['name']
        artist = track['track']['artists'][0]['name']
        image = track['track']['album']['images'][0]['url']
        song = {
            'id': id,
            'title': title,
            'artist': artist,
            'image': image
        }
        songs.append(song)

    # Disallow the owner from reconnecting
    user = spotifyObject.current_user()
    owner_id = user['id']
    subscribed_users.append(owner_id)

    # Start webapp
    app.run(debug=False, host="0.0.0.0", port=config['SERVER_PORT'])
