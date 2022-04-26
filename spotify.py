'''
Main Webserver to for Smart Speaker
'''


# Relevant Imports
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, request, make_response, jsonify
import argparse 
import requests
from base_multi_set import BaseMultiSet

# Globals for Spotify Authentication, these should be passed by env variables
username = 'USERNAME'
clientID = 'CLIENT ID'
clientSecret = 'CLIENT SECRET'
redirectURI = 'http://google.com/'
scope = ["user-library-read", "user-read-currently-playing", "playlist-read-collaborative"]


# Globals to maintain who is subscribed and what songs we can play
subscribed_users = []
songs = BaseMultiSet()
owners_songs = BaseMultiSet()
users_priority = {}

# Route for the POST request
route = '/update_song'

app = Flask(__name__)

'''
accepts user id and selected songs and adds it to our subscribed users list
expects request body in form
{
    'id': 'sample_id', 
    'priority': 0 or 1
}
'''
@app.route('/new_user', methods=["POST"])
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
@app.route('/get_song', methods=["GET"])
def get_song():
    global songs
    # check if our built playlist is empty
    if len(songs.data) == 0:
        return "Playlist is empty"
    # O(1) way to get first element from the set
    element = songs.choose_and_remove()
    track = spotifyObject.track(element)
    track_name = track.get('name')
    artist_name = track.get('artists')[0].get('name')
    image_url = track['album']['images'][0]['url']
    lcd_url_route = 'http://' + args.address + ":" + args.port + route
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
@app.route('/current_queue', methods=["GET"])
def current_queue():
    if len(songs.data) == 0:
        return "No songs in queue."
    resp_list = []
    for i, song in enumerate(list(songs.data)):
        resp_list.append({'id': str(i), 'title': song})
    response = make_response(
        jsonify(
            {
                'songs': resp_list}
            )
    )
    return response

'''
Add a song to the queue
'''
@app.route('/current_queue', methods=["POST"])
def current_queue_post():
    global songs
    user_id = request.get_json().get('user_id')
    priority = int(users_priority[user_id])
    queued_song = request.get_json().get('id')
    new_set = BaseMultiSet()
    new_set.append(queued_song)
    if not priority == 0:
        new_set.append(queued_song)
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
@app.route('/currently_playing', methods=["GET"])
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
    # cli args
    parser = argparse.ArgumentParser(description = 'Main service command parser')
    parser.add_argument('-a', '--address', default = '0.0.0.0', help = "The ip address of the lcd screen")
    parser.add_argument('-p', '--port', default = '5000', help = "The port of the lcd screen")
    args = parser.parse_args()
    
    address = args.address
    port = args.port
    
    # Authenticate
    spotifyObject = spotipy.Spotify(auth_manager=SpotifyOAuth(clientID,clientSecret,redirectURI, scope = scope ))

    # Start our playlist with owner music
    saved_tracks = spotifyObject.current_user_saved_tracks(limit=5)
    for item in saved_tracks['items']:
        song_uri = item['track']['uri']
        songs.append(song_uri)
        owners_songs.append(song_uri)

    # Disallow the owner from reconnecting
    user = spotifyObject.current_user()
    owner_id = user['id']
    subscribed_users.append(owner_id)

    # Start webapp
    app.run(debug=False, host="0.0.0.0")