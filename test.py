import requests

url = 'http://0.0.0.0:5000/update_song'
data = {
    'image_url': 'https://i.scdn.co/image/ab67616d0000b2730f8975afd519403248e96725',
    'artist': 'DaBaby',
    'title': 'Bestie'
}
r = requests.post(url, json=data)


input("Query Current Queue")
url = 'http://0.0.0.0:5000/current_queue'
r = requests.get(url)
print(r.json().get('songs'))

input("Add a base user")
url = 'http://0.0.0.0:5000/new_user'
data = {
    'id': 'base_user', 
    'priority': 0,
}
r = requests.post(url=url, json=data)

input("Add a priority user")
url = 'http://0.0.0.0:5000/new_user'
data = {
    'id': 'priority_user', 
    'priority': 1,
}
r = requests.post(url=url, json=data)

input("Let priority user request a song")
url = 'http://0.0.0.0:5000/current_queue'
data = {
    'user_id': 'priority_user',
    'id': 'spotify:track:1SKkHYkGqhadpciJKXfRhU'
}
r = requests.post(url, json=data)

input("Query Current Queue to see that the requested song now appears three time")
url = 'http://0.0.0.0:5000/current_queue'
r = requests.get(url)
print(r.json().get('songs'))

input("Let basic user request a song")
url = 'http://0.0.0.0:5000/current_queue'
data = {
    'user_id': 'base_user',
    'id': 'spotify:track:6r9xnueU24r4eoG3HXC87E'
}
r = requests.post(url, json=data)

input("Query Current Queue to see that the requested song now appears two time")
url = 'http://0.0.0.0:5000/current_queue'
r = requests.get(url)
print(r.json().get('songs'))