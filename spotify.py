'''
Main Webserver to for Smart Speaker
'''


# Relevant Imports
import json
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, request, make_response, jsonify
import argparse 
import requests
from multiset import *
from song import Song

# Globals for Spotify Authentication, these should be passed by env variables
username = 'teamtopdeck9000'
clientID = '5f1b546e2c084571baf1f8b1d81988aa'
clientSecret = '8c861ad1693248e6a8d1439e987a3339'
redirectURI = 'http://google.com/'
scope = ["user-library-read", "user-read-currently-playing", "playlist-read-collaborative"]


# Globals to maintain who is subscribed and what songs we can play
subscribed_users = []
songs = Multiset()
owners_songs = Multiset()
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
    'songs': ['spotify:track:27NovPIUIRrOZoCHxABJwK', 'spotify:track:6pmNoWKk0r6zfIjWneJRxR']
}
'''
@app.route('/new_user', methods=["POST"])
def new_user():
    global songs
    new_user_priority = request.get_json().get('priority')
    new_user_id = request.get_json().get('id')
    new_user_songs = request.get_json().get('songs')
    object_songs = []
    for new_song in new_user_songs: 
        object_songs.append(Song(new_song))
    if not new_user_id in subscribed_users and not new_user_id == None:
        subscribed_users.append(new_user_id)
        users_priority[new_user_id] = new_user_priority
        new_set = Multiset(object_songs)
        if new_user_priority == 2:
            new_set = new_set.combine(new_set)
        temp_songs = owners_songs.intersection(new_set)
        songs = temp_songs.combine(songs)
        return "Connected Successfully"
    
    return "A Problem Occurred"

'''
speaker code will make a request to get Spotify URI for next song to play
'''
@app.route('/get_song', methods=["GET"])
def get_song():
    global songs
    for song in songs:
        track = spotifyObject.track(song.song_id)
        print(track.get('name'))
    # check if our built playlist is empty
    if len(songs) == 0:
        return "Playlist is empty"
    # O(1) way to get first element from the set
    for element in songs:
        break
    current_list = list(songs)
    for song in current_list:
        if song.song_id == element.song_id:
            current_list.remove(song)
    songs = Multiset(current_list)
    track = spotifyObject.track(element.song_id)
    track_name = track.get('name')
    artist_name = track.get('artists')[0].get('name')
    lcd_url_route = 'http://' + args.address + ":" + args.port + route
    song_data = {
        'artist': artist_name, 
        'title': track_name
    }
    r = requests.post(lcd_url_route, json = song_data)
    return str(element.song_id)

'''
End point on Griffin's request
Returns list of songs in queue
'''
@app.route('/current_queue', methods=["GET"])
def current_queue():
    if len(songs) == 0:
        return "No songs in queue."
    resp_list = []
    for i, song in enumerate(list(songs)):
        resp_list.append({'id': str(i), 'title': song.song_id})
    response = make_response(
        jsonify(
            {
                'songs': resp_list}
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
    saved_tracks = spotifyObject.current_user_saved_tracks()
    for item in saved_tracks['items']:
        song_uri = item['track']['uri']
        song = Song(song_uri)
        songs.add(song)
        owners_songs.add(song)

    # Disallow the owner from reconnecting
    user = spotifyObject.current_user()
    owner_id = user['id']
    subscribed_users.append(owner_id)

    # Start webapp
    app.run(debug=False, host="0.0.0.0")