'''
Main Webserver to for Smart Speaker
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
users_priority = {}

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
    new_user_priority = request.get_json().get('priority')
    new_user_id = request.get_json().get('id')
    subscribed_users.append(new_user_id)
    users_priority[new_user_id] = new_user_priority
    return 'User ' + new_user_id + ' signed up'

'''
speaker code will make a request to get Spotify URI for next song to play
'''
@app.route('/get_song', methods=['GET'])
def get_song():
    global songs
    # check if our built playlist is empty
    if len(songs.data) == 0:
        return 'Playlist is empty'
    # O(1) way to get first element from the set
    element = songs.choose_and_remove()
    track = spotifyObject.track(element)
    track_name = track.get('name')
    artist_name = track.get('artists')[0].get('name')
    image_url = track['album']['images'][0]['url']
    lcd_url_route = 'http://' + config['SERVER_HOST'] + ':' + config['LCD_SERVER_PORT'] + '/update_song'
    song_data = {
        'artist': artist_name, 
        'title': track_name,
        'image_url': image_url
    }
    r = requests.post(lcd_url_route, json = song_data)
    return str(element)

'''
End point on Griffin's request
Returns list of songs in queue
'''
@app.route('/current_queue', methods=['GET'])
def current_queue():
    resp_list = []
    for song_id in songs.data:
        resp_list.append({'id': song_id})
    response = make_response(
        jsonify(
            {'songs': resp_list}
        )
    )
    return response

'''
Add a song to the queue
'''
@app.route('/current_queue', methods=['POST'])
def current_queue_post():
    global songs
    user_id = request.get_json().get('user_id')
    priority = int(users_priority[user_id])
    queued_song = request.get_json().get('id')
    new_set = BaseMultiSet()
    new_set.append(queued_song)
    # if priority == 1:
    #     new_set.append(queued_song)
    # intersect = songs.intersection(new_set)
    # if not intersect.length() == 0:
    songs = songs.union(new_set)
    message = 'Song added successfully!'
    # else:
        # message = 'Error'

    response = make_response(
        jsonify(
            {'status': '200', 'message': message}
            )
    )
    return response

'''
Yield current playing song id
'''
@app.route('/currently_playing', methods=['GET'])
def currently_playing():
    current_song = spotifyObject.currently_playing()
    try:
        song_name = current_song['item']['name']
        artist = current_song['item']['artists'][0]['name']
        image_url = current_song['item']['album']['images'][0]['url']
        response = make_response(
        jsonify(
            {
                'artist': artist,
                'name': song_name,
                'image_url': image_url}
            )
        )
        return response
    except:
        response = make_response(
        jsonify(
            {
                'artist': None,
                'name': None,
                'image_url': None}
            )
        )
        return response


if __name__ == '__main__':

    # Authenticate
    spotifyObject = spotipy.Spotify(auth_manager=SpotifyOAuth(clientID, clientSecret, redirectURI, scope=scope))

    # Start our playlist with owner music
    saved_tracks = spotifyObject.current_user_saved_tracks(limit=5)
    for item in saved_tracks['items']:
        song_id = item['track']['id']
        songs.append(song_id)

    # Disallow the owner from reconnecting
    user = spotifyObject.current_user()
    owner_id = user['id']
    subscribed_users.append(owner_id)

    # Start webapp
    app.run(debug=False, host="0.0.0.0", port=config['SERVER_PORT'])
