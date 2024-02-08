# SmartSpeakers
An adaptable music player that enables businesses to better cater to their customers music tastes.

Requires 
1 Laptop Computer
2 Raspberry Pis
1 Amazon Alexa Echo
Spotify Account with Developer Credentials
Mobile Device with Expo Go Installed

To run mobile app, follow instructions provided in the README.md in the mobile folder

Edit mobile/config.json, speaker.py, spotify.py, and screens/loginScreen.js to include your custom Expo account info and spotify credentials
Make sure to use HOST like 192.x.x.x in config.json

Install the following dependencies using pip on all devices.
spotipy
flask
argparse
requests
turbo_flask
Use 
pip3 install -r requirements.txt
to accomplish this

Open up Spotify on a computer connected to your Alexa speaker.

Run the following commands on all the devices
python3 lcd_screen.py
python3 spotify.py -a <address of lcd screen.py microservice>
python3 speaker.py -a <address of spotify.py microservice>

Follow instructions in mobile/ for starting and using the React Native app

To ensure proper functionality, run test.py and make sure everything passes.