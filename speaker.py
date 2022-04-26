'''
Controls the speaker, makes REST calls to spotify.py webservice
'''

# Imports
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import time
import requests
import argparse 


# Globals for Spotify Authentication, these should be passed by env variables
username = 'USERNAME'
clientID = 'CLIENT_ID'
clientSecret = 'CLIENT_SECRET'
redirectURI = 'http://google.com/'
scope = ['app-remote-control', 'streaming', 'user-read-playback-state', 'user-modify-playback-state']

# Route for the GET request
route = '/get_song'


if __name__ == '__main__':
    # get cli arguments
    parser = argparse.ArgumentParser(description = 'Speaker command parser')
    parser.add_argument('-a', '--address', default = '0.0.0.0', help = "The ip address of the server")
    parser.add_argument('-p', '--port', default = '5000', help = "The port of the server")
    args = parser.parse_args()


    url = 'http://' + args.address + ":" + args.port + route
    # Authenticate
    spotifyObject = spotipy.Spotify(auth_manager=SpotifyOAuth(clientID,clientSecret,redirectURI, scope = scope ))
    
    # Enter loop to control speaker
    while(True):
        time.sleep(1)
        is_playing = spotifyObject.currently_playing().get('is_playing')
        if is_playing:
            print("Playing")
        else:
            print("Not Playing")
            # make get request to server
            r = requests.get(url)
            song_id = r.text
            spotifyObject.start_playback(uris = [song_id])