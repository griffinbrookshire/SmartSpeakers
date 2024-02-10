'''
Controls the speaker, makes REST calls to spotify.py webservice
'''

# Imports
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.exceptions import SpotifyException
import time
import requests
import json


# Globals for Spotify Authentication, these should be passed by env variables
with open('../mobile/config.json', 'r') as config_file:
    config = json.load(config_file)
username = config['SPOTIFY_USERNAME']
clientID = config['SPOTIFY_CLIENT_ID']
clientSecret = config['SPOTIFY_CLIENT_SECRET']
redirectURI = config['SPOTIFY_REDIRECT_URI']
scope = ['user-library-read', 'user-read-currently-playing', 'playlist-read-collaborative', 'user-modify-playback-state']


if __name__ == '__main__':
    
    # Build server url
    url = 'http://' + config['SERVER_HOST'] + ":" + config['SERVER_PORT'] + '/get_song'

    # Authenticate
    spotifyObject = spotipy.Spotify(auth_manager=SpotifyOAuth(clientID, clientSecret, redirectURI, scope=scope))
    
    # Enter loop to control speaker
    while (True):
        currently_playing = spotifyObject.currently_playing()
        if currently_playing and 'is_playing' in currently_playing and currently_playing['is_playing']:
            title = currently_playing['item']['name']
            artist = currently_playing['item']['artists'][0]['name']
            is_playing = currently_playing['is_playing']
            print(f"Playing {title} by {artist}")
        else:
            print("Not Playing. Getting next song from queue.")
            r = requests.get(url)
            song_id = r.text
            try:
                spotifyObject.start_playback(uris = [song_id])
            except (SpotifyException) as se:
                print("\n\nSpotify exception:")
                print(se)
            except (Exception) as e:
                print("\n\nNon Spotify exception:")
                print(e)
        time.sleep(3)
