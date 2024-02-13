import requests
import json

with open('../mobile/config.json', 'r') as config_file:
    config = json.load(config_file)

HOST = config['SERVER_HOST']
PORT = config['SERVER_PORT']

input("Query Current Queue")
url = f'http://{HOST}:{PORT}/current_queue'
r = requests.get(url)
print(r.json().get('songs'))

input("Add a base user")
url = f'http://{HOST}:{PORT}/new_user'
data = {
    'id': 'base_user', 
    'priority': 0,
}
r = requests.post(url=url, json=data)

input("Add a priority user")
url = f'http://{HOST}:{PORT}/new_user'
data = {
    'id': 'priority_user', 
    'priority': 1,
}
r = requests.post(url=url, json=data)

input("Let priority user request a song")
url = f'http://{HOST}:{PORT}/current_queue'
data = {
    'user_id': 'priority_user',
    'id': 'spotify:track:1SKkHYkGqhadpciJKXfRhU'
}
r = requests.post(url, json=data)

input("Query Current Queue to see that the requested song now appears three time")
url = f'http://{HOST}:{PORT}/current_queue'
r = requests.get(url)
print(r.json().get('songs'))

input("Let basic user request a song")
url = f'http://{HOST}:{PORT}/current_queue'
data = {
    'user_id': 'base_user',
    'id': 'spotify:track:6r9xnueU24r4eoG3HXC87E'
}
r = requests.post(url, json=data)

input("Query Current Queue to see that the requested song now appears two time")
url = f'http://{HOST}:{PORT}/current_queue'
r = requests.get(url)
print(r.json().get('songs'))